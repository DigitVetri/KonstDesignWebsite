import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NETWORK } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * How far each photograph travels on its way in.
 *
 * Wide enough to read as a deliberate reveal rather than a nudge, and stated
 * as a percentage of the card's own width so it scales with the column. On a
 * phone the card already spans the screen, so the same figure would throw it
 * clear of the viewport — hence the much shorter move below the breakpoint,
 * which together with the section's horizontal clip keeps the page from ever
 * growing a sideways scrollbar.
 */
const TRAVEL = {
  desktop: { x: 46, y: 38 },
  stacked: { x: 16, y: 20 },
}

/**
 * onEnter · onLeave · onEnterBack · onLeaveBack.
 *
 * The row plays as it arrives and runs backwards as it leaves upward, so the
 * portraits retreat the way they came instead of vanishing — and it is ready
 * to play again the next time the section is scrolled to. Passing the
 * timeline to the trigger rather than firing it from a callback is what makes
 * the reverse possible: the trigger owns the playhead, so it can wind it back.
 */
const TOGGLE = 'play none none reverse'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  STUDIO NETWORK  ·  the three principals, under the credentials row
 * ─────────────────────────────────────────────────────────────────────────────
 *  A one-time entrance, not a scrubbed pass: the connector draws itself across
 *  the three cities, its markers settle onto the line, and the three portraits
 *  arrive from the three directions the row implies — the left studio from the
 *  left, the right studio from the right, the middle one up from below. Each
 *  name and qualification follows its own photograph a beat later.
 *
 *  It plays every time the section is scrolled into view and runs backwards
 *  when it leaves upward, so the pass is repeatable in both directions rather
 *  than a one-shot. Below the breakpoint the three cards stack, and
 *  each one keeps its own direction but triggers on its own arrival rather
 *  than the section's, so nothing has already happened off-screen by the time
 *  it is reached.
 *
 *  Reduced motion gets the content in its final position, fading only.
 */
