import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EMAIL, PHONE_PRIMARY } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

const SK = 1000 // normalised path length, so one dashoffset means "undrawn"
const tel = (p) => 'tel:' + p.replace(/\s+/g, '')

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ARCHITECTURAL PLAN → START A PROJECT
 * ─────────────────────────────────────────────────────────────────────────────
 *  The technical floor plan is drawn entirely in code (SVG), constructing
 *  itself line by line as the reader scrolls — dimension first, then walls,
 *  then the partition and door, then the labels and the title block. As it
 *  settles it becomes the bridge into the closing call to action, which fades
 *  up beside it. Scroll-driven, reversible, and reduced-motion aware.
 */
export function StartProject({ reduced = false }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const q = (s) => self.selector(s)

      if (reduced) {
        gsap.set(q('[data-draw]'), { strokeDashoffset: 0 })
        gsap.set(q('[data-plan-fade], [data-cta] > *'), { opacity: 1, y: 0 })
        return
      }

      gsap.set(q('[data-draw]'), { strokeDashoffset: SK })
      gsap.set(q('[data-plan-fade]'), { opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: q('[data-plan]')[0], start: 'top 82%', end: 'bottom 60%', scrub: true },
      })
      tl.to(q('[data-draw="dim"]'), { strokeDashoffset: 0, ease: 'none', duration: 1 })
        .to(q('[data-draw="wall"]'), { strokeDashoffset: 0, ease: 'none', duration: 2.4, stagger: 0.3 })
        .to(q('[data-draw="part"]'), { strokeDashoffset: 0, ease: 'none', duration: 1.4, stagger: 0.3 })
        .to(q('[data-plan-fade="room"]'), { opacity: 1, ease: 'none', duration: 1 }, '>-0.4')
        .to(q('[data-plan-fade="title"]'), { opacity: 1, ease: 'none', duration: 1 })

      /* the plan expands a touch as the reader moves past it */
      gsap.fromTo(
        q('[data-plan-scale]')[0],
        { scale: 0.98 },
        {
          scale: 1.02, ease: 'none', transformOrigin: '50% 50%',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        },
      )

      gsap.from(q('[data-cta] > *'), {
        opacity: 0, y: 30, duration: 1.1, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: q('[data-cta]')[0], start: 'top 78%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  const line = { fill: 'none', stroke: 'var(--color-terra)', strokeWidth: 1.4, pathLength: SK, strokeDasharray: SK, strokeDashoffset: SK, strokeLinecap: 'round' }

  return (
    <section
      id="start-project"
      ref={root}
      aria-label="Start a project"
      className="relative bg-cream"
    >
      <div className="q-grid q-grid-cream" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-12 px-6 py-[9vh] sm:px-10 lg:grid-cols-12 lg:px-14">
        {/* ── the drawing ──────────────────────────────────────────────── */}
        <div data-plan className="lg:col-span-6">
          <svg data-plan-scale viewBox="0 0 400 320" className="block w-full" aria-label="Interior plan, 1 to 75" role="img">
            {/* top dimension line, 34'-0" */}
            <g style={{ color: 'var(--color-ink)' }}>
              <path data-draw="dim" d="M40 34 H360" {...line} stroke="var(--color-ink)" strokeWidth="0.8" style={{ opacity: 0.5 }} />
              <path data-draw="dim" d="M40 29 V39 M360 29 V39" {...line} stroke="var(--color-ink)" strokeWidth="0.8" style={{ opacity: 0.5 }} />
            </g>
            <text data-plan-fade="room" x="200" y="26" textAnchor="middle" className="fill-ink/50 font-sans" style={{ fontSize: 9, letterSpacing: '0.18em' }}>34&#39;-0&#34;</text>

            {/* outer walls */}
            <path data-draw="wall" d="M40 60 H360" {...line} />
            <path data-draw="wall" d="M360 60 V280" {...line} />
            <path data-draw="wall" d="M360 280 H40" {...line} />
            <path data-draw="wall" d="M40 280 V60" {...line} />

            {/* partition between living and dining + a door swing */}
            <path data-draw="part" d="M232 60 V200" {...line} strokeWidth="1.1" />
            <path data-draw="part" d="M232 245 V280" {...line} strokeWidth="1.1" />
            <path data-draw="part" d="M232 245 A45 45 0 0 1 277 200" {...line} strokeWidth="0.8" style={{ opacity: 0.55 }} />

            {/* north arrow */}
            <path data-draw="part" d="M320 250 V300 M320 250 L314 262 M320 250 L326 262" {...line} strokeWidth="1" />

            {/* labels + title block */}
            <text data-plan-fade="room" x="126" y="176" textAnchor="middle" className="fill-ink font-display" style={{ fontSize: 15 }}>LIVING</text>
            <text data-plan-fade="room" x="296" y="140" textAnchor="middle" className="fill-ink font-display" style={{ fontSize: 15 }}>DINING</text>
            <text data-plan-fade="room" x="320" y="314" textAnchor="middle" className="fill-ink/60 font-sans" style={{ fontSize: 10, letterSpacing: '0.2em' }}>N</text>
            <text data-plan-fade="title" x="40" y="308" className="fill-ink/55 font-sans" style={{ fontSize: 9, letterSpacing: '0.22em' }}>INTERIOR PLAN</text>
            <text data-plan-fade="title" x="40" y="318" className="fill-terra font-sans" style={{ fontSize: 8.5, letterSpacing: '0.22em' }}>1:75</text>
          </svg>
        </div>

        {/* ── the call to action (on the wood-brown half) ─────────────── */}
        <div
          data-cta
          className="rounded-[3px] bg-wood p-8 text-bone sm:p-10 lg:col-span-5 lg:col-start-8"
        >
          <p className="font-sans text-[12px] tracking-label text-brass">START A PROJECT</p>
          <h2 className="mt-5 font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-light leading-[0.98] text-bone">
            Let&#39;s design<br />your space.
          </h2>
          <p className="mt-6 max-w-[38ch] font-sans text-[16px] font-light leading-[1.8] text-bone/70 sm:text-[16px]">
            Have a project in mind? Talk to our team and let&#39;s turn your idea into a space.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <a
              href={tel(PHONE_PRIMARY)}
              className="group inline-flex items-center justify-center gap-3 border border-bone/35 px-6 py-3.5 font-sans text-[12px] tracking-label text-bone transition-colors duration-500 hover:border-brass hover:bg-brass hover:text-ink"
            >
              CALL US
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center justify-center gap-3 border border-bone/35 px-6 py-3.5 font-sans text-[12px] tracking-label text-bone transition-colors duration-500 hover:border-brass hover:bg-brass hover:text-ink"
            >
              SEND AN EMAIL
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
