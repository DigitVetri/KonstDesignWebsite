/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE WORDMARK, BURNING
 * ─────────────────────────────────────────────────────────────────────────────
 *  The letters never move. What moves is a charring front that crosses them
 *  from left to right, and everything else is hung off that one position:
 *
 *    · a mask whose burnt-away side is displaced by fractal noise, so the edge
 *      tears the way paper tears rather than wiping like a rectangle;
 *    · a second copy of the same letters in charcoal, revealed only in a narrow
 *      band that rides the front — the scorch running ahead of the loss;
 *    · a thin ember line inside that band, the only warm colour on screen;
 *    · ash flaking off the front and drifting up;
 *    · smoke above it, thickest where the front is, dispersing as it rises.
 *
 *  There is no fire and there are no flames — the burning is read entirely from
 *  char, ash and smoke. Nothing here animates itself: every value is written
 *  from the scroll-driven render loop in `HomeFilms`.
 */

const W = 1600
const H = 420
const BASE = 258 // the wordmark's baseline
const SUB_BASE = 336 // the tagline sits under it, sharing the same masks

/** the wordmark and its tagline, set once and reused by all three passes */
const MARK = { fontSize: 168, fontWeight: 800, letterSpacing: '0.02em' }
const SUB = { fontSize: 30, fontWeight: 300, letterSpacing: '0.34em' }

/** deterministic scatter, so the ash is the same flakes on every render */
const rand = (i, k) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const ASH = Array.from({ length: 34 }, (_, i) => ({
  dy: rand(i, 1) * 190 + 30, // how far it has risen
  dx: (rand(i, 2) - 0.5) * 150, // and drifted
  y: 90 + rand(i, 3) * 170, // where on the letters it broke off
  r: 1.1 + rand(i, 4) * 2.6,
  lead: rand(i, 5) * 90, // how far behind the front it lets go
  spin: rand(i, 6),
}))

const SMOKE = Array.from({ length: 7 }, (_, i) => ({
  dy: 60 + rand(i, 11) * 210,
  dx: (rand(i, 12) - 0.5) * 190,
  rx: 46 + rand(i, 13) * 74,
  ry: 30 + rand(i, 14) * 52,
  lead: rand(i, 15) * 120,
  o: 0.15 + rand(i, 16) * 0.23, // read against a pale wall, not a dark one
}))

/**
 * One pass of the branding: the wordmark and, under it, the tagline. Both are
 * drawn inside whichever mask the caller wraps them in, which is the whole
 * trick — the char front is a single horizontal position, so it crosses the
 * tagline at the same moment it crosses the letters above, and the two read as
 * one sheet of material burning rather than two elements animating together.
 */
const Lettering = ({ text, sub, fill }) => (
  <>
    <text x={W / 2} y={BASE} textAnchor="middle" className="font-sans" style={{ ...MARK, fill }}>
      {text}
    </text>
    <text x={W / 2} y={SUB_BASE} textAnchor="middle" className="font-sans" style={{ ...SUB, fill }}>
      {sub}
    </text>
  </>
)

export function BurnMark({ text, sub, markRef }) {
  return (
    <svg
      ref={markRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-[min(94vw,1180px)]"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* the torn edge: fractal noise pushing the mask's boundary around, so
            the burn line is never straight */}
        <filter id="bm-tear" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.042" numOctaves="4" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="54" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* smoke gets its own, softer noise and a heavy blur */}
        <filter id="bm-smoke" x="-70%" y="-70%" width="240%" height="240%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="13" />
        </filter>

        {/* what is left of the letters — everything the front has not passed */}
        <mask id="bm-standing" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect x="0" y="0" width={W} height={H} fill="#fff" />
          <rect data-burn-eaten x="0" y="-60" width="0" height={H + 120} fill="#000" filter="url(#bm-tear)" />
        </mask>

        {/* the scorch band that rides just ahead of the loss */}
        <linearGradient data-burn-char id="bm-charline" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.42" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="bm-char" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect x="0" y="0" width={W} height={H} fill="url(#bm-charline)" filter="url(#bm-tear)" />
        </mask>

        {/* the ember line is thinner still, and sits inside the char */}
        <linearGradient data-burn-ember id="bm-emberline" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="bm-ember" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect x="0" y="0" width={W} height={H} fill="url(#bm-emberline)" filter="url(#bm-tear)" />
        </mask>
      </defs>

      {/* smoke sits behind the letters so it never washes them out */}
      <g data-burn-smoke style={{ opacity: 0 }} filter="url(#bm-smoke)">
        {SMOKE.map((s, i) => (
          <ellipse key={i} data-smoke={i} cx="0" cy={BASE - 40} rx={s.rx} ry={s.ry} fill="#8e8378" />
        ))}
      </g>

      {/* 1 · what is still standing */}
      <g mask="url(#bm-standing)">
        <Lettering text={text} sub={sub} fill="#ede7de" />
      </g>

      {/* 2 · charcoal, in the band the front has just reached */}
      <g mask="url(#bm-char)">
        <Lettering text={text} sub={sub} fill="#241a12" />
      </g>

      {/* 3 · the ember line — the only warm light, and deliberately faint */}
      <g data-burn-glow mask="url(#bm-ember)" style={{ opacity: 0 }}>
        <Lettering text={text} sub={sub} fill="#c4703a" />
      </g>

      {/* 4 · ash breaking off the front and lifting away */}
      <g data-burn-ash style={{ opacity: 0 }}>
        {ASH.map((a, i) => (
          <circle key={i} data-ash={i} cx="0" cy={a.y} r={a.r} fill={a.spin > 0.5 ? '#6b5a4b' : '#3a2f28'} />
        ))}
      </g>
    </svg>
  )
}

export { ASH, SMOKE, W as BURN_W, H as BURN_H }
