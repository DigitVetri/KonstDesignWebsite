import { useRef, useState } from 'react'
import { PROJECTS } from '../data/projects.js'
import { ProjectDetail } from '../projects/ProjectDetail.jsx'
import { useScrollReveal } from '../hooks/useScrollReveal.js'

export function Projects({ reduced = false }) {
  const root = useRef(null)
  const [open, setOpen] = useState(null)
  useScrollReveal(root, { reduced, start: 'top 92%' })
  return (
    <section id="projects" ref={root} className="portfolio-section projects-section">
      <div className="site-container">
        <header className="section-heading" data-reveal>
          <p className="eyebrow">03 / Selected work</p>
          <div className="section-heading-row"><h2>Places with<br /><em>a point of view.</em></h2><p>A selection of architecture, interiors and visualization. Open a project to explore the thinking behind it.</p></div>
        </header>
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
      {open !== null && <ProjectDetail index={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
