import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE GALLERY MOVES ONLY WHEN YOU SCROLL
 * ─────────────────────────────────────────────────────────────────────────────
 *  Exactly the governing principle of the About section next door: one tween,
 *  scrubbed 1:1 by the scrollbar. `scrub: true` (never a number) makes the
 *  scroll position the playhead itself — stop scrolling and the row freezes on
 *  the frame, scroll back and it retraces the identical path. There is no
 *  autoplay, no timer, no carousel, no loop, and no next/prev control: the only
 *  input is the browser's own scroll (wheel, trackpad, touch drag).
 *
 *  The panel is pinned for the length of the pass, so the viewer stays inside
 *  Services — heading held still at the top — while the six photographs travel
 *  right → left underneath it. The moment the sixth has fully arrived the pin
 *  releases and the page continues, untouched, into Quote 03.
 *
 *  The horizontal distance is read from the DOM on every refresh, so the pass
 *  always ends with the sixth card at the right margin whatever the viewport or
 *  the card widths — nothing here is hard-coded to a pixel count. `x` is the
 *  only property animated, and only ever as a transform.
 *
 *  The rail marker is positioned from this same ScrollTrigger's own `progress`,
 *  never from a second measurement, so the two can never drift apart.
 */

/**
 * How much vertical scroll one pixel of horizontal travel costs.
 *
 * On a pointer device 1:1 reads as a direct, physical drag of the row. On
 * touch the same ratio feels long — a phone shows barely more than one card,
 * so the track is several viewport-widths of travel — and a pass that outstays
 * its welcome reads as "the page is stuck". Shortening it there keeps the
 * whole section inside a couple of comfortable thumb-flicks without making the
 * motion feel snatched away.
 */
const PACE = { desktop: 1, touch: 0.72 }

/** Never shrink a card below this, whatever the viewport. */
const MIN_CARD = 208

export function useServicesTimeline(rootRef, panelRef, trackRef, railRef, markerRef, { enabled = true } = {}) {
  useLayoutEffect(() => {
    const panel = panelRef.current
    const track = trackRef.current
    const rail = railRef.current
    const marker = markerRef.current

    /* Reduced motion — and any viewport too short for the pass — gets no pin
       and no scrub at all: the section renders the plain static card layout
       instead, which is a different subtree entirely, so there is nothing
       here to build. */
    if (!enabled || !panel || !track || !rail || !marker) return

    const mm = gsap.matchMedia(rootRef)

    const build = (pace) => {
      const frame = track.parentElement

      /* ── the card has to fit the panel it is pinned inside ──────────────
         The image keeps its 4/3 frame, so card height follows card width —
         and a card taller than the frame would have its description clipped
         under the progress rail. The CSS widths are the intent; this is the
         guarantee. It reads the real heights and, only if the tallest card
         overruns, solves the width back from the height actually available
         (the text block's own height is measured rather than assumed, since
         it grows as the card narrows). Two corrections settle it; the loop
         can only ever shrink, never grow past the CSS width.

         It runs on refreshInit — before start/end are computed — so the
         travel distance is always measured from the final layout. */
      const fit = () => {
        const cards = Array.from(track.children)
        const avail = frame.clientHeight
        if (!avail || !cards.length) return
        track.style.removeProperty('--svc-card-w')
        for (let pass = 0; pass < 3; pass++) {
          const worst = cards.reduce((a, b) => (b.offsetHeight > a.offsetHeight ? b : a))
          if (worst.offsetHeight <= avail) return
          const image = worst.querySelector('.image-button')
          const width = worst.offsetWidth
          const shape = image.offsetHeight / width /* 0.75 — the 4/3 frame */
          const text = worst.offsetHeight - image.offsetHeight
          const next = Math.max(MIN_CARD, Math.floor((avail - text) / shape))
          if (next >= width) return
          track.style.setProperty('--svc-card-w', `${next}px`)
        }
      }

      /* Distance the track must travel for the sixth card to land against the
         right margin: its overflow past the frame, measured fresh each refresh
         so a resize, a font swap or a rotation can never leave it stale. */
      const travel = () => Math.max(0, track.scrollWidth - frame.clientWidth)

      /* The marker slides the rail's full width less its own, so at progress 1
         it sits flush against the "06" end rather than half past it. */
      const runway = () => Math.max(0, rail.clientWidth - marker.offsetWidth)
      const setMarker = (self) => {
        gsap.set(marker, { x: self.progress * runway() })
      }

      gsap.set(track, { x: 0 })
      gsap.set(marker, { x: 0 })
      fit()

      gsap.to(track, {
        x: () => -travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top top',
          end: () => `+=${Math.max(1, Math.round(travel() * pace))}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: fit,
          onUpdate: setMarker,
          onRefresh: setMarker,
        },
      })
    }

    mm.add('(min-width: 1024px)', () => build(PACE.desktop))
    mm.add('(max-width: 1023.98px)', () => build(PACE.touch))

    /* An orientation change resizes in two steps on several phones: the
       dimensions ScrollTrigger reads on the resize event are not always the
       ones the page settles at. `ignoreMobileResize` (set in App.jsx) also
       means the address bar's own resize no longer triggers a refresh, so the
       genuine rotation is re-measured explicitly here. */
    let settle = 0
    const onOrientation = () => {
      clearTimeout(settle)
      settle = setTimeout(() => ScrollTrigger.refresh(), 220)
    }
    window.addEventListener('orientationchange', onOrientation)

    return () => {
      clearTimeout(settle)
      window.removeEventListener('orientationchange', onOrientation)
      mm.revert()
    }
  }, [rootRef, panelRef, trackRef, railRef, markerRef, enabled])
}
