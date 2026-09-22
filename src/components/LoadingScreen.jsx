import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * A deep-black beat with the wordmark, then a deliberate cinematic hand-over:
 * the panel splits and lifts away from the room rather than cutting to it.
 */
export function LoadingScreen({ progress, ready, onDone }) {
  const root = useRef(null)
  const bar = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    gsap.fromTo(
      '[data-loader-letter]',
      { yPercent: 118, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.05, ease: 'expo.out', stagger: 0.035, delay: 0.12 },
    )
  }, [])

  useEffect(() => {
    gsap.to(bar.current, { scaleX: Math.max(0.04, progress / 100), duration: 0.6, ease: 'power2.out' })
  }, [progress])

  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    const tl = gsap.timeline({ delay: 0.35, onComplete: onDone })
    tl.to('[data-loader-meta]', { opacity: 0, duration: 0.4, ease: 'power2.in' })
      .to('[data-loader-letter]', { yPercent: -118, opacity: 0, duration: 0.8, ease: 'expo.inOut', stagger: 0.022 }, 0.1)
      .to('[data-loader-half]', { scaleY: 0, duration: 1.15, ease: 'expo.inOut', stagger: 0.08 }, 0.32)
      .set(root.current, { display: 'none' })
  }, [ready, onDone])

  return (
    <div ref={root} className="fixed inset-0 z-[100] pointer-events-none">
      <div
        data-loader-half
        className="absolute inset-x-0 top-0 h-1/2 origin-top bg-[#080706]"
      />
      <div
        data-loader-half
        className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-[#080706]"
      />

      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center">
          <h1 className="flex overflow-hidden font-display text-[clamp(2rem,7vw,4.6rem)] font-light tracking-brand text-bone">
            {'KONSTDESIGN'.split('').map((c, i) => (
              <span
                key={i}
                data-loader-letter
                className={`inline-block ${i === 5 ? 'ml-[0.5em]' : ''}`}
              >
                {c}
              </span>
            ))}
          </h1>
          <div data-loader-meta className="mt-10 flex w-56 flex-col items-center gap-3">
            <div className="h-px w-full bg-hair">
              <div ref={bar} className="h-px w-full origin-left scale-x-0 bg-brass" />
            </div>
            <span className="font-sans text-[12px] tracking-label text-bone-dim">
              {progress < 100 ? `PREPARING THE ROOM · ${Math.round(progress)}%` : 'STEP INSIDE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
