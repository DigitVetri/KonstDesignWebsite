import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STATS } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

const LIVING_ROOM = '/assets/services/visiting-room.webp'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EXPERIENCE  ·  the first light beat after the dark Projects gallery
 * ─────────────────────────────────────────────────────────────────────────────
 *  Reuses the site's established cream drafting-paper language (the About /
 *  Quotes / Services token set): cream ground, faint brown grid, ink type,
 *  terracotta accent. Clean section edges — no merge gradient.
 *
 *  Scroll drives everything. The "16+ years of experience" statement rises in
 *  as the section enters; the photograph fades in on scroll and parallaxes
 *  gently; the statistics settle as they arrive. Nothing autoplays, and
 *  reduced-motion collapses it all to a clean static state.
 */
export function Experience({ reduced = false }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const q = (s) => self.selector(s)

      if (reduced) {
        gsap.set(q('[data-hero-lead], [data-para], [data-stat]'), { opacity: 1, y: 0 })
        gsap.set(q('[data-grid-line]'), { scaleX: 1, scaleY: 1, opacity: 1 })
        return
      }

      /* the "16+ years of experience" statement rises in as the hero enters */
      gsap.from(q('[data-hero-lead]'), {
        opacity: 0, y: 30, duration: 1.1, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: q('[data-hero]')[0], start: 'top 80%', once: true },
      })

      /* drafting lines draw themselves around the words as it enters */
      gsap.fromTo(
        q('[data-grid-line]'),
        { scaleX: (i, t) => (t.dataset.axis === 'x' ? 0 : 1), scaleY: (i, t) => (t.dataset.axis === 'y' ? 0 : 1), opacity: 0 },
        {
          scaleX: 1, scaleY: 1, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12,
          scrollTrigger: { trigger: q('[data-hero]')[0], start: 'top 80%', once: true },
        },
      )

      /* the right-hand paragraph settles once */
      gsap.from(q('[data-para]'), {
        opacity: 0, y: 28, duration: 1.1, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: q('[data-para]')[0], start: 'top 84%', once: true },
      })

      /* image: subtle parallax, moving slower than the text */
      gsap.fromTo(
        q('[data-img]')[0],
        { yPercent: -6 },
        {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: q('[data-imgwrap]')[0], start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      /* the photograph fades in — purely opacity, so its size and position are
         unchanged — when it scrolls into view, once (no repeat, no autoplay).
         Set + onEnter (rather than a scrub/fromTo) so it reliably holds at 0
         until it actually enters, then fades up a single time. */
      const fig = q('[data-imgwrap]')[0]
      gsap.set(fig, { opacity: 0 })
      ScrollTrigger.create({
        trigger: fig,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(fig, { opacity: 1, duration: 1.4, ease: 'power2.out' }),
      })

      /* statistics rise gently into place and reveal their labels */
      q('[data-stat]').forEach((stat) => {
        gsap.from(stat, {
          opacity: 0, y: 30, duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: stat, start: 'top 88%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="experience"
      ref={root}
      aria-label="Experience"
      className="relative bg-cream"
    >
      <div className="q-grid q-grid-cream" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pt-[12vh] pb-[10vh] sm:px-10 lg:px-14">
        {/* ── headline + paragraph ─────────────────────────────────────── */}
        <div data-hero className="relative grid gap-12 lg:grid-cols-12">
          {/* faint drafting lines constructed around the words */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span data-grid-line data-axis="y" className="absolute left-0 top-0 h-full w-px origin-top bg-terra/20" />
            <span data-grid-line data-axis="x" className="absolute left-0 top-0 h-px w-full origin-left bg-terra/15" />
            <span data-grid-line data-axis="x" className="absolute bottom-0 left-0 h-px w-full origin-left bg-terra/15" />
          </div>

          <div className="lg:col-span-7">
            {/* the section's statement — large and dominant, balanced against
                the paragraph opposite; part of the section, not a card */}
            <div data-hero-lead>
              <span className="block font-display font-light uppercase leading-[0.86] text-terra text-[clamp(5rem,16vw,15rem)]">
                {STATS[0].value}
              </span>
              <span className="mt-3 block font-sans text-[12px] tracking-label text-ink/50 sm:text-[16px]">
                YEARS OF EXPERIENCE
              </span>
            </div>
          </div>

          <div className="flex items-end lg:col-span-4 lg:col-start-9">
            <div className="space-y-5">
              <p data-para className="font-sans text-[16px] font-light leading-[1.8] text-ink/70 sm:text-[16px]">
                With more than 14 years of experience, KONST DESIGN brings together architectural thinking, interior design and 3D visualization to create spaces that are functional, beautiful and personal.
              </p>
              <p data-para className="font-sans text-[16px] font-light leading-[1.8] text-ink/70 sm:text-[16px]">
                We work from Coimbatore, Bengaluru, Dindigul and Chennai across residential, retail and commercial projects — drawing, detailing and seeing each one through to handover.
              </p>
            </div>
          </div>
        </div>

        {/* ── living-room photograph ───────────────────────────────────── */}
        <figure data-imgwrap className="relative mt-[12vh] overflow-hidden border border-cream-line">
          <div className="relative aspect-[16/8] w-full overflow-hidden">
            <img
              data-img
              src={LIVING_ROOM}
              alt="Completed living room designed by KONST DESIGN, in warm evening light"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-[112%] w-full -translate-y-[6%] object-cover"
            />
          </div>
          <figcaption className="flex items-center justify-between px-5 py-4 sm:px-7">
            <span className="max-w-[70%] font-sans text-[12px] tracking-label text-ink/65">
              COMPLETED LIVING ROOM · WARM EVENING LIGHT
            </span>
            <span className="font-display text-[16px] font-light italic text-ink/60">KONST DESIGN</span>
          </figcaption>
        </figure>

        {/* ── statistics ───────────────────────────────────────────────── */}
        <div className="mt-[12vh] grid grid-cols-2 gap-px border border-cream-line bg-cream-line sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} data-stat className="bg-cream px-5 py-8 sm:px-7 sm:py-10">
              <p className="font-display text-[clamp(2.4rem,4.5vw,3.8rem)] font-light leading-none text-ink">
                {s.value}
              </p>
              <p className="mt-3 font-sans text-[12px] tracking-label text-ink/50">
                {s.label.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
