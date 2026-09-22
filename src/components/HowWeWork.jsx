import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRINCIPLES } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HOW WE WORK  ·  the four-image scroll sequence
 * ─────────────────────────────────────────────────────────────────────────────
 *  Each principle arrives as a real project photograph: as its row scrolls in,
 *  the image enters large and pulled toward the centre of the page, then — tied
 *  1:1 to scroll — settles to its side (alternating left / right) while the
 *  number, title and description rise in on the opposite side. Nothing that has
 *  arrived ever leaves: the pairs accumulate down the page, so by the fourth
 *  all four scenes are stacked and visible, an architectural presentation
 *  assembled by the reader's own movement.
 *
 *  Reuses the site's cream drafting-paper language; reduced motion parks every
 *  pair in its settled state.
 */
export function HowWeWork({ reduced = false }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const q = (s) => self.selector(s)

      gsap.from(q('[data-reveal] > *'), {
        opacity: reduced ? 1 : 0, y: reduced ? 0 : 24, duration: 1, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      })

      if (reduced) {
        q('[data-row]').forEach((row) => {
          const img = row.querySelector('[data-row-img]')
          const copy = row.querySelector('[data-row-copy]')
          gsap.set([img, copy], { opacity: 1, x: 0, y: 0, scale: 1 })
          gsap.set(copy.children, { opacity: 1, y: 0 })
        })
        return
      }

      /**
       * The same reveal, in the two shapes the row actually takes.
       *
       * Side by side the photograph sits in seven of twelve columns, so there
       * is room beside it to travel through, and it enters pulled toward the
       * centre of the page before settling onto its own side.
       *
       * Stacked there is no beside — the photograph is the full width of the
       * screen, and a sideways entrance either does nothing or throws half the
       * image off the edge. So it was set to zero, which is how a phone came to
       * have no visible entrance at all: what remained was a fade that finished
       * while the picture was still below the fold, so by the time it could be
       * seen it had already arrived. The stacked pass trades the sideways move
       * for a vertical one, and — the part that actually matters — holds the
       * range open until the row is properly on screen, so the movement happens
       * where it can be watched rather than under the bottom edge.
       */
      const PASS = {
        wide: { enter: 12, rise: 3, start: 'top 88%', end: 'top 34%', copyRise: 34, stagger: 0.18 },
        stacked: { enter: 0, rise: 9, start: 'top 82%', end: 'top 22%', copyRise: 26, stagger: 0.12 },
      }

      const rows = (key) => {
        const v = PASS[key]
        q('[data-row]').forEach((row) => {
          const img = row.querySelector('[data-row-img]')
          const copy = row.querySelector('[data-row-copy]')
          const left = row.dataset.side === 'left'
          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: v.start, end: v.end, scrub: true },
          })
          tl.fromTo(
            img,
            { opacity: 0, scale: 1.035, xPercent: left ? v.enter : -v.enter, yPercent: v.rise },
            { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, ease: 'power2.out', duration: 1 },
            0,
          )
          /* text rises in on the opposite side, in one staggered group */
          tl.fromTo(
            copy.children,
            { opacity: 0, y: v.copyRise },
            { opacity: 1, y: 0, ease: 'power2.out', stagger: v.stagger, duration: 0.7 },
            0.45,
          )
        })
      }

      const mm = gsap.matchMedia(root)
      mm.add('(min-width: 1024px)', () => rows('wide'))
      mm.add('(max-width: 1023.98px)', () => rows('stacked'))
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="how-we-work"
      ref={root}
      aria-label="How we work"
      className="relative bg-cream"
    >
      <div className="q-grid q-grid-cream" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-[10vh] sm:px-10 lg:px-14">
        {/* ── header ───────────────────────────────────────────────────── */}
        <div data-reveal className="max-w-[46rem]">
          <div className="flex items-center gap-4">
            <span className="font-sans text-[12px] tracking-label text-terra">05</span>
            <span className="h-px w-10 bg-cream-line" />
            <span className="font-sans text-[12px] tracking-label text-ink/65">HOW WE WORK</span>
          </div>
          <p className="mt-8 font-sans text-[12px] tracking-label text-brass">WHY KONST DESIGN?</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.0] text-ink">
            Four things we<br />never compromise.
          </h2>
          <p className="mt-6 max-w-[42ch] font-sans text-[16px] font-light leading-[1.8] text-ink/60 sm:text-[16px]">
            The reasons clients stay with us across second and third projects — and refer us to their families.
          </p>
        </div>

        {/* ── the four scenes, accumulating down the page ──────────────── */}
        <div className="mt-[10vh] space-y-[14vh]">
          {PRINCIPLES.map((p) => {
            const left = p.side === 'left'
            return (
              <div
                key={p.number}
                data-row
                data-side={p.side}
                /* the photograph enters at scale 1.14, which makes it wider
                   than its own column and pushed the document 109px wider than
                   the window at every breakpoint. Clipping at the row keeps
                   that growth inside the layout where it belongs. */
                className="grid items-center gap-8 overflow-hidden lg:grid-cols-12 lg:gap-12"
              >
                <figure
                  data-row-img
                  className={`overflow-hidden border border-cream-line ${
                    left ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-7 lg:col-start-6 lg:order-2'
                  }`}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <div className="aspect-[16/10] w-full">
                    <img
                      src={p.image}
                      alt={`${p.title} — KONST DESIGN`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </figure>

                <div
                  data-row-copy
                  className={`${
                    left ? 'lg:col-span-4 lg:col-start-9 lg:order-2' : 'lg:col-span-4 lg:col-start-1 lg:order-1'
                  }`}
                >
                  <p className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-none text-terra">
                    {p.number}
                  </p>
                  <h3 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-[1.05] text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-4 max-w-[34ch] font-sans text-[16px] font-light leading-[1.8] text-ink/65 sm:text-[16px]">
                    {p.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
