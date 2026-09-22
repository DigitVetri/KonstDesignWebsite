import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useDialogFocus } from '../hooks/useDialogFocus.js'
import { PROJECTS } from '../data/projects.js'

/**
 * The project case-study modal — a premium panel above the gallery, never a
 * new page. Large image left, full information right; on mobile it stacks
 * image → info → services → details → CTA. Opens with a soft scale/fade,
 * closes on the × or Escape, and leaves the gallery untouched behind it so the
 * reader returns to the exact project they left.
 */
export function ProjectDetail({ index, onClose }) {
  const root = useRef(null)
  const panel = useRef(null)
  useDialogFocus(panel)
  const p = PROJECTS[index]
  const total = PROJECTS.length

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: 'power2.out' })
      .fromTo(
        panel.current,
        { opacity: 0, y: 30, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' },
        0.04,
      )
    return () => tl.kill()
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={root}
      className="site-dialog fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${p.title} — project detail`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/75 backdrop-blur-[3px]"
      />

      <div
        ref={panel}
        className="relative z-10 grid max-h-[92svh] w-full max-w-[1280px] grid-rows-[auto] overflow-hidden rounded-[3px] border border-bone/12 bg-cocoa shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9)] lg:max-h-[88svh] lg:grid-cols-[1.1fr_1fr] lg:grid-rows-1"
      >
        {/* ── image ─────────────────────────────────────────────────────── */}
        <div className="relative h-[34svh] min-h-0 lg:h-full">
          <img
            src={p.image}
            alt={p.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center bg-brass/90 font-sans text-[12px] tracking-label text-ink">
            {p.number}
          </span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cocoa/70 to-transparent" />
        </div>

        {/* ── information ───────────────────────────────────────────────── */}
        <div className="relative flex min-h-0 flex-col overflow-y-auto px-6 py-7 sm:px-9 sm:py-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center border border-bone/25 text-bone/70 transition-colors hover:border-bone hover:text-bone"
          >
            <span className="relative block h-3.5 w-3.5">
              <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>

          <p className="pr-12 font-sans text-[12px] tracking-label text-brass">
            {p.category.toUpperCase()} — {p.number} / {String(total).padStart(2, '0')}
          </p>
          <h3 className="mt-4 font-display text-[clamp(1.7rem,3.4vw,2.7rem)] font-light leading-[1.03] text-bone">
            {p.title}
          </h3>
          <p className="mt-3 font-sans text-[12px] tracking-label text-bone/50">
            {p.location} · {p.year} · {p.area}
          </p>

          <div className="mt-6 space-y-4">
            {p.description.map((para, i) => (
              <p key={i} className="font-sans text-[16px] font-light leading-[1.75] text-bone/70 sm:text-[16px]">
                {para}
              </p>
            ))}
          </div>

          {/* service tags */}
          <div className="mt-7 flex flex-wrap gap-2">
            {p.services.map((s) => (
              <span
                key={s}
                className="border border-bone/18 px-3 py-1.5 font-sans text-[12px] tracking-label text-bone/60"
              >
                {s.toUpperCase()}
              </span>
            ))}
          </div>

          {/* detail rows */}
          <dl className="mt-8 border-t border-bone/12">
            {p.details.map((d) => (
              <div
                key={d.label}
                className="flex items-baseline justify-between gap-4 border-b border-bone/12 py-3"
              >
                <dt className="font-sans text-[12px] tracking-label text-bone/65">
                  {d.label.toUpperCase()}
                </dt>
                <dd className="text-right font-display text-[15px] font-light text-bone/85">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => {
              onClose()
              requestAnimationFrame(() =>
                document.getElementById('start-project')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
              )
            }}
            className="group mt-8 inline-flex w-fit items-center gap-3 border border-bone/30 px-6 py-3 font-sans text-[12px] tracking-label text-bone transition-colors duration-500 hover:border-brass hover:bg-brass hover:text-ink"
          >
            START A PROJECT LIKE THIS
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
