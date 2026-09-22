import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { DESIGNS, FIRST_DESIGN_INDEX } from '../data/designs.js'
import { goTo } from '../state/controller.js'

/**
 * The three design cards — the main interaction on the page.
 *
 * Revealed once, then live for the rest of the experience: a click retargets
 * the room from whatever it is currently doing, through exactly the same
 * engine the scroll steps use.
 *
 * They read as cards rather than as labels because this is the moment the
 * page has to say "the room is empty, and these are three ways to fill it".
 * The glass is deliberately thin — the room has to stay legible through them,
 * so the card is a border, a breath of white and a blur, not a panel.
 */
export function DesignSelector({ revealed, activeIndex }) {
  const root = useRef(null)
  const shown = useRef(false)

  useEffect(() => {
    if (!revealed || shown.current) return
    shown.current = true
    const tl = gsap.timeline()
    tl.to(root.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .fromTo(
        '[data-selector-rule]',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: 'expo.out' },
        0,
      )
      .fromTo(
        '[data-selector-item]',
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.95, ease: 'expo.out', stagger: 0.11 },
        0.18,
      )
  }, [revealed])

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 opacity-0"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 pb-6 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10">
        <div data-selector-rule className="mb-5 h-px w-full origin-left bg-hair sm:mb-7" />
        <ul className="pointer-events-auto mx-auto flex max-w-[920px] items-stretch justify-center gap-2.5 [text-shadow:0_2px_14px_rgba(8,7,6,0.8)] sm:gap-4 lg:gap-5">
          {DESIGNS.map((design, i) => {
            const index = FIRST_DESIGN_INDEX + i
            const active = activeIndex === index
            return (
              <li key={design.id} data-selector-item className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => goTo(index, { source: 'button' })}
                  aria-pressed={active}
                  /* the sheen is a background-image so it cannot stack over the
                     type the way an absolute overlay would */
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(255,255,255,0.055), rgba(255,255,255,0) 62%)',
                  }}
                  className={`group relative block h-full w-full overflow-hidden rounded-[3px] border px-2.5 pb-3 pt-3.5 text-left backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[3px] sm:px-4 sm:pb-4 sm:pt-[18px] ${
                    active
                      ? 'border-brass/55 bg-white/[0.075] shadow-[0_12px_34px_-14px_rgba(0,0,0,0.92)]'
                      : 'border-white/[0.09] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_16px_38px_-16px_rgba(0,0,0,0.95)]'
                  }`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-brass transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-[0.35]'
                    }`}
                  />
                  {/* on the narrowest phones the swatches drop below the label
                      rather than squeezing it off the card */}
                  <span className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                    <span
                      className={`font-sans text-[12px] tracking-label transition-colors duration-500 sm:text-[12px] ${
                        active ? 'text-brass' : 'text-bone-dim group-hover:text-bone'
                      }`}
                    >
                      {design.label}
                    </span>
                    <span className="flex gap-[3px]">
                      {design.palette.swatch.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className={`h-[6px] w-[6px] rounded-full transition-opacity duration-500 ${
                            active ? 'opacity-100' : 'opacity-35 group-hover:opacity-70'
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                  </span>
                  <span
                    className={`mt-1.5 block truncate font-display text-[16px] font-light leading-tight transition-colors duration-500 sm:text-[17px] lg:text-[21px] ${
                      active ? 'text-bone' : 'text-bone/55 group-hover:text-bone/85'
                    }`}
                  >
                    {design.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
