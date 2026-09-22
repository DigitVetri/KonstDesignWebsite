import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A restrained, once-only reveal for the editorial sections after Projects.
 *
 * Every `[data-reveal]` inside the scope rises a little and fades in when it
 * scrolls into view — transform + opacity only, staggered, on the site's
 * existing ScrollTrigger. It is scroll-driven (nothing autoplays), and it
 * collapses to an instant show under `prefers-reduced-motion`.
 */
export function useScrollReveal(scopeRef, { reduced = false, start = 'top 78%' } = {}) {
  useLayoutEffect(() => {
    const el = scopeRef.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const groups = self.selector('[data-reveal]')
      groups.forEach((group) => {
        const items = group.hasAttribute('data-reveal-self')
          ? [group]
          : gsap.utils.toArray(group.children)
        if (reduced) {
          gsap.set(items, { opacity: 1, y: 0 })
          return
        }
        gsap.set(items, { opacity: 0, y: 26 })
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: group, start, once: true },
        })
      })
    }, scopeRef)
    return () => ctx.revert()
  }, [scopeRef, reduced, start])
}
