import { useCallback, useRef, useState } from 'react'
import { PROJECTS } from '../data/projects.js'
import { ProjectDetail } from '../projects/ProjectDetail.jsx'
import { useProjectsDeck } from '../projects/useProjectsDeck.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { ProgressRail } from './ProgressRail.jsx'

/**
 * The deck needs enough height to hold a card and its copy inside one
 * viewport. Below this — a phone on its side, a very short window — the
 * section falls back to the static list rather than pinning into a space it
 * cannot use. The same threshold Services and Recognition use.
 */
const TALL_ENOUGH = '(min-height: 640px)'
const STACKED = '(max-width: 1023.98px)'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SELECTED WORK  ·  the scroll-driven coverflow
 * ─────────────────────────────────────────────────────────────────────────────
 *  The heading reads first, in normal flow. Below it the stage pins, and from
 *  that moment one continuous `progress` — 0 at project 01, 5 at project 06 —
 *  drives everything at once: where each card sits on the arc, which copy
 *  block is lit, and where the marker stands on the rail. There is one source
 *  of truth and one ScrollTrigger, so nothing can drift out of sync.
 *
 *  `useProjectsDeck` owns the arc itself and is used unchanged. It writes
 *  transform and opacity only, once per scrubbed frame, and calls back with
 *  the progress it just applied — which is what positions the copy and the
 *  marker here, rather than a second calculation of the same thing.
 *
 *  Reduced motion, and any viewport too short to pin into, gets the plain
 *  static list instead: no pin, no arc, the same six projects in order.
 */
