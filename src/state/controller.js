/**
 * The one place a design change can happen.
 *
 * Scroll steps and button clicks both call `goTo`. Because they share this
 * path — and the store below it — scroll position and the highlighted button
 * cannot disagree about what the room is showing.
 */
import { getExperience, setExperience, clampIndex } from './experience.js'
import { EMPTY_INDEX } from '../data/designs.js'
import { playTransition, applyStateInstantly, onTransition } from '../motion/DesignTransition.js'

/** Eased programmatic scroll. Hand-rolled so the page owns its own scroller. */
let scrollRaf = 0
function smoothScrollTo(y, ms) {
  cancelAnimationFrame(scrollRaf)
  const from = window.scrollY
  const delta = y - from
  if (ms <= 0 || Math.abs(delta) < 1) {
    window.scrollTo(0, y)
    return Promise.resolve()
  }
  const t0 = performance.now()
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  return new Promise((resolve) => {
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms)
      window.scrollTo(0, from + delta * ease(t))
      if (t < 1) scrollRaf = requestAnimationFrame(step)
      else resolve()
    }
    scrollRaf = requestAnimationFrame(step)
  })
}

/**
 * The stage has two beats, not four: the empty shell, and the showcase.
 *
 * Scrolling past this threshold brings the room up in the design the selector
 * is set to — Design 03 until the viewer chooses otherwise — and scrolling
 * back above it strips the room bare again. The other schemes are reached by
 * clicking, never by scrolling past them, so the sequence never reads as a
 * slideshow of all three.
 */
export const SHOWCASE_EDGE = 0.19
/* where the page settles when a design is chosen from the top of the stage */
export const SHOWCASE_ANCHOR = 0.52
export const SELECTOR_REVEAL_AT = 0.055

let stageEl = null
let scrollLock = 0
let reduced = false

export function bindStage(el) {
  stageEl = el
  if (import.meta.env.DEV) window.__konstCtl = { goTo, scrollRangeForStage, stage: () => stageEl }
}
export function setReducedMotion(v) {
  reduced = v
}

export function indexForProgress(p) {
  return p < SHOWCASE_EDGE ? EMPTY_INDEX : getExperience().preferred
}

export function scrollRangeForStage() {
  if (!stageEl) return null
  const top = stageEl.offsetTop
  const travel = stageEl.offsetHeight - window.innerHeight
  return { top, travel: Math.max(1, travel) }
}

/** Move the room to `index`, from wherever it currently is. */
export function goTo(index, { source = 'scroll' } = {}) {
  const next = clampIndex(index)
  const { index: current, progress } = getExperience()
  setExperience({ target: next })

  if (source === 'button') {
    setExperience({ preferred: next })
    // Only travel if the page is still up in the empty-room beat; once you are
    // inside the showcase, switching schemes should not move the page at all.
    const range = scrollRangeForStage()
    if (range && progress < SHOWCASE_EDGE) {
      scrollLock++
      smoothScrollTo(range.top + SHOWCASE_ANCHOR * range.travel, reduced ? 0 : 900).then(() => {
        scrollLock = Math.max(0, scrollLock - 1)
      })
    }
  }

  if (next === current) return
  setExperience({ index: next, target: next, transitioning: true })
  playTransition(current, next, { reduced })
}

export const isScrollLocked = () => scrollLock > 0

onTransition(({ to, done }) => {
  if (done) setExperience({ index: to, transitioning: false })
})

export { applyStateInstantly }
