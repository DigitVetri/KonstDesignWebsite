import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE GALLERY MOVES ONLY WHEN YOU SCROLL
 * ─────────────────────────────────────────────────────────────────────────────
 *  Exactly the governing principle of the About section next door: one paused
 *  timeline, scrubbed 1:1 by the scrollbar. `scrub: true` (never a number)
 *  makes the scroll position the playhead itself — stop scrolling and the row
 *  freezes on the frame, scroll back and it retraces the identical path. There
 *  is no autoplay, no timer, no carousel, no loop.
 *
 *  The section is pinned by a sticky child for the length of the pass, so the
 *  viewer stays inside Services while the six photographs travel left→right;
 *  when the track has been fully traversed the sticky child scrolls away and
 *  the page continues, untouched, into About Us.
 *
 *  The horizontal distance is read from the DOM at every refresh, so the pass
 *  always ends with the sixth image at the right margin whatever the viewport
 *  or the image widths — nothing here is hard-coded to a pixel count.
 */
export function useServicesTimeline(rootRef, trackRef, { reduced = false } = {}) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const ctx = gsap.context((self) => {
      const q = (sel) => self.selector(sel)
      const panels = q('[data-svc-panel]')
      const container = track.parentElement

      /* distance the track must travel so the last panel lands at the right
         margin: its overflow past the container, read fresh each refresh */
      const travel = () => Math.max(0, track.scrollWidth - container.clientWidth)

      /* each panel's resting centre, in track space — captured on refresh so
         the per-frame prominence pass never has to touch the layout */
      let centres = []
      const measure = () => {
        centres = panels.map((p) => p.offsetLeft + p.offsetWidth / 2)
      }

      const st = { x: 0 }
      const apply = () => {
        track.style.transform = `translate3d(${st.x}px,0,0)`
        if (reduced) return
        const vc = container.clientWidth / 2
        const reach = container.clientWidth * 0.6
        for (let i = 0; i < panels.length; i++) {
          const d = Math.min(1, Math.abs(centres[i] + st.x - vc) / reach)
          panels[i].style.setProperty('--focus', (1 - d).toFixed(3))
        }
      }

      gsap.set(q('[data-svc-head]'), { opacity: 0, y: 22 })
      gsap.set(q('[data-svc-rail-fill]'), { scaleX: 0 })
      measure()
      apply()

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure()
            apply()
          },
        },
      })

      /* heading enters over the first slice — the Home→Services boundary — then
         holds for the rest of the pass */
      tl.to(q('[data-svc-head]'), { opacity: 1, y: 0, duration: 6, stagger: 1.1 }, 0)

      /* the pass itself: the whole 100-unit budget is the left→right travel */
      tl.fromTo(
        st,
        { x: 0 },
        { x: () => -travel(), duration: 100, onUpdate: apply },
        0,
      )

      /* the progress rail fills in lockstep with the travel */
      tl.fromTo(q('[data-svc-rail-fill]'), { scaleX: 0 }, { scaleX: 1, duration: 100 }, 0)

      tl.set({}, {}, 100)
    }, rootRef)

    return () => ctx.revert()
  }, [rootRef, trackRef, reduced])
}
