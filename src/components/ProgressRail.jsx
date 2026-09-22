import { useId } from 'react'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE PROGRESS RAIL
 * ─────────────────────────────────────────────────────────────────────────────
 *  The site's one convention for "how far through a pinned section you are":
 *  the first index at the left, the last at the right, and a small house
 *  travelling the hairline between them. Services introduced it; Awards and
 *  Projects use the same component and the same CSS, so they can never drift
 *  into different-looking versions of the same idea.
 *
 *  The marker's position is never calculated here. The owning section hands in
 *  `railRef` and `markerRef` and drives the marker from its own ScrollTrigger's
 *  `progress`, which is what keeps the rail and the content in lockstep.
 */

/**
 * The rail marker: a small house with its light on.
 *
 * The outline is the same silhouette, at the same weight, the rail has always
 * used — what is new is the doorway, which is filled with warm light rather
 * than drawn, and the soft pool that light throws around it. Both live INSIDE
 * the 24-unit viewBox and fade to nothing before they reach its edge, so the
 * glow stays on the house: it never spills onto the hairline, the indices or
 * anything the marker travels past. Being in viewBox units it also scales with
 * the icon, so the bloom stays in proportion at any size rather than turning
 * into a blurred smudge on a small one.
 *
 * Every gradient and filter id is scoped by `useId`, because three of these
 * render on one page and duplicate ids in a document are invalid.
 */
export function HouseMark() {
  const uid = useId()
  const glow = `${uid}-glow`
  const bloom = `${uid}-bloom`

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <defs>
        {/* stop-color is set in CSS so the hue can follow the section it is
            standing on — an attribute cannot read a custom property */}
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopOpacity=".85" />
          <stop offset="45%" stopOpacity=".34" />
          <stop offset="100%" stopOpacity="0" />
        </radialGradient>
        <filter id={bloom} x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.15" />
        </filter>
      </defs>

      {/* the light the doorway throws into the room around it */}
      <circle className="rail-mark-glow" cx="12" cy="15" r="8" fill={`url(#${glow})`} />

      {/* the house, at the rail's own weight */}
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.4V20h13V9.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* the lit doorway: a soft bloom under a clean plate of light */}
      <path className="rail-mark-lit" d="M10 20v-5.4h4V20Z" filter={`url(#${bloom})`} />
      <path className="rail-mark-lit" d="M10 20v-5.4h4V20Z" />
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