export function StudioNetwork({ reduced = false }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const ctx = gsap.context((self) => {
      const q = (s) => self.selector(s)
      const cards = q('[data-card]')
      const rail = q('[data-rail]')
      const dots = q('[data-dot]')

      /* ── reduced motion ────────────────────────────────────────────────
         Everything in its resting place; the only change is opacity, and
         even that is a single fade with no movement and no stagger. */
      if (reduced) {
        gsap.set([...dots, ...q('[data-photo]'), ...q('[data-copy] > *')], { opacity: 1, x: 0, y: 0, scale: 1 })
        gsap.set(rail, { scaleX: 1, opacity: 1 })
        gsap.from(el, {
          opacity: 0,
          duration: 0.6,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
        return
      }

      /* the resting state is what the markup renders; the entrance is played
         FROM an offset, so a card that never animates can still never end up
         anywhere but in place */
      gsap.set(rail, { scaleX: 0 })
      gsap.set(dots, { opacity: 0, scale: 0.4 })
      gsap.set(q('[data-photo]'), { opacity: 0 })
      gsap.set(q('[data-copy] > *'), { opacity: 0, y: 18 })

      /** One card's entrance as a timeline, for a trigger or a parent to drive.
          It is NOT created paused: nested in the desktop timeline a paused
          child would never advance, and handed to a ScrollTrigger as its
          `animation` the trigger holds it at zero until the row arrives. */
      const enter = (card, dist, at = 0) => {
        const photo = card.querySelector('[data-photo]')
        const copy = card.querySelector('[data-copy]')
        const dir = card.dataset.enter
        const from =
          dir === 'left' ? { xPercent: -dist.x, yPercent: 0 }
            : dir === 'right' ? { xPercent: dist.x, yPercent: 0 }
              : { xPercent: 0, yPercent: dist.y }

        const tl = gsap.timeline()
        tl.fromTo(
          photo,
          { ...from, opacity: 0 },
          { xPercent: 0, yPercent: 0, opacity: 1, duration: 1.25, ease: 'power3.out' },
          at,
        )
        /* the words follow once the photograph has mostly landed */
        tl.to(
          copy.children,
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08 },
          at + 0.55,
        )
        return tl
      }

      const mm = gsap.matchMedia(root)

      /* ── three across: one trigger for the whole row ──────────────────
         The connector draws first and the three portraits follow into it,
         slightly staggered so the row assembles rather than snapping. */
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: TOGGLE },
        })
        tl.to(rail, { scaleX: 1, duration: 1.1, ease: 'power2.out' }, 0)
        tl.to(dots, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.16 }, 0.25)
        cards.forEach((card, i) => {
          tl.add(enter(card, TRAVEL.desktop), 0.35 + i * 0.12)
        })
      })

      /* ── stacked: each card arrives on its own ────────────────────────
         Reaching the third card can be most of a screen below the first, so
         a single section trigger would have played all three long before
         they were seen. Each keeps its own direction, over a shorter move. */
      mm.add('(max-width: 1023.98px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: q('[data-connector]')[0], start: 'top 88%', toggleActions: TOGGLE },
        })
        tl.to(rail, { scaleX: 1, duration: 1, ease: 'power2.out' }, 0)
        tl.to(dots, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.14 }, 0.2)

        cards.forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            animation: enter(card, TRAVEL.stacked),
            toggleActions: TOGGLE,
          })
        })
      })

      return () => mm.revert()
    }, root)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="studio-network"
      ref={root}
      aria-label="Studio network"
      /* The cards travel in from outside their own columns. Clipping the
         sideways axis here — rather than on the page — keeps that movement
         inside the section without turning anything into a scroll container. */
      className="relative overflow-x-clip bg-cream"
    >
      <div className="q-grid q-grid-cream" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-[14vh] pt-[4vh] sm:px-10 lg:px-14">
        {/* ── header ───────────────────────────────────────────────────── */}
        <div className="max-w-[46rem]">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-cream-line" />
            <span className="font-sans text-[12px] tracking-label text-ink/65">STUDIO NETWORK</span>
          </div>
          <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.02] text-ink">
            Studio network
          </h2>
          <p className="mt-6 max-w-[42ch] font-sans text-[16px] font-light leading-[1.8] text-ink/60">
            Four studios across Tamil Nadu and Karnataka, working as one practice.
          </p>
        </div>

        {/* ── the connector: one line, three markers ───────────────────────
            Laid out on the same three-column grid as the cards below it, so
            every marker sits exactly over its own column whatever the gap
            works out to. The rail is drawn behind them, through the row of
            marker centres. */}
        <div data-connector className="relative mt-[9vh]">
          <ol className="relative grid grid-cols-3 gap-4 sm:gap-8 lg:gap-10">
            {/* The rail and every marker are centred inside the same 12px band
                off the same top edge, so the line runs through the middle of
                each circle rather than near it, at any font or gap. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 grid h-3 place-items-center">
              <div className="h-px w-full bg-cream-line">
                <span data-rail className="block h-px w-full origin-left bg-terra/50" />
              </div>
            </div>
            {NETWORK.map((s) => (
              <li key={s.id} className="flex flex-col items-center">
                <span className="grid h-3 place-items-center">
                  <span data-dot className="h-[11px] w-[11px] rounded-full border border-terra bg-cream" />
                </span>
                <span className="mt-4 text-center font-sans text-[10px] tracking-label text-ink/65 sm:text-[12px]">
                  {s.city.toUpperCase()}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ── the three principals ─────────────────────────────────────── */}
        <div className="mt-[7vh] grid gap-12 sm:gap-14 lg:grid-cols-3 lg:gap-10">
          {NETWORK.map((s) => (
            <article key={s.id} data-card data-enter={s.enter}>
              <figure
                data-photo
                className="overflow-hidden border border-cream-line"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* the site's 3-across image frame: 4/3, cover, square corners */}
                <div className="aspect-[4/3] w-full">
                  <img
                    src={s.image}
                    alt={`${s.name} at his desk in the ${s.city} studio`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </figure>
              <div data-copy>
                <h3 className="mt-6 font-display text-[clamp(1.4rem,2.4vw,2rem)] font-light leading-[1.1] text-ink">
                  {s.name}
                </h3>
                <p className="mt-2 font-sans text-[12px] tracking-label text-ink/55">
                  {s.qualification}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
