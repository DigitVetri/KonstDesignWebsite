import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STUDIOS } from '../data/studio.js'

gsap.registerPlugin(ScrollTrigger)

const TRACK_VH = 180

/** exact Google Maps URLs (§27) — used verbatim by both the pins and the links */
const mapsHref = (s) => s.maps

/** equirectangular projection of [lat,lng] into the 0–100 map viewBox, over
 *  India's bounds (lat 8–37 N, lng 68–97 E) — north at the top */
const proj = ([lat, lng]) => [((lng - 68) / 29) * 100, ((37 - lat) / 29) * 100]
const clamp01 = (v) => Math.max(0, Math.min(1, v))

/* a recognisable India silhouette (stylised, code-drawn — no external tiles) */
const INDIA =
  'M28 7 L34 5 L40 9 L46 7 L52 11 L58 10 L64 13 L72 12 L78 16 L74 20 L69 19 ' +
  'L71 25 L66 30 L63 37 L61 45 L58 54 L54 64 L49 73 L44 82 L39 90 L34 96 ' +
  'L31 90 L28 82 L26 74 L24 66 L22 58 L20 50 L18 44 L17 40 L14 41 L12 37 ' +
  'L16 34 L20 31 L22 26 L25 20 L24 15 L26 10 Z'
/* Tamil Nadu, in the south-east, highlighted a touch warmer */
const TN = 'M33 71 L44 79 L46 86 L41 92 L34 96 L31 90 L29 82 L30 75 Z'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  STUDIOS  ·  a scroll-controlled geographic map beside the two locations
 * ─────────────────────────────────────────────────────────────────────────────
 *  A realistic top-down map, drawn in code: it opens on all of India and, as
 *  the reader scrolls, travels India → south India → the studio cities,
 *  stopping at a framing that keeps EVERY studio city in view (never zooming
 *  into one). A professional pin per studio reveals at the end; tapping any of
 *  them opens that exact Google Maps address in a new tab. Pinned by a sticky child for the
 *  length of the journey, then released — never trapping the reader.
 */
