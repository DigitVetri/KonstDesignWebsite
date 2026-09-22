/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE PROGRESS RAIL
 * ─────────────────────────────────────────────────────────────────────────────
 *  The site's one convention for "how far through a pinned section you are":
 *  the first index at the left, the last at the right, and a small house
 *  travelling the hairline between them. Services introduced it; Awards uses
 *  the same component and the same CSS, so the two can never drift into
 *  different-looking versions of the same idea.
 *
 *  The marker's position is never calculated here. The owning section hands in
 *  `railRef` and `markerRef` and drives the marker from its own ScrollTrigger's
 *  `progress`, which is what keeps the rail and the content in lockstep.
 */

/** The rail marker: a small house, drawn to the same weight as the rail. */
export function HouseMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.4V20h13V9.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5.4h4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * `orientation` only changes which way the hairline runs and which axis the
 * owner moves the marker along — it is the same markup, the same marker and
 * the same CSS block either way.
 */
export function ProgressRail({ from, to, railRef, markerRef, orientation = 'horizontal', className = '' }) {
  return (
    <div className={`rail-progress rail-progress-${orientation} ${className}`} aria-hidden="true">
      <span className="rail-progress-end">{from}</span>
      <div ref={railRef} className="rail-progress-rail">
        <span ref={markerRef} className="rail-progress-mark"><HouseMark /></span>
      </div>
      <span className="rail-progress-end">{to}</span>
    </div>
  )
}
