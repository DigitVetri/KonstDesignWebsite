import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE DECK MOVES ONLY WHEN YOU SCROLL
 * ─────────────────────────────────────────────────────────────────────────────
 *  The same governing principle as Services and About: one paused GSAP timeline
 *  scrubbed 1:1 by the scrollbar (`scrub: true`, never a number), pinned by a
 *  sticky child for the length of the pass. Vertical scroll advances a single
 *  continuous `progress` value from 0 to N-1 — the index of the card at centre.
 *
 *  Each card's place on the arc is derived from its distance to `progress`
 *  (`offset = i - progress`): the nearer to zero, the larger, more front-facing
 *  and more forward in depth it sits; the further, the smaller, more rotated
 *  and deeper it recedes. Every card is positioned by transform + opacity only
 *  (GPU-friendly), written once per scrubbed frame — six cards, no layout work.
 *
 *  `onActive(i)` fires only when the rounded centre index actually changes, so
 *  React re-renders the left copy and right index at most N times across a pass,
 *  never per frame.
 */
export function useProjectsDeck(rootRef, deckRef, count, { mobile = false, onActive, onProgress } = {}) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const deck = deckRef.current
    if (!root || !deck) return

    const ctx = gsap.context((self) => {
      const cards = self.selector('[data-proj-card]')

      /* Circular coverflow: the six cards sit on a ring, so the sixth wraps
         back to the first. At any point exactly five are visible — the active
         card at centre with the nearest two on each side (2 + 1 + 2) — and the
         single farthest card (±3) is parked out of sight (correction §11–14). */
      const ANGLE = mobile ? 20 : 32 // rotateY per step (deg)
      const SCALE = 0.22 // scale lost per step — sides stay clearly smaller
      const FADE = 0.34 // opacity lost per step

      /* The fan is measured off the board itself rather than hard-coded, so the
         spread stays proportional at any viewport: wide enough that the sides
         sit apart with real space between them, tight enough that the second
         pair stays on screen — the 2 + 1 + 2 arrangement must always hold. */
      let GAP = 0
      let DEPTH = 0
      const measure = () => {
        const w = deck.offsetWidth || 400
        GAP = w * (mobile ? 0.42 : 0.86)
        DEPTH = w * (mobile ? 0.45 : 0.55)
      }
      measure()

      /* shortest signed distance around a ring of `count` */
      const ring = (d) => {
        while (d > count / 2) d -= count
        while (d <= -count / 2) d += count
        return d
      }

      const st = { p: 0 }
      let lastActive = -1

      const apply = () => {
        const p = st.p
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i]
          const offset = ring(i - p)
          const a = Math.abs(offset)
          const capped = Math.min(a, 2)
          const dir = Math.sign(offset)
          const visible = a <= 2.55
          const x = offset * GAP
          const z = -capped * DEPTH
          const ry = -dir * capped * ANGLE
          const scale = 1 - capped * SCALE
          const opacity = visible ? Math.max(0, 1 - capped * FADE) : 0
          el.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${ry}deg) scale(${scale})`
          el.style.opacity = String(opacity)
          el.style.zIndex = String(1000 - Math.round(capped * 100))
          el.style.pointerEvents = visible ? 'auto' : 'none'
          el.dataset.centre = a < 0.5 ? 'true' : 'false'
        }
        onProgress?.(p)
        const active = ((Math.round(p) % count) + count) % count
        if (active !== lastActive) {
          lastActive = active
          onActive?.(active)
        }
      }

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
            measure() // the board resizes with the viewport; so must the fan
            apply()
          },
        },
      })
      tl.fromTo(st, { p: 0 }, { p: count - 1, duration: 100, onUpdate: apply }, 0)
      tl.set({}, {}, 100)

      /* jump helper for the right-hand index — scrolls so card `i` centres.
         Native smooth scroll (no plugin); ScrollTrigger's scrub follows it. */
      root.__deckTo = (i) => {
        const travel = root.offsetHeight - window.innerHeight
        const y = root.offsetTop + (i / (count - 1)) * travel
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, rootRef)

    return () => {
      if (root) delete root.__deckTo
      ctx.revert()
    }
  }, [rootRef, deckRef, count, mobile, onActive, onProgress])
}
