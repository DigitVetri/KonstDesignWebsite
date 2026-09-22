import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useDialogFocus } from '../hooks/useDialogFocus.js'
import { SERVICES } from '../data/services.js'

/* real studio contact, straight from konstdesign.in — the CTA opens a mail
   draft rather than inventing a form or a claim */
const ENQUIRY_EMAIL = 'Mohasher11@gmail.com'

/**
 * The expanded view for one service, floated above the gallery as a modal.
 *
 * It never navigates away and never reloads: the gallery stays mounted behind
 * it at its exact scroll position, and closing simply unmounts this overlay.
 * Previous / Next step through all six in place — image, number, title,
 * description and the 0X / 06 progress are all keyed to `index`, so they update
 * together every time.
 */
export function ServiceDetail({ index, onClose, onPrev, onNext }) {
  const root = useRef(null)
  const panel = useRef(null)
  useDialogFocus(panel)
  const service = SERVICES[index]

  /* enter animation, once */
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .fromTo(
        panel.current,
        { opacity: 0, y: 26, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' },
        0.05,
      )
    return () => tl.kill()
  }, [])

  /* background must not scroll while the modal is open; restoring the prior
     value returns the gallery to exactly where it was */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  /* keyboard: Esc closes, arrows move between services */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onPrev])

  /* cross-fade the image + copy whenever the service changes */
  const media = useRef(null)
  const copy = useRef(null)
  useEffect(() => {
    gsap.fromTo(
      [media.current, copy.current],
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06 },
    )
  }, [index])

  const total = SERVICES.length

  return (
    <div
      ref={root}
      className="site-dialog fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 lg:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={`${service.title} — service detail`}
    >
      {/* scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-[3px]"
      />

      <div
        ref={panel}
        className="relative z-10 flex max-h-[92svh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[4px] bg-cream shadow-[0_40px_120px_-30px_rgba(8,7,6,0.85)] md:grid md:grid-cols-[1.35fr_1fr] md:max-h-[86svh]"
      >
        {/* ── image ─────────────────────────────────────────────────────── */}
        <div
          ref={media}
          className="relative flex min-h-0 items-center justify-center bg-[#e7e0d2] p-3 sm:p-4"
        >
          <span className="pointer-events-none absolute left-4 top-4 z-10 font-display text-[13vw] font-light leading-none text-ink/[0.06] sm:text-[86px]">
            {service.number}
          </span>
          <img
            key={service.id}
            src={service.image}
            alt={service.title}
            className="max-h-[42svh] w-full rounded-[2px] object-contain md:max-h-full"
            style={{ aspectRatio: String(service.ratio) }}
          />
        </div>

        {/* ── copy ──────────────────────────────────────────────────────── */}
        <div ref={copy} className="flex min-h-0 flex-col overflow-y-auto px-6 py-7 sm:px-9 sm:py-9">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[12px] tracking-label text-brass">
              {service.number}&nbsp;/&nbsp;{String(total).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="group flex items-center gap-2 font-sans text-[12px] tracking-label text-ink/50 transition-colors hover:text-ink"
            >
              CLOSE
              <span className="relative block h-3 w-3">
                <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <p className="mt-1 font-sans text-[12px] tracking-label text-ink/60">SERVICE</p>
          <h3 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.9rem)] font-light leading-[1.02] text-ink">
            {service.title}
          </h3>

          <p className="mt-5 font-sans text-[16px] font-light leading-[1.75] text-ink/70 sm:text-[16px]">
            {service.blurb}
          </p>

          <a
            href={`mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(`Enquiry — ${service.title}`)}`}
            className="group mt-7 inline-flex w-fit items-center gap-3 border border-ink/25 px-6 py-3 font-sans text-[12px] tracking-label text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-cream"
          >
            ENQUIRE ABOUT THIS
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>

          {/* prev / next */}
          <div className="mt-auto flex items-center justify-between border-t border-cream-line pt-5">
            <button
              type="button"
              onClick={onPrev}
              className="group flex items-center gap-2 font-sans text-[12px] tracking-label text-ink/55 transition-colors hover:text-ink"
            >
              <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
              PREV
            </button>
            <div className="flex gap-1.5">
              {SERVICES.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-[5px] w-[5px] rounded-full transition-colors duration-300 ${
                    i === index ? 'bg-brass' : 'bg-ink/20'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onNext}
              className="group flex items-center gap-2 font-sans text-[12px] tracking-label text-ink/55 transition-colors hover:text-ink"
            >
              NEXT
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
