import { useRef } from 'react'
import { AWARDS, AWARD_CAPTION } from '../data/studio.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { useAwardsTimeline } from '../awards/useAwardsTimeline.js'
import { ProgressRail } from './ProgressRail.jsx'

/**
 * The pass needs enough height to hold a full-bleed photograph and its title
 * inside one viewport. Below it — a phone on its side, a very short window —
 * the section falls back to the static list rather than pinning into a space
 * it cannot use. The same threshold Services uses.
 */
const TALL_ENOUGH = '(min-height: 640px)'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RECOGNITION  ·  three awards, one pinned pass
 * ─────────────────────────────────────────────────────────────────────────────
 *  The site's established pinned-section pattern, not a new one: the panel is
 *  pinned by ScrollTrigger and scrubbed 1:1 by the scrollbar, and the shared
 *  progress rail — the same 01 → 03 hairline and travelling house Services
 *  uses — is driven from that same trigger's progress. See
 *  `useAwardsTimeline` for the mechanics; everything here is layout.
 *
 *  The left column holds still — index, "Awards", the awards' caption — while
 *  the title block beneath it swaps, and the right column is a loose pile of
 *  the three photographs, the current one square on top and the other two
 *  leaning out behind. Scrolling back reverses all of it.
 *
 *  The ground is not left bare: an oversized outline numeral sits behind the
 *  words and changes with the award, and two hairlines frame the panel — the
 *  same drafting-paper devices Experience already uses, at the same restraint.
 */
export function Recognition({ reduced = false }) {
  const root = useRef(null)
  const panel = useRef(null)
  const rail = useRef(null)
  const marker = useRef(null)

  const tallEnough = useMediaQuery(TALL_ENOUGH)
  const pinned = !reduced && tallEnough

  useAwardsTimeline(root, panel, rail, marker, { enabled: pinned, count: AWARDS.length })

  const header = (
    <div>
      <div className="flex items-center gap-4">
        <span className="font-sans text-[12px] tracking-label text-terra">04</span>
        <span className="h-px w-10 bg-cream-line" />
        <span className="font-sans text-[12px] tracking-label text-ink/65">RECOGNITION</span>
      </div>
      <h2 className="mt-6 font-display text-[clamp(3.4rem,8vw,7rem)] font-light leading-[0.92] text-ink">
        Awards
      </h2>
      <p className="mt-6 max-w-[34ch] font-sans text-[13px] font-light leading-[1.7] tracking-[0.04em] text-ink/60 sm:text-[15px]">
        {AWARD_CAPTION}
      </p>
    </div>
  )

  /** One award's words — the label, the title, and its secondary line. */
  const words = (a) => (
    <>
      <p className="font-sans text-[12px] tracking-label text-terra">AWARD {a.number}</p>
      <h3 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,3.2rem)] font-light leading-[1.06] text-ink">
        {a.title}
      </h3>
      {a.note && (
        <p className="mt-4 font-sans text-[12px] tracking-label text-ink/55">{a.note}</p>
      )}
    </>
  )

  /** One award's photograph, in the site's square-cornered figure treatment. */
  const photo = (a, className = '', style = undefined) => (
    <figure className={`overflow-hidden border border-cream-line bg-cream shadow-[0_18px_50px_-24px_rgba(11,10,9,0.45)] ${className}`} style={style}>
      <div className="aspect-[3/2] w-full">
        <img
          src={a.image}
          alt={`KONST DESIGN receiving the ${a.title} award`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    </figure>
  )

  /* ── the static fallback ─────────────────────────────────────────────────
     Taken under `prefers-reduced-motion`, and on any viewport too short to
     pin into. The three awards simply stack down the page with their
     photographs, in order, with nothing that moves under the scrollbar. */
  if (!pinned) {
    return (
      <section id="recognition" ref={root} aria-label="Recognition" className="relative bg-cream">
        <div className="q-grid q-grid-cream" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-[12vh] sm:px-10 lg:px-14">
          {header}
          <ol className="mt-[9vh] space-y-[9vh]">
            {AWARDS.map((a) => (
              <li key={a.id}>
                {photo(a)}
                <div className="mt-7">{words(a)}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  /* ── the pinned pass ─────────────────────────────────────────────────── */
  return (
    <section id="recognition" ref={root} aria-label="Recognition" className="relative overflow-x-clip bg-cream">
      <div className="q-grid q-grid-cream" />

      <div ref={panel} className="panel-h relative z-10 flex items-center">
        <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-6 pb-[3vh] pt-[11vh] sm:px-10 lg:px-14">
          {/* `relative` is here for the watermark's benefit. Below `lg` the
              column below dissolves into this grid (see `contents`), which
              would otherwise send the absolutely-positioned numeral looking
              further up the tree for a containing block and land it in a
              different place on a phone than on a desktop. */}
          <div className="relative grid flex-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
            {/* ── the words, held still ─────────────────────────────────── */}
            {/*  Stacked, the heading, the photograph and the award's title are
                three things in one column, and the photograph belongs between
                the other two — the award is named under the picture of it, not
                above. They cannot be ordered while two of them are wrapped in
                a column the third is outside of, so below `lg` the column
                stops generating a box and its children join this grid
                directly, where `order` can interleave them. From `lg` it is a
                block again and the two-column layout is exactly as it was. */}
            <div className="contents lg:block lg:relative lg:col-span-5">
              {/* the oversized numeral behind the words: the drafting-paper
                  watermark that keeps the ground from reading as bare, one
                  per award, changing with them */}
              <div aria-hidden="true" className="pointer-events-none absolute -left-2 -top-[7vh] select-none lg:-top-[10vh]">
                {AWARDS.map((a) => (
                  <span
                    key={a.id}
                    data-award-mark
                    className="award-watermark absolute left-0 top-0 font-display text-[clamp(11rem,22vw,19rem)] font-light leading-[0.8] text-terra/[0.07]"
                  >
                    {a.number}
                  </span>
                ))}
              </div>

              {/* `relative` on both of these is what keeps them painted over
                  the watermark: it is absolutely positioned, so in-flow
                  siblings sit under it unless they are positioned too. */}
              <div className="relative order-1 lg:order-none">{header}</div>

              {/* the swapping block: every award is rendered, stacked in the
                  same place, and only one is ever opaque. Stacked it follows
                  the photograph, so the top margin that separated it from the
                  heading gives way to the grid's own gap. */}
              <div data-award-titles className="relative order-3 lg:order-none lg:mt-[5vh]">
                {AWARDS.map((a) => (
                  <div key={a.id} data-award-title className="absolute inset-x-0 top-0">
                    {words(a)}
                  </div>
                ))}
              </div>
            </div>

            {/* ── the pile of photographs ───────────────────────────────── */}
            <div className="order-2 lg:order-none lg:col-span-7">
              <div className="relative mx-auto aspect-[3/2] w-full max-w-[38rem] lg:max-w-none">
                {AWARDS.map((a) => (
                  <div
                    key={a.id}
                    data-award-photo
                    className="absolute inset-0 will-change-transform"
                  >
                    {photo(a, 'h-full w-full')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* two hairlines closing the panel, the same drafting device the
              Experience section rules its hero with */}
          <div aria-hidden="true" className="mt-[3vh] h-px w-full bg-cream-line" />
          <ProgressRail from="01" to="03" railRef={rail} markerRef={marker} className="mt-5 flex-none" />
        </div>
      </div>
    </section>
  )
}
