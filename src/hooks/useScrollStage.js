import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setExperience, getExperience } from '../state/experience.js'
import { mood } from '../motion/DesignTransition.js'
import { bindStage, goTo, indexForProgress, isScrollLocked, SELECTOR_REVEAL_AT } from '../state/controller.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins the hero for the whole stage and turns raw scroll into DISCRETE steps.
 *
 * The choreography is deliberately NOT scrubbed by the scrollbar: crossing a
 * threshold fires the whole staggered transformation and lets it play at its
 * own pace, which is the only way the stagger and the growth read properly.
 * Raw progress is still used for a hair of camera drift so the room stays
 * alive between steps.
 */
export function useScrollStage(stageRef, { enabled }) {
  useEffect(() => {
    const el = stageRef.current
    if (!el || !enabled) return
    bindStage(el)

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        mood.scroll = p
        setExperience({ progress: p })

        if (!getExperience().selectorRevealed && p > SELECTOR_REVEAL_AT) {
          setExperience({ selectorRevealed: true })
        }
        if (isScrollLocked()) return

        const want = indexForProgress(p)
        if (want !== getExperience().target) goTo(want, { source: 'scroll' })
      },
    })

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      st.kill()
    }
  }, [stageRef, enabled])
}
