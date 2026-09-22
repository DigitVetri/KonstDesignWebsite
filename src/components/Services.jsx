import { useRef, useState } from 'react'
import { SERVICES } from '../data/services.js'
import { ServiceDetail } from '../services/ServiceDetail.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'

export function Services({ reduced }) {
  const root = useRef(null)
  const [open, setOpen] = useState(null)
  useScrollReveal(root, { reduced, start: 'top 92%' })
  return (
    <section id="services" ref={root} className="portfolio-section services-section">
      <div className="site-container">
        <header className="section-heading" data-reveal>
          <p className="eyebrow">02 / Our expertise</p>
          <div className="section-heading-row"><h2>Every room.<br /><em>Considered.</em></h2><p>From the first layout to the last detail, we bring the same care to every part of your home.</p></div>
        </header>
        <div className="service-grid">
          {SERVICES.map((s, i) => (
            <article key={s.id} data-reveal data-reveal-self className="service-card">
              <button className="image-button" onClick={() => setOpen(i)} aria-label={`Explore ${s.title}`}>
                <img src={s.image} alt={s.title} width={1600} height={1066} loading="lazy" decoding="async" />
                <span className="image-action" aria-hidden="true">Explore <span>↗</span></span>
              </button>
              <div className="card-title"><span>{s.number}</span><h3><button onClick={() => setOpen(i)}>{s.title}</button></h3></div>
              <p className="card-description">{s.blurb}</p>
            </article>
          ))}
        </div>
      </div>
      {open !== null && <ServiceDetail index={open} onClose={() => setOpen(null)} onPrev={() => setOpen(i => (i + SERVICES.length - 1) % SERVICES.length)} onNext={() => setOpen(i => (i + 1) % SERVICES.length)} />}
    </section>
  )
}
