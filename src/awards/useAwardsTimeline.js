import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE AWARDS PASS — the Services pin, applied to a pile of photographs
 * ─────────────────────────────────────────────────────────────────────────────
 *  Deliberately the same mechanism as `useServicesTimeline`, because it is the
 *  same idea: a panel pinned by ScrollTrigger, one timeline scrubbed 1:1 by the
 *  scrollbar (`scrub: true`, never a number), `gsap.matchMedia` to pace the
 *  pass differently on touch, `invalidateOnRefresh` so a resize re-measures,
 *  and the shared progress rail driven from this same trigger's own `progress`
 *  so the marker can never drift from the content. Nothing autoplays; there
 *  are no next/prev controls; the only input is the browser's own scroll.
 *
 *  Where Services translates one long row, this rotates three photographs
 *  through three positions in a pile: whichever award is current sits square
 *  on top, and the other two lean out behind it. Over each transition every
 *  photograph moves up one place, the outgoing one falling to the back, while
 *  the title block and the watermark numeral swap with it.
 *
 *  The budget below is in timeline units: each award HOLDs, then CROSSes to
 *  the next. The scroll distance the pin occupies is derived from the number
 *  of transitions, not hard-coded to a pixel count.
 */

const HOLD = 1
const CROSS = 1.15

/**
 * Screens of vertical scroll per transition.
 *
 * One screen per award change reads as a deliberate page-turn on a pointer
 * device. On touch the same distance is several thumb-flicks per award and
 * starts to feel like the page has stopped responding, so it is paced shorter
 * there — the same judgement, and the same figure, as the Services pass.
 */
const PACE = { desktop: 1, touch: 0.72 }

/** Where a photograph sits when it is Nth from the top of the pile. */
const SLOT = [
  { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3 },
  { xPercent: 6, yPercent: -5, rotate: 4.5, scale: 0.94, opacity: 1, zIndex: 2 },
  { xPercent: -5, yPercent: 5, rotate: -5.5, scale: 0.89, opacity: 1, zIndex: 1 },
]

/** Which slot photograph `j` occupies while award `step` is the current one. */
const slotOf = (j, step, n) => (((j - step) % n) + n) % n

export function useAwardsTimeline(rootRef, panelRef, railRef, markerRef, { enabled = true, count = 3 } = {}) {
  useLayoutEffect(() => {
    const panel = panelRef.current
    const rail = railRef.current
    const marker = markerRef.current

    /* Reduced motion — and any viewport too short to pin into — renders the
       plain stacked list instead, a different subtree entirely, so there is
       nothing here to build. */
    if (!enabled || !panel || !rail || !marker) return

    const steps = Math.max(1, count - 1)
    const mm = gsap.matchMedia(rootRef)

    const build = (pace) => {
      const photos = gsap.utils.toArray(panel.querySelectorAll('[data-award-photo]'))
      const titles = gsap.utils.toArray(panel.querySelectorAll('[data-award-title]'))
      const marks = gsap.utils.toArray(panel.querySelectorAll('[data-award-mark]'))
      if (!photos.length) return

      const n = photos.length

      /* ── the swapping block has to be as tall as its tallest award ──────
         Every title is absolutely positioned in the same place, so the block
         has no height of its own; left to a CSS minimum, the longest of the
         three (award 03, which also carries a secondary line) overruns it and
         collides with whatever sits underneath — the photograph on a phone.
         Measuring the three and reserving the largest is exact at any width,
         and it runs on refreshInit, before start/end are computed, so the pin
         distance is always derived from the settled layout. */
      const stage = panel.querySelector('[data-award-titles]')
      const fitTitles = () => {
        if (!stage) return
        stage.style.minHeight = '0px'
        const tallest = titles.reduce((h, t) => Math.max(h, t.offsetHeight), 0)
        stage.style.minHeight = `${Math.ceil(tallest)}px`
      }
      fitTitles()

      /* The marker slides the rail's full width less its own, so at progress 1
         it sits flush against the last index rather than half past it. */
      const runway = () => Math.max(0, rail.clientWidth - marker.offsetWidth)
      const setMarker = (self) => {
        gsap.set(marker, { x: self.progress * runway() })
      }

      /* opening state: award 01 on top, its title and numeral showing */
      photos.forEach((p, j) => gsap.set(p, SLOT[slotOf(j, 0, n) % SLOT.length]))
      titles.forEach((t, j) => gsap.set(t, { opacity: j === 0 ? 1 : 0, y: j === 0 ? 0 : 20 }))
      marks.forEach((m, j) => gsap.set(m, { opacity: j === 0 ? 1 : 0, y: j === 0 ? 0 : 26 }))

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: panel,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * pace * steps)}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: fitTitles,
          onUpdate: setMarker,
          onRefresh: setMarker,
        },
      })

      for (let k = 0; k < steps; k++) {
        const at = HOLD + k * (HOLD + CROSS)

        /* every photograph moves up one place in the pile */
        photos.forEach((p, j) => {
          const { zIndex, ...place } = SLOT[slotOf(j, k + 1, n) % SLOT.length]
          tl.to(p, { ...place, duration: CROSS, ease: 'power2.inOut' }, at)
          /* z-order is a step, not a slide: it changes once, halfway through,
             which is where the two cards cross. `set` on a scrubbed timeline
             reverses cleanly, so scrolling back restores the old order. */
          tl.set(p, { zIndex }, at + CROSS / 2)
        })

        /* the words and the watermark change with the photograph */
        tl.to(titles[k], { opacity: 0, y: -20, duration: CROSS * 0.45, ease: 'power2.in' }, at)
        tl.to(titles[k + 1], { opacity: 1, y: 0, duration: CROSS * 0.55, ease: 'power2.out' }, at + CROSS * 0.45)
        tl.to(marks[k], { opacity: 0, y: -26, duration: CROSS * 0.45, ease: 'power2.in' }, at)
        tl.to(marks[k + 1], { opacity: 1, y: 0, duration: CROSS * 0.55, ease: 'power2.out' }, at + CROSS * 0.45)
      }

      /* hold the last award for one final beat before the pin releases, so the
         third award is fully read rather than flicking past at the boundary */
      tl.set({}, {}, HOLD + steps * (HOLD + CROSS))
    }

    mm.add('(min-width: 1024px)', () => build(PACE.desktop))
    mm.add('(max-width: 1023.98px)', () => build(PACE.touch))

    /* An orientation change resizes in two steps on several phones, and
       `ignoreMobileResize` (App.jsx) means the address bar's own resize no
       longer refreshes — so the genuine rotation is re-measured explicitly. */
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
  }, [rootRef, panelRef, railRef, markerRef, enabled, count])
}
