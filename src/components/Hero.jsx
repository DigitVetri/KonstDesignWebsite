import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { RoomScene } from '../three/RoomScene.jsx'
import { Navigation } from './Navigation.jsx'
import { DesignSelector } from './DesignSelector.jsx'
import { DesignCaption } from './DesignCaption.jsx'
import { useScrollStage } from '../hooks/useScrollStage.js'
import { useExperience } from '../state/experience.js'

/** How much page there is to scroll through, in viewport heights. */
const STAGE_VH = 480

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>\")"

export function Hero({ live, viewport, reduced }) {
  const { mobile, portrait, compact } = viewport
  const stage = useRef(null)
  const frame = useRef(null)
  // one scalar per subscription — useSyncExternalStore needs a stable snapshot
  const index = useExperience((s) => s.index)
  const selectorRevealed = useExperience((s) => s.selectorRevealed)
  const progress = useExperience((s) => s.progress)

  useScrollStage(stage, { enabled: live })

  // The room is revealed as the loader lifts — a slow settle, not a cut.
  useEffect(() => {
    if (!live) return
    gsap.fromTo(
      frame.current,
      { opacity: 0, scale: 1.045 },
      { opacity: 1, scale: 1, duration: reduced ? 0.2 : 1.9, ease: 'expo.out' },
    )
    gsap.fromTo(
      '[data-chrome]',
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.45 },
    )
  }, [live, reduced])

  /**
   * A one-point interior cannot survive a 9:16 crop — you would see nothing but
   * ceiling and floor. On phones the room is framed as its own landscape band
   * and the type moves below it, which is a different composition rather than
   * a squeezed one.
   */
  const band = portrait
    ? 'absolute inset-x-0 top-[17vh] h-[46vh]'
    : 'absolute inset-0'

  return (
    <section ref={stage} style={{ height: `${STAGE_VH}vh` }} className="relative">
      <div className="sticky top-0 panel-h w-full overflow-hidden bg-ink">
        {/* ── the room, and everything that grades it ──────────────────── */}
        <div ref={frame} className={band}>
          <RoomScene mobile={mobile} dpr={mobile ? [1, 1.5] : [1, 1.9]} />

          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                'radial-gradient(120% 85% at 50% 45%, transparent 42%, rgba(8,7,6,0.5) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.055] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
          {portrait ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-hair" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-hair" />
            </>
          ) : (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[19vh]"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(8,7,6,0.86), rgba(8,7,6,0.34) 55%, transparent)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30vh]"
                style={{
                  background:
                    'linear-gradient(to top, rgba(8,7,6,0.8), rgba(8,7,6,0.25) 45%, transparent)',
                }}
              />
              {/* reading scrim for the caption — never covers the centre */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[46%] max-w-[560px]"
                style={{
                  background:
                    'linear-gradient(to right, rgba(8,7,6,0.62), rgba(8,7,6,0.18) 48%, transparent)',
                }}
              />
              {/* hairline architectural grid */}
              <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
                <div className="absolute inset-y-0 left-[12.5%] w-px bg-white/[0.045]" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.045]" />
                <div className="absolute inset-y-0 right-[12.5%] w-px bg-white/[0.045]" />
              </div>
            </>
          )}
        </div>

        {/* ── chrome ───────────────────────────────────────────────────── */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-9">
            <a
              data-chrome
              href="#"
              onClick={(e) => e.preventDefault()}
              className="pointer-events-auto font-display text-[16px] font-light tracking-brand text-bone sm:text-[15px]"
            >
              KONST&nbsp;DESIGN
            </a>
            <div data-chrome>
              <Navigation />
            </div>
          </div>
        </header>

        {/* ── design title + line, always clear of the room ─────────────── */}
        <div
          className={
            portrait
              ? 'pointer-events-none absolute inset-x-0 top-[67vh] z-30 px-5'
              : 'pointer-events-none absolute left-5 top-[24%] z-30 sm:left-8 lg:left-12'
          }
        >
          <DesignCaption index={index} compact={compact} />
        </div>

        {/* ── scroll invitation, retires once you have scrolled ────────── */}
        <div
          className="pointer-events-none absolute bottom-28 right-5 z-30 hidden items-center gap-3 transition-opacity duration-700 sm:right-8 lg:right-12 lg:flex"
          style={{ opacity: progress > 0.02 ? 0 : 1 }}
        >
          <span className="font-sans text-[12px] tracking-label text-bone-dim">SCROLL</span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_2.1s_ease-in-out_infinite] bg-brass" />
          </span>
        </div>

        <DesignSelector revealed={selectorRevealed} activeIndex={index} />
      </div>
    </section>
  )
}
