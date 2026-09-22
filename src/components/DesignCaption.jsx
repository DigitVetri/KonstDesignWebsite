import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { STATES } from '../data/designs.js'

/**
 * Design title + one line. Deliberately parked in the upper-left dead space
 * above the sofa line so it never sits on top of the room.
 */
export function DesignCaption({ index, compact = false }) {
  const wrap = useRef(null)
  const prev = useRef(index)

  useEffect(() => {
    if (prev.current === index) return
    prev.current = index
    const lines = wrap.current?.querySelectorAll('[data-caption-line]')
    if (!lines?.length) return
    const tl = gsap.timeline()
    tl.to(lines, {
      yPercent: -110,
      opacity: 0,
      duration: 0.42,
      ease: 'power3.in',
      stagger: 0.05,
    })
      .set(lines, { yPercent: 110 })
      .to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        ease: 'expo.out',
        stagger: 0.07,
      })
  }, [index])

  const state = STATES[index] ?? STATES[0]

  return (
    <div ref={wrap} className="pointer-events-none max-w-[min(78vw,26rem)] [text-shadow:0_2px_18px_rgba(8,7,6,0.8)]">
      <div className="overflow-hidden">
        <p
          data-caption-line
          className="font-sans text-[12px] tracking-label text-brass sm:text-[12px]"
        >
          {state.label === 'EMPTY' ? 'THE SHELL' : state.label}
        </p>
      </div>
      <div className="mt-2 overflow-hidden">
        <h2
          data-caption-line
          className="font-display text-[clamp(1.4rem,3.6vw,2.9rem)] font-light leading-[1.05] text-bone"
        >
          {state.title}
        </h2>
      </div>
      {!compact && (
        <div className="mt-3 overflow-hidden">
          <p
            data-caption-line
            className="max-w-sm font-sans text-[12px] font-light leading-relaxed text-bone/75 sm:text-[16px]"
          >
            {state.line}
          </p>
        </div>
      )}
    </div>
  )
}
