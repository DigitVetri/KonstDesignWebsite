import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SK_LEN } from './RoomDrawing.jsx'
import { attachScrubber } from '../lib/videoScrubber.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SCROLL IS THE ONLY TIMELINE
 * ─────────────────────────────────────────────────────────────────────────────
 *  One paused timeline, 100 units long, scrubbed 1:1 by the scrollbar. There
 *  is no `repeat`, no `delay`, no `setInterval`, and no tween anywhere in this
 *  file that can advance on its own — `scrub: true` (not a number) means the
 *  playhead is the scroll position, so stopping mid-stroke freezes mid-stroke
 *  and scrolling back retracts everything through the identical path.
 *
 *  The budget, in timeline units:
 *
 *     0 – 20   the pen draws the room
 *    20 – 35   the completed drawing flies LEFT → CENTRE → RIGHT
 *    35 – 70   the same lines gain surface, depth and shadow
 *    70 – 80   the completed empty room flies RIGHT → CENTRE → LEFT
 *    80 – 100  the real interior film, its playhead tied to the same scroll
 *
 *  Each stage is finished before the next one is allowed to begin: no range
 *  below overlaps a range in another stage.
 */

const TOTAL = 100

/** How far the visual sits off-centre, as a percentage of its own width. */
const OFF = 52

/** Which axis a clip sweep opens along, and the edge it opens from. */
const AXIS = { left: 'scaleX', right: 'scaleX', top: 'scaleY', bottom: 'scaleY' }
const ORIGIN = { left: '0% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' }

