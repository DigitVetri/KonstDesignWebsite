import { useCallback, useRef } from 'react'
import { RoomDrawing } from '../about/RoomDrawing.jsx'
import { useAboutTimeline } from '../about/useAboutTimeline.js'
import { STAGES } from '../data/about.js'

/** Scroll budget for the pinned sequence, in viewport heights. */
const TRACK_VH = { wide: 360, narrow: 320 }

/** Stage 3's interior — a real film, not a drawing. Referenced from `public/`
 *  by absolute URL so the build copies it as-is and it resolves on Vercel. */
const INTERIOR_FILM = '/assets/video/interior.mp4'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ABOUT US
 * ─────────────────────────────────────────────────────────────────────────────
 *  One room, drawn, built and then designed in front of the reader — a single
 *  SVG whose three layers share one perspective solve, scrubbed by scroll.
 *
 *  Self-contained: it shares the Home page's design tokens and nothing else.
 *  No state, no store, no three.js — the hero above is untouched by it.
 */
export function About({ viewport, reduced = false }) {
  const root = useRef(null)
  const glow = useRef(null)
  const stacked = viewport.mobile || viewport.portrait

  /* The sequence runs on every screen that will accept motion. `mobile` is
     not a switch for whether it runs — it is how it runs: the hook reads it to
     drop the left/right offset the drawing flies through (there is no room for
     it beside a phone) and to soften the scale it takes on the way. Gating it
     off below the breakpoint, as this used to, left a phone with a static
     picture and three paragraphs where a desktop had the room being drawn. */
  useAboutTimeline(root, { mobile: stacked, enabled: !reduced })

  /* the drafting grid brightens in a soft circle around the cursor — pure
     CSS-variable + mask work, so it never triggers layout or reflow (§5) */
  const onMove = useCallback((e) => {
    const g = glow.current
    if (!g) return
    const r = g.getBoundingClientRect()
    g.style.setProperty('--mx', `${e.clientX - r.left}px`)
    g.style.setProperty('--my', `${e.clientY - r.top}px`)
    g.style.opacity = '1'
  }, [])
  const onLeave = useCallback(() => {
    if (glow.current) glow.current.style.opacity = '0'
  }, [])

  /* Desktop: the text sits opposite the visual and swaps sides with it.
     Stacked: reading order instead — visual above, its text below. */
  const panelBox = (side) =>
    stacked
      ? 'pointer-events-none absolute inset-x-0 top-[49vh] flex justify-center px-6'
      : `pointer-events-none absolute inset-y-0 ${side === 'right' ? 'right-0 pr-6 sm:pr-10 lg:pr-14' : 'left-0 pl-6 sm:pl-10 lg:pl-14'} flex w-[46vw] max-w-[620px] items-center`

  /* Reduced motion — and ONLY reduced motion — gets the reading fallback: the
     same three stages as prose, because there is no sequence to watch when
     nothing is allowed to move. A small screen is not that case, and giving it
     this tree meant it also got a heading and a photograph that exist nowhere
     on the desktop page. */
  if (reduced) return (
    <section id="about" className="portfolio-section about-reading">
      <div className="site-container">
        <header className="section-heading"><p className="eyebrow">01 / The studio</p><h2>From a line.<br /><em>To a way of living.</em></h2></header>
        <img className="about-reading-image" src="/assets/services/visiting-room.webp" width="1600" height="900" alt="Warm, carefully detailed living room" loading="lazy" />
        <div className="about-stage-list">{STAGES.map(s => <article key={s.id}><p className="eyebrow">{s.index} / {s.eyebrow}</p><h3>{s.note}</h3><p>{s.body}</p></article>)}</div>
      </div>
    </section>
  )

  return (
    <section
      id="about"
      ref={root}
      aria-label="About KONST DESIGN"
      className="relative bg-umber"
      style={{ height: `${stacked ? TRACK_VH.narrow : TRACK_VH.wide}vh` }}
    >
      <div
        className="sticky top-0 panel-h w-full overflow-hidden bg-about"
        onPointerMove={stacked ? undefined : onMove}
        onPointerLeave={onLeave}
      >
        {/* refined architectural grid over the (unchanged) About ground */}
        <div className="about-grid" aria-hidden="true" />
        <div ref={glow} className="about-grid-glow" aria-hidden="true" />
        {/* ── section mark ─────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex w-full max-w-[1400px] items-baseline justify-between px-5 pt-7 sm:px-8 lg:px-12">
            <p className="font-sans text-[12px] tracking-label text-brass">ABOUT&nbsp;US</p>
            <p className="font-sans text-[12px] tracking-label text-bone-dim sm:text-[12px]">
              COIMBATORE
            </p>
          </div>
          <div className="mx-auto mt-4 h-px w-full max-w-[1400px] bg-hair" />
        </div>

        {/* ── the room ─────────────────────────────────────────────────── */}
        <div
          className={
            stacked
              ? 'absolute inset-x-0 top-[13vh] z-10 flex justify-center px-4'
              : 'absolute inset-0 z-10 flex items-center justify-center'
          }
        >
          <div
            data-fly
            /* Stacked, the drawing and its panel are two fixed offsets down the
               same pinned panel (13vh and 49vh), so the drawing has to fit the
               36vh between them. Width alone cannot promise that: the room is
               10:7, and on a tablet the 580px cap makes it 406px tall against
               369px of room, which put its lower edge through the eyebrow. The
               45vh cap is the same limit expressed on the axis that is actually
               short — every phone width is well inside it, so only the tablet
               case moves. */
            className={`relative ${stacked ? 'w-[94vw] max-w-[min(580px,45vh)]' : 'w-[48vw] max-w-[860px]'}`}
            style={{ willChange: 'transform' }}
          >
            <RoomDrawing />
            {/* Stage 3. It sits in the same frame the drawing occupies and
                travels with it, so the completed room simply becomes the real
                interior in place. It never plays itself — no `autoplay`, no
                `loop`, no controls, and `play()` is never called; its playhead
                is the scroll position (see `useAboutTimeline.js`). */}
            <video
              data-interior
              className="absolute inset-0 h-full w-full object-cover"
              src={INTERIOR_FILM}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              style={{ opacity: 0, willChange: 'opacity' }}
            />
          </div>
        </div>

        {/* ── the copy, one panel per stage ────────────────────────────── */}
        {/*  Laid out as a page from a studio monograph rather than an image
            with a paragraph beside it: the stage number sets the column, a
            hairline carries the eye down, and the supporting line and the
            discipline sit on the baseline so the lower half of the column is
            composed rather than simply empty. */}
        {STAGES.map((s) => (
          <div key={s.id} className={panelBox(s.side)}>
            <div
              data-panel={s.id}
              className={`w-full max-w-[38rem] [text-shadow:0_2px_18px_rgba(8,7,6,0.85)] ${
                stacked ? 'text-center' : ''
              }`}
              style={{ willChange: 'transform, opacity' }}
            >
              {/* index + rule */}
              <div
                className={`flex items-center gap-4 ${stacked ? 'justify-center' : ''}`}
              >
                <span className="font-display text-[16px] font-light tracking-[0.18em] text-brass sm:text-[15px]">
                  {s.index}
                </span>
                <span className="h-px w-10 bg-brass/40 sm:w-14" />
                <span className="font-sans text-[12px] tracking-label text-brass sm:text-[12px]">
                  {s.eyebrow}
                </span>
              </div>

              <h2 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.75rem)] font-light leading-[1.02] text-bone sm:mt-6">
                {s.title}
              </h2>

              <p className="mt-4 font-display text-[clamp(0.95rem,1.5vw,1.3rem)] font-light italic leading-snug text-bone/60 sm:mt-5">
                {s.note}
              </p>

              <p className="mt-5 max-w-[34rem] font-sans text-[16px] font-light leading-[1.75] text-bone/72 sm:mt-6 sm:text-[16px]">
                {s.body}
              </p>

              {/* baseline: the discipline, and where this sits in the sequence */}
              <div
                className={`mt-8 flex items-baseline gap-4 border-t border-hair pt-4 sm:mt-10 sm:pt-5 ${
                  stacked ? 'justify-center' : 'justify-between'
                }`}
              >
                <span className="font-sans text-[12px] tracking-label text-bone-dim sm:text-[12px]">
                  {s.meta}
                </span>
                <span className="font-sans text-[12px] tracking-label text-bone-dim/70 sm:text-[12px]">
                  {s.index}&nbsp;/&nbsp;03
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* ── stage rail ───────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-y-[26vh] right-5 z-30 hidden lg:block">
          <div className="relative h-full w-px bg-white/[0.09]">
            <div data-rail-fill className="h-full w-full origin-top bg-brass/70" />
            {STAGES.map((s, i) => (
              <span
                key={s.id}
                data-tick={s.id}
                className="absolute -right-1 h-1.5 w-1.5 rounded-full bg-brass opacity-30"
                style={{ top: `${i * 50}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