export function Studios({ viewport, reduced = false }) {
  const root = useRef(null)
  const stacked = viewport.mobile || viewport.portrait

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context((self) => {
      const q = (s) => self.selector(s)
      const group = q('[data-map-group]')[0]
      const pts = STUDIOS.map((s) => proj(s.coord))
      const mid = [
        pts.reduce((a, q) => a + q[0], 0) / pts.length,
        pts.reduce((a, q) => a + q[1], 0) / pts.length,
      ]
      const S1 = stacked ? 4.4 : 5.2

      const frame = (p) => {
        const s = 1 + p * (S1 - 1)
        group?.setAttribute('transform', `translate(${50 - mid[0] * s} ${50 - mid[1] * s}) scale(${s})`)
        q('[data-zoom="india"]')[0]?.style.setProperty('opacity', String(clamp01(1 - p / 0.28)))
        q('[data-zoom="state"]')[0]?.style.setProperty('opacity', String(clamp01(Math.min(p / 0.32, (0.7 - p) / 0.2))))
        q('[data-zoom="cities"]')[0]?.style.setProperty('opacity', String(clamp01((p - 0.62) / 0.22)))
        const reveal = clamp01((p - 0.68) / 0.2)
        /* pins live in a screen-space overlay so they stay a constant size at
           any zoom — only their POSITION tracks the map transform */
        q('[data-pin]').forEach((n) => {
          const px = parseFloat(n.dataset.px)
          const py = parseFloat(n.dataset.py)
          n.setAttribute('transform', `translate(${50 + (px - mid[0]) * s} ${50 + (py - mid[1]) * s})`)
          n.style.setProperty('opacity', String(reveal))
        })
      }

      if (reduced || stacked) {
        frame(1)
      } else {
        frame(0)
        gsap.to({ p: 0 }, {
          p: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true },
          onUpdate() { frame(this.targets()[0].p) },
        })
        gsap.from(q('[data-info] [data-reveal-item]'), {
          opacity: 0, y: 26, duration: 1, ease: 'expo.out', stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 60%', once: true },
        })
      }
    }, root)
    return () => ctx.revert()
  }, [reduced, stacked])

  /* drawn at the origin (0,0) as a small, fixed-size pin; frame() translates
     it to the city's live screen position, so it never scales with the zoom */
  const pin = (p, key) => {
    const [px, py] = proj(p.coord)
    return (
      <a key={key} data-pin data-px={px} data-py={py} href={mapsHref(p)} target="_blank" rel="noopener noreferrer" style={{ opacity: 0 }}>
        <circle cx="0" cy="-3" r="1.8" fill="var(--color-terra)" stroke="#fff" strokeWidth="0.35" />
        <path d="M0 0 l -1.5 -3.1 h3 Z" fill="var(--color-terra)" />
        <circle cx="0" cy="-3" r="0.75" fill="#fff" />
        <text x="2.8" y="-2.1" style={{ fontSize: 2.6, letterSpacing: '0.08em' }} className="fill-ink font-sans">
          {p.city}
        </text>
      </a>
    )
  }

  return (
    <section
      id="studios"
      ref={root}
      aria-label="Studios and locations"
      className={`studios-section relative bg-cream ${stacked || reduced ? 'studios-reading' : ''}`}
      style={{ height: stacked || reduced ? 'auto' : `${TRACK_VH}vh` }}
    >
      <div className="sticky top-0 flex panel-h w-full flex-col overflow-hidden bg-cream lg:grid lg:grid-cols-2">
        {/* ── realistic map (left 50%) ─────────────────────────────────── */}
        <div className="relative h-[44svh] min-h-0 overflow-hidden border-b border-cream-line bg-[#d9e2e6] lg:h-full lg:border-b-0 lg:border-r">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <g data-map-group>
              {/* faint graticule for geographic feel */}
              {[16, 32, 48, 64, 80].map((v) => (
                <g key={v} stroke="#9fb0b8" strokeWidth="0.12" opacity="0.3">
                  <line x1={v} y1="0" x2={v} y2="100" />
                  <line x1="0" y1={v} x2="100" y2={v} />
                </g>
              ))}
              {/* land + Tamil Nadu */}
              <path d={INDIA} fill="#e9e4d6" stroke="#8f8b7e" strokeWidth="0.35" strokeLinejoin="round" />
              <path d={TN} fill="#e2d7bf" stroke="var(--color-terra)" strokeWidth="0.3" opacity="0.9" />
              {/* a couple of faint interior boundaries */}
              <g stroke="#b7b1a3" strokeWidth="0.18" opacity="0.55" fill="none">
                <path d="M33 71 L52 60 M30 75 L22 58 M44 79 L58 54" />
              </g>
            </g>

            {/* pins in a screen-space overlay — constant size, positioned by the
                zoom transform, revealed only when the journey reaches the end */}
            {STUDIOS.map((s) => pin(s, s.id))}

            {/* zoom captions, fixed to the frame */}
            <text data-zoom="india" x="4" y="7" style={{ fontSize: 2.6, letterSpacing: '0.24em' }} className="fill-ink/45 font-sans">INDIA</text>
            <text data-zoom="state" x="4" y="7" style={{ fontSize: 2.6, letterSpacing: '0.24em', opacity: 0 }} className="fill-ink/45 font-sans">SOUTH INDIA</text>
            <text data-zoom="cities" x="4" y="7" style={{ fontSize: 2.6, letterSpacing: '0.24em', opacity: 0 }} className="fill-terra font-sans">
              {STUDIOS.map((s) => s.city.toUpperCase()).join(' · ')}
            </text>
          </svg>
        </div>

        {/* ── studio information (right 50%) ───────────────────────────── */}
        <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-14">
          <div data-info>
            <div data-reveal-item className="flex items-center gap-4">
              <span className="font-sans text-[12px] tracking-label text-terra">06</span>
              <span className="h-px w-10 bg-cream-line" />
              <span className="font-sans text-[12px] tracking-label text-ink/65">STUDIOS</span>
            </div>
            <h2 data-reveal-item className="mt-6 font-display text-[clamp(2rem,4.2vw,3.4rem)] font-light leading-[1.0] text-ink">
              Three studios.<br />One standard.
            </h2>
            <p data-reveal-item className="mt-5 max-w-[42ch] font-sans text-[16px] font-light leading-[1.8] text-ink/60 sm:text-[16px]">
              Visit us in Coimbatore, Bengaluru or Seelapadi — or send us your plan and we will call you back.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {STUDIOS.map((s) => (
                <div key={s.id} data-reveal-item className="border-t border-cream-line pt-5">
                  <h3 className="font-display text-[1.4rem] font-light text-ink">{s.city}</h3>
                  <p className="mt-1 font-sans text-[12px] tracking-label text-brass">{s.role.toUpperCase()}</p>
                  <address className="mt-4 not-italic font-sans text-[16px] font-light leading-[1.7] text-ink/65">
                    {s.lines.map((l) => (
                      <span key={l} className="block">{l}</span>
                    ))}
                  </address>
                  {s.phone && (
                    <a className="mt-4 inline-block font-sans text-[16px] text-ink/75" href={`tel:${s.phone.replace(/\s+/g, '')}`}>{s.phone}</a>
                  )}
                  <a
                    href={mapsHref(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-4 inline-flex items-center gap-2 font-sans text-[12px] tracking-label text-ink transition-colors hover:text-terra"
                  >
                    VIEW ON GOOGLE MAPS
                    <span className="transition-transform duration-500 group-hover:translate-x-1">↗</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
