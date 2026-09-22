import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AWARDS } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RECOGNITION  ·  an editorial credits sweep, not a carousel
 * ─────────────────────────────────────────────────────────────────────────────
 *  The six awards are listed once. As the reader scrolls, whichever award
 *  crosses the focal line becomes the active one — full ink and a terracotta
 *  marker — while the rest stay quiet. It is entirely scroll-driven and
 *  reverses cleanly; there are no arrows and no controls. The left header sits
 *  still while the credits pass it, the way titles run beside a still frame.
 */
export function Recognition({ reduced = false }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const items = self.selector('[data-award]')
      const setActive = (i) => {
        items.forEach((it, j) => {
          const on = j === i
          it.dataset.active = on ? 'true' : 'false'
        })
      }
      setActive(0)

      if (reduced) {
        gsap.set(self.selector('[data-reveal] > *'), { opacity: 1, y: 0 })
        return
      }

      gsap.from(self.selector('[data-reveal] > *'), {
        opacity: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      })

      items.forEach((it, i) => {
        ScrollTrigger.create({
          trigger: it,
          start: 'top 58%',
          end: 'bottom 42%',
          onToggle: (s) => s.isActive && setActive(i),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="recognition"
      ref={root}
      aria-label="Recognition"
      className="relative bg-cream"
    >
      <div className="q-grid q-grid-cream" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] gap-12 px-6 py-[14vh] sm:px-10 lg:grid-cols-12 lg:px-14">
        {/* ── header (holds still while the credits pass) ──────────────── */}
        <div className="lg:col-span-4">
          <div data-reveal className="lg:sticky lg:top-[32vh]">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[12px] tracking-label text-terra">04</span>
              <span className="h-px w-10 bg-cream-line" />
              <span className="font-sans text-[12px] tracking-label text-ink/65">RECOGNITION</span>
            </div>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.02] text-ink">
              Recognition
            </h2>
            <p className="mt-6 font-display text-[clamp(1.4rem,2.4vw,2rem)] font-light text-terra">
              12 <span className="text-ink/70">Awards won</span>
            </p>
            <p className="mt-5 max-w-[36ch] font-sans text-[16px] font-light leading-[1.8] text-ink/60">
              Work recognised for residential architecture, interior craft and visualization — across fourteen years of practice.
            </p>
          </div>
        </div>

        {/* ── the awards, once each ────────────────────────────────────── */}
        <ol className="lg:col-span-7 lg:col-start-6">
          {AWARDS.map((a, i) => (
            <li
              key={a}
              data-award
              data-active={i === 0 ? 'true' : 'false'}
              className="group border-b border-cream-line py-8 first:border-t sm:py-10"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-sans text-[12px] tracking-label text-ink/60 transition-colors duration-500 group-data-[active=true]:text-terra">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px w-0 bg-terra transition-all duration-500 group-data-[active=true]:w-8" />
                <h3 className="font-display text-[clamp(1.3rem,2.8vw,2.3rem)] font-light leading-[1.1] text-ink/60 transition-colors duration-500 group-data-[active=true]:text-ink">
                  {a}
                </h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
