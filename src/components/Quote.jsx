import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  QUOTE — a full-page editorial interstitial
 * ─────────────────────────────────────────────────────────────────────────────
 *  The quiet pages between the animated sections, built to the studio's own
 *  drafting-paper language: a numbered, ruled header; a small eyebrow; a large
 *  serif statement whose first line rests in the warm terracotta accent; a
 *  short supporting line to the right; and a fine grid behind it all — brown on
 *  the cream pages, cream on the brown one, the one system running the length
 *  of the site.
 *
 *  Nothing here is a saved reference image: the composition is rebuilt from the
 *  project's own tokens, the Cormorant display face and CSS. The type warms
 *  from ink to terracotta on hover, and on touch the same shift fires from the
 *  pointer entering — subtle, never flashy.
 *
 *  The only motion is a one-shot reveal on scroll-in (transform + opacity via
 *  the site's existing ScrollTrigger), so the page still reads as scroll-driven
 *  without ever pinning or trapping the reader.
 */
export function Quote({
  index,
  eyebrow,
  tag,
  lines,
  body,
  theme = 'cream',
  reduced = false,
}) {
  const root = useRef(null)
  const [warm, setWarm] = useState(false)
  const brown = theme === 'brown'

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const q = (sel) => self.selector(sel)
      const targets = q('[data-q-rise]')
      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }
      gsap.set(targets, { opacity: 0, y: 30 })
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  /* ink (or bone) at rest; both warm to terracotta together on hover/touch */
  const restLine = brown ? 'text-bone' : 'text-ink'
  const warmLine = brown ? 'text-[#e6b98d]' : 'text-terra'
  const line = (accent) =>
    `block transition-colors duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
      accent ? 'text-terra' : warm ? warmLine : restLine
    }`

  const muted = brown ? 'text-bone/65' : 'text-ink/65'
  const bodyTone = brown ? 'text-bone/65' : 'text-ink/65'
  const ruleTone = brown ? 'text-bone/60' : 'text-ink/25'

  return (
    <section
      ref={root}
      aria-label={lines.join(' ')}
      className={`relative w-full overflow-hidden ${brown ? 'bg-cocoa' : 'bg-cream'}`}
    >
      <div className={`q-grid ${brown ? 'q-grid-brown' : 'q-grid-cream'}`} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-6 py-[12vh] sm:px-10 lg:px-14">
        {/* ── ruled header ─────────────────────────────────────────────── */}
        <div data-q-rise className="flex items-center gap-5 sm:gap-8">
          <span className="font-sans text-[12px] tracking-label text-terra">{index}</span>
          <span className={`q-rule flex-1 ${ruleTone}`} />
          <span className={`font-sans text-[12px] tracking-label sm:text-[12px] ${muted}`}>
            {tag}
          </span>
          <span
            aria-hidden="true"
            className={`font-display text-[15px] font-light leading-none tracking-[0.08em] ${
              brown ? 'text-bone/50' : 'text-ink/65'
            }`}
          >
            KD
          </span>
        </div>

        {/* ── statement ────────────────────────────────────────────────── */}
        <div className="flex items-center py-10 sm:py-12">
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <p data-q-rise className={`font-sans text-[12px] tracking-label ${muted}`}>
                {eyebrow}
              </p>
              <h2
                data-q-rise
                onPointerEnter={() => setWarm(true)}
                onPointerLeave={() => setWarm(false)}
                onPointerCancel={() => setWarm(false)}
                className="mt-6 max-w-[16ch] cursor-default select-none font-display text-[clamp(2.4rem,7.2vw,6.4rem)] font-light uppercase leading-[0.98] tracking-[0.005em] sm:mt-8"
              >
                {lines.map((t, i) => (
                  <span key={t} className={line(i === 0)}>
                    {t}
                  </span>
                ))}
              </h2>
            </div>

            {body && (
              <div className="flex items-end lg:col-span-3 lg:col-start-10">
                <p
                  data-q-rise
                  className={`max-w-[34ch] font-sans text-[16px] font-light leading-[1.75] sm:text-[16px] ${bodyTone}`}
                >
                  {body}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── closing rule ─────────────────────────────────────────────── */}
        <div
          data-q-rise
          className={`h-px w-full ${brown ? 'bg-bone/15' : 'bg-cream-line'}`}
        />
      </div>
    </section>
  )
}