export function useAboutTimeline(scopeRef, { mobile, enabled = true }) {
  useLayoutEffect(() => {
    const root = scopeRef.current
    if (!root || !enabled) return

    const ctx = gsap.context((self) => {
      const q = (sel) => self.selector(sel)
      const fly = q('[data-fly]')[0]
      const cleanups = []

      /* ── initial state ────────────────────────────────────────────────
         Set here rather than in the markup so the timeline owns every value
         it will later interpolate — nothing can be half-initialised. */
      gsap.set(q('[data-sk]'), { strokeDashoffset: SK_LEN })
      gsap.set(q('[data-a]'), { opacity: 0 })
      gsap.set(q('[data-layer="furniture"] > [data-a], [data-layer="decor"] > [data-a]'), { y: 16 })
      gsap.set(q('[data-layer="sketch"]'), { opacity: 1, stroke: '#ede7de' })

      q('[data-clip]').forEach((rect) => {
        gsap.set(rect, { transformOrigin: ORIGIN[rect.dataset.from], [AXIS[rect.dataset.from]]: 0 })
      })

      const side = mobile ? 0 : OFF
      gsap.set(fly, { xPercent: -side, yPercent: 0, scale: 1 })
      gsap.set(q('[data-panel]'), { opacity: 0, y: 18 })
      gsap.set(q('[data-panel="1"]'), { opacity: 1, y: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true, // true, never a number — a number keeps moving after you stop
          invalidateOnRefresh: true,
        },
      })

      /** Wipe a clip rect open between two timeline positions. */
      const sweep = (id, from, to) => {
        const rect = q(`[data-clip="${id}"]`)[0]
        if (!rect) return
        tl.to(rect, { [AXIS[rect.dataset.from]]: 1, duration: to - from }, from)
      }

      /** Draw (or retract) one named group of pen strokes, stroke by stroke. */
      const ink = (group, from, to, offset = 0) => {
        const els = q(`[data-sk="${group}"]`)
        if (!els.length) return
        const span = to - from
        const each = els.length > 1 ? (span * 0.55) / (els.length - 1) : 0
        tl.to(
          els,
          { strokeDashoffset: offset, duration: span - each * (els.length - 1), stagger: each },
          from,
        )
      }

      /** Bring one interior element in — opacity and a short settle, no more. */
      const show = (name, from, to, opacity = 1) => {
        const els = q(`[data-a="${name}"]`)
        if (!els.length) return
        const span = to - from
        const each = els.length > 1 ? (span * 0.6) / (els.length - 1) : 0
        tl.to(
          els,
          { opacity, y: 0, duration: span - each * (els.length - 1), stagger: each },
          from,
        )
      }

      /* ═══ STAGE 1 · the pen draws the room ═══════════════════════════ */
      ink('ref', 0, 2.2) // one reference line, growing from one point to the other
      ink('floor', 2.2, 5.0) // floor perspective lines extend
      ink('back', 5.0, 8.4) // corner → top edge → full rectangle
      ink('walls', 8.4, 10.8) // side walls, from the architectural corners
      ink('ceil', 10.8, 12.2) // the volume closes
      ink('win', 12.2, 15.0) // outer frame → inner → divisions → sill
      ink('door', 15.0, 16.8) // frame → panel → handle
      ink('detail', 16.8, 18.6) // niches, cove, skirting, built-ins
      ink('loose', 18.6, 20.0) // loose furniture placeholders

      /* ═══ TRANSITION 1 · the completed drawing flies ═════════════════ */
      /*  The drawing itself travels — nothing fades, and the travel is tied
          1:1 to scroll, so half the scroll is half the distance.          */
      tl.to(fly, { xPercent: 0, duration: 7.5 }, 20)
        .to(fly, { xPercent: side, duration: 7.5 }, 27.5)
        .to(fly, { scale: mobile ? 0.94 : 0.9, yPercent: mobile ? -4 : -3, duration: 7.5 }, 20)
        .to(fly, { scale: 1, yPercent: 0, duration: 7.5 }, 27.5)
      tl.to(q('[data-panel="1"]'), { opacity: 0, y: -18, duration: 5 }, 20)
        .to(q('[data-panel="2"]'), { opacity: 1, y: 0, duration: 5.5 }, 29)

      /* ═══ STAGE 2 · the drawing becomes architecture ═════════════════ */
      ink('loose', 35, 41, SK_LEN) // an empty room is empty: placeholders retract
      sweep('sw-floor', 35, 39.5) // floor lines become a floor plane
      sweep('sw-wallL', 38.5, 43.5) // wall lines become wall surfaces …
      sweep('sw-wallR', 39.2, 44.2) // … at the positions they already occupy
      sweep('sw-wallB', 42.5, 46.5)
      sweep('sw-ceil', 45.5, 49)
      show('a-corners', 46, 51) // corners gain depth
      show('a-winreveal', 48, 53.5) // the opening gains a reveal …
      show('a-glass', 51, 55, 0.82) // … then glass
      show('a-door', 53, 57.5)
      show('a-niche', 56, 60.5)
      show('a-trim', 58, 63)
      show('a-shadow', 61, 66)
      // the pen line stops being a drawing and becomes the room's own edge
      tl.to(q('[data-layer="sketch"]'), { stroke: '#cdc6bb', opacity: 0.62, duration: 8 }, 62)

      /* ═══ TRANSITION 2 · the completed empty room flies ══════════════ */
      tl.to(fly, { xPercent: 0, duration: 5 }, 70)
        .to(fly, { xPercent: -side, duration: 5 }, 75)
        .to(fly, { scale: mobile ? 0.94 : 0.9, yPercent: mobile ? -4 : -3, duration: 5 }, 70)
        .to(fly, { scale: 1, yPercent: 0, duration: 5 }, 75)
      tl.to(q('[data-panel="2"]'), { opacity: 0, y: -18, duration: 4 }, 70)
        .to(q('[data-panel="3"]'), { opacity: 1, y: 0, duration: 4 }, 76)

      /* ═══ STAGE 3 · the real interior ════════════════════════════════
         The artificial interior that used to be drawn here is gone. What
         happens now is that the finished shell dissolves into an actual film
         of the room, in the same frame, and that film's playhead is this same
         scrubbed timeline — so it runs forward as the reader scrolls down,
         backward as they scroll up, and freezes the instant they stop.

         It is never played: no `autoplay`, no `loop`, no controls, and
         `play()` is never called anywhere. The only thing that moves it is
         the number below. */
      const film = q('[data-interior]')[0]
      if (film) {
        const scrub = attachScrubber(film)
        cleanups.push(scrub.dispose)

        /* the shell simply becomes the film — a plain crossfade, nothing
           layered on top of it */
        tl.to(film, { opacity: 1, duration: 5, ease: 'none' }, 80)

        /* and the film runs across the whole of stage 3, 1:1 with scroll */
        const head = { t: 0 }
        tl.to(
          head,
          { t: 1, duration: TOTAL - 80, ease: 'none', onUpdate: () => scrub.seek(head.t) },
          80,
        )
      }

      /* the rail, and the three stage ticks */
      tl.fromTo(q('[data-rail-fill]'), { scaleY: 0 }, { scaleY: 1, duration: TOTAL }, 0)
      tl.to(q('[data-tick="1"]'), { opacity: 1, duration: 2 }, 0)
        .to(q('[data-tick="1"]'), { opacity: 0.3, duration: 3 }, 24)
        .to(q('[data-tick="2"]'), { opacity: 1, duration: 3 }, 30)
        .to(q('[data-tick="2"]'), { opacity: 0.3, duration: 3 }, 72)
        .to(q('[data-tick="3"]'), { opacity: 1, duration: 3 }, 77)

      // The timeline is exactly TOTAL long whatever the last tween ended at,
      // so the scroll budget above stays honest.
      tl.set({}, {}, TOTAL)

      return () => cleanups.forEach((fn) => fn())
    }, scopeRef)

    return () => ctx.revert()
  }, [scopeRef, mobile, enabled])
}
