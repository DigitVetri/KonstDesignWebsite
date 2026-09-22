import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SERVICES } from '../data/services.js'
import { ServiceDetail } from '../services/ServiceDetail.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { useServicesTimeline } from '../services/useServicesTimeline.js'
import { ProgressRail } from './ProgressRail.jsx'

/**
 * The pinned pass needs enough height to hold a whole card — photograph,
 * number, title and description — inside one viewport. Below this the cards
 * would have to shrink past the point where the row is worth travelling, so
 * the section falls back to the plain stacked layout instead. A phone held
 * upright clears it comfortably; a phone on its side does not, and gets the
 * stack.
 */
const TALL_ENOUGH = '(min-height: 640px)'

/**
 * One service card. Identical markup in both layouts — the same image, the
 * same "Explore ↗" badge on the same button, the same number, rule, title and
 * description, in the same order — so the only thing the two branches below
 * disagree about is how the six of them are arranged and whether that
 * arrangement moves.
 */
function ServiceCard({ service, onOpen, reveal }) {
  const revealProps = reveal ? { 'data-reveal': '', 'data-reveal-self': '' } : {}
  return (
    <article {...revealProps} className="service-card">
      <button className="image-button" onClick={onOpen} aria-label={`Explore ${service.title}`}>
        <img src={service.image} alt={service.title} width={1600} height={1066} loading="lazy" decoding="async" />
        <span className="image-action" aria-hidden="true">Explore <span>↗</span></span>
      </button>
      <div className="card-title"><span>{service.number}</span><h3><button onClick={onOpen}>{service.title}</button></h3></div>
      <p className="card-description">{service.blurb}</p>
    </article>
  )
}

export function Services({ reduced }) {
  const root = useRef(null)
  const panel = useRef(null)
  const track = useRef(null)
  const rail = useRef(null)
  const marker = useRef(null)
  const [open, setOpen] = useState(null)

  const tallEnough = useMediaQuery(TALL_ENOUGH)
  const horizontal = !reduced && tallEnough

  useScrollReveal(root, { reduced, start: 'top 92%' })
  useServicesTimeline(root, panel, track, rail, marker, { enabled: horizontal })

  /* Swapping between the two layouts changes the height of the page under
     every section below this one — a rotation into landscape is the usual
     way it happens — so every trigger on the page is re-measured once the
     new layout has painted. */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [horizontal])

  const heading = (
    <header className="section-heading" data-reveal>
      <p className="eyebrow">02 / Our expertise</p>
      <div className="section-heading-row"><h2>Every room.<br /><em>Considered.</em></h2><p>From the first layout to the last detail, we bring the same care to every part of your home.</p></div>
    </header>
  )

  const detail = open !== null && (
    <ServiceDetail
      index={open}
      onClose={() => setOpen(null)}
      onPrev={() => setOpen(i => (i + SERVICES.length - 1) % SERVICES.length)}
      onNext={() => setOpen(i => (i + 1) % SERVICES.length)}
    />
  )

  /* ── the static fallback ─────────────────────────────────────────────────
     Taken under `prefers-reduced-motion`, and on any viewport too short to
     hold a card inside a pinned panel. No pin, no horizontal scrub, nothing
     that moves under the scrollbar: the six cards simply stack down the page
     in their fixed order, exactly the layout the section has always had. Same
     content, same modal, no motion. */
  if (!horizontal) {
    return (
      <section id="services" ref={root} className="portfolio-section services-section">
        <div className="site-container">
          {heading}
          <div className="service-grid">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.id} service={s} reveal onOpen={() => setOpen(i)} />
            ))}
          </div>
        </div>
        {detail}
      </section>
    )
  }

  /* ── the pinned horizontal pass ──────────────────────────────────────────
     The section holds the viewport while the row of six travels right → left
     in step with the scroll, the heading held still above it and the rail
     marker running 01 → 06 underneath. See useServicesTimeline for the
     mechanics; everything here is layout only. */
  return (
    <section id="services" ref={root} className="services-section services-rail-section">
      <div ref={panel} className="services-panel panel-h">
        <div className="site-container services-panel-inner">
          {heading}

          <div className="services-frame">
            <div ref={track} className="services-track">
              {SERVICES.map((s, i) => (
                <ServiceCard key={s.id} service={s} onOpen={() => setOpen(i)} />
              ))}
            </div>
          </div>

          <ProgressRail from="01" to="06" railRef={rail} markerRef={marker} className="services-progress" />
        </div>
      </div>
      {detail}
    </section>
  )
}