export function Projects({ reduced = false }) {
  const root = useRef(null)
  const stage = useRef(null)
  const deck = useRef(null)
  const rail = useRef(null)
  const marker = useRef(null)
  const copies = useRef([])
  const [open, setOpen] = useState(null)
  const [active, setActive] = useState(0)

  const tallEnough = useMediaQuery(TALL_ENOUGH)
  const stacked = useMediaQuery(STACKED)
  const coverflow = !reduced && tallEnough

  useScrollReveal(root, { reduced, start: 'top 92%' })

  /* Both of these are written straight to the DOM from the deck's own scrubbed
     frame — no React state per frame, and no second reading of scroll. */
  const onProgress = useCallback((p) => {
    const last = PROJECTS.length - 1
    copies.current.forEach((el, i) => {
      if (!el) return
      const d = Math.abs(i - p)
      const on = Math.max(0, 1 - d * 2.2)
      el.style.opacity = String(on)
      el.style.transform = `translate3d(0,${(i - p) * 18}px,0)`
      el.style.pointerEvents = on > 0.6 ? 'auto' : 'none'
    })
    const m = marker.current
    const r = rail.current
    if (m && r) {
      const runway = Math.max(0, r.clientHeight - m.offsetHeight)
      m.style.transform = `translate3d(0,${(p / last) * runway}px,0)`
    }
  }, [])

  const onActive = useCallback((i) => setActive(i), [])

  useProjectsDeck(stage, deck, PROJECTS.length, {
    mobile: stacked,
    enabled: coverflow,
    onActive,
    onProgress,
  })

  const heading = (
    <header className="section-heading" data-reveal>
      <p className="eyebrow">03 / Selected work</p>
      <div className="section-heading-row"><h2>Places with<br /><em>a point of view.</em></h2><p>A selection of architecture, interiors and visualization. Open a project to explore the thinking behind it.</p></div>
    </header>
  )

  const detail = open !== null && <ProjectDetail index={open} onClose={() => setOpen(null)} />

  /* ── the static fallback ─────────────────────────────────────────────────
     Exactly the layout this section has had all along: the same cards, the
     same order, the same modal, with nothing that moves under the scrollbar. */
  if (!coverflow) {
    return (
      <section id="projects" ref={root} className="portfolio-section projects-section">
        <div className="site-container">
          {heading}
          <div className="project-grid">
            {PROJECTS.map((p, i) => (
              <article className={`project-card ${i === 0 ? 'project-featured' : ''}`} key={p.id} data-reveal data-reveal-self>
                <button className="image-button" onClick={() => setOpen(i)} aria-label={`View ${p.title}`}>
                  <img src={p.image} alt={p.title} width={1600} height={1200} loading="lazy" decoding="async" />
                  <span className="image-action" aria-hidden="true">View project <span>↗</span></span>
                </button>
                <div className="project-copy">
                  <p className="eyebrow">{p.number} / {p.category}</p>
                  <h3><button onClick={() => setOpen(i)}>{p.title}</button></h3>
                  <p className="project-location">{p.location} <span>·</span> {p.year} <span>·</span> {p.area}</p>
                  {i === 0 && <><p className="card-description">{p.blurb}</p><button className="text-link" onClick={() => setOpen(i)}>Explore the project <span>↗</span></button></>}
                </div>
              </article>
            ))}
          </div>
        </div>
        {detail}
      </section>
    )
  }

  /* ── the pinned coverflow ────────────────────────────────────────────── */
  return (
    <section id="projects" ref={root} className="projects-section projects-deck-section">
      <div className="site-container">{heading}</div>

      <div ref={stage} className="projects-stage">
        <div className="projects-panel panel-h">
          {/* ── the ground the arc stands on ─────────────────────────────
              One floor plane, laid flat and seen at a raking angle: its lines
              run away from the reader and converge on a horizon, so the depth
              is real geometry rather than a pattern pretending to be deep. It
              is a CSS 3D transform — the site already leans on the compositor
              for everything else here, and a canvas redrawing a grid every
              frame would buy nothing. Over it, a warm wash lifting the
              near-black toward the umber the palette already holds. Both are
              painted, in the section's own colours, and neither takes a
              pointer event. */}
          <div className="projects-wash" aria-hidden="true" />
          <div className="projects-floor" aria-hidden="true">
            <span className="projects-floor-plane" />
            <span className="projects-floor-horizon" />
          </div>

          <div className="site-container projects-panel-inner">
            {/* ── the copy, swapping with the centre card ───────────────── */}
            <div className="projects-copy-stage">
              {PROJECTS.map((p, i) => (
                <div
                  key={p.id}
                  ref={(el) => { copies.current[i] = el }}
                  className="projects-copy-block"
                  aria-hidden={i === active ? undefined : 'true'}
                >
                  <p className="eyebrow">{p.number} / {p.category}</p>
                  <h3><button tabIndex={i === active ? 0 : -1} onClick={() => setOpen(i)}>{p.title}</button></h3>
                  <p className="project-location">{p.location} <span>·</span> {p.year} <span>·</span> {p.area}</p>
                  <p className="card-description">{p.blurb}</p>
                  <button className="text-link" tabIndex={i === active ? 0 : -1} onClick={() => setOpen(i)}>
                    View drawings <span>↗</span>
                  </button>
                </div>
              ))}
            </div>

            {/* ── the arc ───────────────────────────────────────────────── */}
            <div className="projects-board" ref={deck}>
              {PROJECTS.map((p, i) => (
                <div key={p.id} data-proj-card className="projects-card">
                  <button className="projects-card-hit" onClick={() => setOpen(i)} aria-label={`View ${p.title}`}>
                    {/* the card's back face, pushed away in Z — with the arc's
                        rotation this is what shows as the slab's edge, so the
                        cards read as printed boards with a thickness rather
                        than as rectangles cut out of nothing */}
                    <span className="projects-card-slab" aria-hidden="true" />
                    <span className="projects-card-face">
                      <span className="projects-card-shot">
                        <img src={p.image} alt={p.title} width={1600} height={1200} loading="lazy" decoding="async" />
                      </span>
                      <span className="projects-card-bar">
                        <span className="projects-card-lines">
                          <span className="projects-card-name">{p.title}</span>
                          <span className="projects-card-meta">{p.location} · {p.year}</span>
                        </span>
                        <span className="projects-card-open" aria-hidden="true">Open</span>
                      </span>
                    </span>
                    <span className="projects-card-tag" aria-hidden="true">{p.number}</span>
                  </button>
                </div>
              ))}
            </div>

            <ProgressRail
              from="01"
              to="06"
              orientation="vertical"
              railRef={rail}
              markerRef={marker}
              className="projects-rail"
            />
          </div>
        </div>
      </div>
      {detail}
    </section>
  )
}
