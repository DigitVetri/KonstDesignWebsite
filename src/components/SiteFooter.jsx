import { useRef } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { FOOTER, EMAIL, PHONE_PRIMARY, PHONE_SECONDARY } from '../data/studio.js'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FOOTER  ·  the final handoff
 * ─────────────────────────────────────────────────────────────────────────────
 *  The dark page that closes the site — deep cocoa with the inverse cream grid,
 *  bookending Quote 3 and Projects in the same one system. Reuses the site's
 *  tokens throughout; no new palette. Social links are rendered but not
 *  invented — they await real handles.
 */
export function SiteFooter({ reduced = false }) {
  const root = useRef(null)
  useScrollReveal(root, { reduced, start: 'top 88%' })

  return (
    <footer ref={root} className="relative overflow-hidden bg-cocoa text-bone">
      <div className="q-grid q-grid-brown" />
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 py-[12vh] sm:px-10 lg:px-14">
        {/* ── brand ────────────────────────────────────────────────────── */}
        <div data-reveal className="border-b border-bone/12 pb-12">
          <h2 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-light tracking-[0.02em] text-bone">
            KONST DESIGN
          </h2>
          <p className="mt-3 font-sans text-[12px] tracking-label text-brass">
            ARCHITECTURE&nbsp;•&nbsp;INTERIORS&nbsp;•&nbsp;3D&nbsp;VISUALIZATION
          </p>
        </div>

        {/* ── columns ──────────────────────────────────────────────────── */}
        <div data-reveal className="grid grid-cols-2 gap-10 pt-12 sm:grid-cols-4">
          <nav aria-label="Footer">
            <p className="font-sans text-[12px] tracking-label text-bone/60">NAVIGATION</p>
            <ul className="mt-5 space-y-3">
              {FOOTER.nav.map((n) => (
                <li key={n.label}>
                  <a href={n.href} className="font-sans text-[16px] font-light text-bone/70 transition-colors hover:text-bone">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-sans text-[12px] tracking-label text-bone/60">SERVICES</p>
            <ul className="mt-5 space-y-3">
              {FOOTER.services.map((sv) => (
                <li key={sv} className="font-sans text-[16px] font-light text-bone/70">{sv}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-sans text-[12px] tracking-label text-bone/60">CONTACT</p>
            <ul className="mt-5 space-y-3">
              <li><a href={`tel:${PHONE_PRIMARY.replace(/\s+/g, '')}`} className="font-sans text-[16px] font-light text-bone/70 transition-colors hover:text-bone">{PHONE_PRIMARY}</a></li>
              <li><a href={`tel:${PHONE_SECONDARY.replace(/\s+/g, '')}`} className="font-sans text-[16px] font-light text-bone/70 transition-colors hover:text-bone">{PHONE_SECONDARY}</a></li>
              <li><a href={`mailto:${EMAIL}`} className="font-sans text-[16px] font-light text-bone/70 transition-colors hover:text-bone">{EMAIL}</a></li>
            </ul>
          </div>

          <div>
            <p className="font-sans text-[12px] tracking-label text-bone/60">FOLLOW</p>
            <ul className="mt-5 space-y-3">
              {FOOTER.social.map((soc) =>
                soc.href ? (
                  <li key={soc.label}>
                    <a href={soc.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 font-sans text-[16px] font-light text-bone/70 transition-colors hover:text-bone">
                      {soc.label}<span className="text-bone/60 transition-transform duration-500 group-hover:translate-x-0.5">↗</span>
                    </a>
                  </li>
                ) : (
                  <li key={soc.label} className="flex items-center gap-1.5 font-sans text-[16px] font-light text-bone/55">
                    {soc.label}<span className="text-bone/30">↗</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* ── baseline ─────────────────────────────────────────────────── */}
        <div data-reveal className="mt-14 flex flex-col gap-3 border-t border-bone/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[12px] tracking-label text-bone/60">
            © {new Date().getFullYear()} KONST DESIGN · COIMBATORE · BENGALURU · SEELAPADI
          </p>
          <p className="font-sans text-[12px] tracking-label text-bone/60">
            ARCHITECTURE · INTERIORS · 3D
          </p>
        </div>
      </div>
    </footer>
  )
}
