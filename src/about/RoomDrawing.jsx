import { memo } from 'react'
import {
  ART, BBOX, BTL, BTR, CEIL, DOOR, FBL, FBR, FRONT, FTL, FTR, FURNITURE,
  LIGHT_POOL, NICHE, P, SLATS, STONE, SURFACE, TRIM, VIEW, WIN, WINR,
  fx, fy, line, poly, seg
} from './geometry.js'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ROOM, IN ONE SVG
 * ─────────────────────────────────────────────────────────────────────────────
 *  Three layers stacked on identical coordinates:
 *
 *    sketch    pen lines that draw themselves stroke by stroke
 *    shell     the same lines gaining surface, depth and shadow
 *    interior  paint, materials, ceiling, floor, furniture, decor, light
 *
 *  Because every layer is generated from `geometry.js`, the window in the
 *  finished interior is the same window, to the pixel, as the one in the first
 *  sketch. There is no second asset to drift out of alignment.
 *
 *  Nothing in here animates. Everything animated carries a `data-` hook and is
 *  driven entirely by the scrubbed timeline in `useAboutTimeline.js`.
 */

/**
 * A stroke that has not been drawn yet.
 *
 * `pathLength` normalises every path so a single dashoffset value means
 * "undrawn" whatever the line's real length. It is 1000 rather than 1 because
 * GSAP rounds px-unit values to whole numbers — normalising to 1 collapses the
 * whole reveal into a single integer step, and every line snaps in instead of
 * drawing itself.
 */
export const SK_LEN = 1000

const Ink = ({ d, w = 1.15, o = 0.78, g }) => (
  <path
    data-sk={g}
    d={d}
    pathLength={SK_LEN}
    strokeDasharray={SK_LEN}
    strokeDashoffset={SK_LEN}
    strokeWidth={w}
    style={{ opacity: o }}
  />
)

/**
 * A clip that wipes its content in from one edge.
 *
 * `from` names the edge the surface grows out of — a wall grows out of the
 * corner it meets, the floor grows back-to-front — and the timeline reads it
 * off `data-from`. The origin is expressed against the rect's own box rather
 * than in user space: GSAP's `svgOrigin` leaves a residual translate behind
 * when it is set on an element that already carries a transform, which silently
 * slides a clip off the surface it is meant to reveal.
 */
const Sweep = ({ id, bbox, from, pad = 2 }) => (
  <clipPath id={id} clipPathUnits="userSpaceOnUse">
    <rect
      data-clip={id}
      data-from={from}
      x={bbox.x - pad}
      y={bbox.y - pad}
      width={bbox.w + pad * 2}
      height={bbox.h + pad * 2}
    />
  </clipPath>
)

const F = FURNITURE

export const RoomDrawing = memo(function RoomDrawing() {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="block h-auto w-full"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* progressive wipes ------------------------------------------------ */}
        <Sweep id="sw-floor" bbox={BBOX.floor} from="top" />
        <Sweep id="sw-wallL" bbox={BBOX.wallL} from="right" />
        <Sweep id="sw-wallR" bbox={BBOX.wallR} from="left" />
        <Sweep id="sw-wallB" bbox={BBOX.wallB} from="left" />
        <Sweep id="sw-ceil" bbox={BBOX.ceiling} from="bottom" />

        {/* the room can only ever be seen through its own frame ------------- */}
        <clipPath id="sw-art" clipPathUnits="userSpaceOnUse">
          <path d={poly(ART)} />
        </clipPath>

        <clipPath id="sw-rug" clipPathUnits="userSpaceOnUse">
          <path d={poly(FURNITURE.rug)} />
        </clipPath>

        <clipPath id="sw-frame" clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width={VIEW.w} height={VIEW.h} />
        </clipPath>

        <linearGradient id="gr-cornerL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.34" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gr-cornerR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.34" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gr-ceil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.34" />
          <stop offset="1" stopColor="#000" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="gr-floorFade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gr-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd8dd" />
          <stop offset="0.55" stopColor="#b9c3c6" />
          <stop offset="1" stopColor="#cdbfa6" />
        </linearGradient>
        {/* one blur, shared by every contact shadow in the room */}
        <filter id="f-soft" x="-80%" y="-120%" width="260%" height="360%">
          <feGaussianBlur stdDeviation="9" />
        </filter>


        {/* ── materials ────────────────────────────────────────────────────
            Each is a gradient rather than a flat fill, because a flat fill is
            exactly what makes vector furniture read as a diagram: real fabric
            falls off toward its own shadow, real stone is not one colour, and
            brass has a hot line across it. */}
        {/* the sofa's charcoal weave */}
        <linearGradient id="m-fabTop" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#63656a" />
          <stop offset="1" stopColor="#53555a" />
        </linearGradient>
        <linearGradient id="m-fabFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#55575c" />
          <stop offset="1" stopColor="#44464b" />
        </linearGradient>
        <linearGradient id="m-fabSide" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#42444a" />
          <stop offset="1" stopColor="#34363b" />
        </linearGradient>
        {/* the armchair's taupe */}
        <linearGradient id="m-taupeTop" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#a99f92" />
          <stop offset="1" stopColor="#968c80" />
        </linearGradient>
        <linearGradient id="m-taupeFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#948a7e" />
          <stop offset="1" stopColor="#7f7669" />
        </linearGradient>
        <linearGradient id="m-taupeSide" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#7d7468" />
          <stop offset="1" stopColor="#68604f" />
        </linearGradient>
        <linearGradient id="m-stoneTop" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ddd4c6" />
          <stop offset="0.45" stopColor="#cbc1b1" />
          <stop offset="0.7" stopColor="#d6ccbd" />
          <stop offset="1" stopColor="#c2b8a8" />
        </linearGradient>
        <linearGradient id="m-walnutTop" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#75634f" />
          <stop offset="1" stopColor="#5d4e3e" />
        </linearGradient>
        <linearGradient id="m-walnutFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b4c3d" />
          <stop offset="1" stopColor="#463a2e" />
        </linearGradient>
      </defs>

      <g clipPath="url(#sw-frame)">
        {/* ══ SHELL ═══════════════════════════════════════════════════════ */}
        {/*  The sketch lines gaining surface, at the positions they already
            occupy. Every one of these is a wipe, not a fade-in.            */}
        <g data-layer="shell">
          <g clipPath="url(#sw-ceil)">
            <path d={SURFACE.ceiling} fill="#5f5a55" />
            <path d={SURFACE.ceiling} fill="url(#gr-ceil)" />
          </g>
          <g clipPath="url(#sw-floor)">
            <path d={SURFACE.floor} fill="#6d6862" />
            <path d={SURFACE.floor} fill="url(#gr-floorFade)" opacity="0.5" />
          </g>
          <g clipPath="url(#sw-wallB)">
            <path d={SURFACE.wallB} fill="#8a847b" />
          </g>
          <g clipPath="url(#sw-wallL)">
            <path d={SURFACE.wallL} fill="#7b756d" />
          </g>
          <g clipPath="url(#sw-wallR)">
            <path d={SURFACE.wallR} fill="#6e6862" />
          </g>

          {/* corners gain depth — the flat sketch becomes a real volume */}
          <g data-a="a-corners" opacity="0">
            <path d={SURFACE.wallL} fill="url(#gr-cornerL)" />
            <path d={SURFACE.wallR} fill="url(#gr-cornerR)" />
            <path d={SURFACE.ceiling} fill="url(#gr-ceil)" opacity="0.4" />
          </g>

          {/* the opening gains a reveal, then glass */}
          <g data-a="a-winreveal" opacity="0">
            <path d={poly([[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], WINR.tr, WINR.tl])} fill="#4e4a45" />
            <path d={poly([[WIN.x0, WIN.y0], WINR.tl, WINR.bl, [WIN.x0, WIN.y1]])} fill="#7a746c" />
            <path d={poly([[WIN.x1, WIN.y0], WINR.tr, WINR.br, [WIN.x1, WIN.y1]])} fill="#5b5651" />
            <path d={poly([[WIN.x0, WIN.y1], WINR.bl, WINR.br, [WIN.x1, WIN.y1]])} fill="#8e877e" />
          </g>
          <path
            data-a="a-glass"
            d={poly([WINR.tl, WINR.tr, WINR.br, WINR.bl])}
            fill="url(#gr-glass)"
            opacity="0"
          />

          {/* the door becomes a real architectural door */}
          <g data-a="a-door" opacity="0">
            <path d={poly(DOOR.quad)} fill="#3b3733" />
            <path d={poly(DOOR.leaf)} fill="#6c655d" />
            <path d={poly(DOOR.panel)} fill="#615a53" />
          </g>

          {/* niche and built-in solidify */}
          <g data-a="a-niche" opacity="0">
            <path d={poly(NICHE.quad)} fill="#332f2c" />
            <path d={seg(NICHE.shelf[0], NICHE.shelf[1])} stroke="#7e776e" strokeWidth="2.4" />
          </g>

          {/* skirting and cornice */}
          <g data-a="a-trim" opacity="0">
            <path d={poly(TRIM.skirtL)} fill="#6f6960" />
            <path d={poly(TRIM.skirtR)} fill="#645f58" />
            <path d={poly(TRIM.skirtB)} fill="#78716a" />
            <path d={poly(TRIM.corniceL)} fill="#565149" />
            <path d={poly(TRIM.corniceR)} fill="#4e4942" />
          </g>

          {/* the window's own shadow, raked across the floor */}
          <g data-a="a-shadow" opacity="0">
            <path d={poly(LIGHT_POOL)} fill="#fff" opacity="0.06" />
          </g>
        </g>

        {/* The artificial interior that used to be drawn here has been
            removed — the finished room is a real film now, played by
            scroll over this same frame (see `About.jsx`). The sketch and
            shell layers above and below are untouched. */}

        {/* ══ SKETCH ══════════════════════════════════════════════════════ */}
        {/*  Drawn first in time, painted last in space: these are the room's
            own edges, so they survive into the finished interior as the line
            work that crisps every corner.                                  */}
        <g
          data-layer="sketch"
          fill="none"
          stroke="#ede7de"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* 1 · a single reference line, growing from one point to the other */}
          <Ink g="ref" d={seg(P(FRONT.x0, FRONT.y1, 1), P(FRONT.x1, FRONT.y1, 1))} w="1.5" o="0.9" />

          {/* 2 · floor perspective lines extend */}
          <Ink g="floor" d={seg(P(FRONT.x0, FRONT.y1, 1), FBL)} />
          <Ink g="floor" d={seg(P(FRONT.x1, FRONT.y1, 1), FBR)} />
          <Ink g="floor" d={seg(P(fx(0.34), fy(0), 1), P(fx(0.28), fy(0), 0))} w="0.7" o="0.3" />
          <Ink g="floor" d={seg(P(fx(0.66), fy(0), 1), P(fx(0.73), fy(0), 0))} w="0.7" o="0.3" />

          {/* 3 · the back wall draws itself: corner → top edge → rectangle */}
          <Ink g="back" d={seg(P(FRONT.x0, FRONT.y1, 1), P(FRONT.x0, FRONT.y0, 1))} w="1.35" />
          <Ink g="back" d={seg(P(FRONT.x0, FRONT.y0, 1), P(FRONT.x1, FRONT.y0, 1))} w="1.35" />
          <Ink g="back" d={seg(P(FRONT.x1, FRONT.y0, 1), P(FRONT.x1, FRONT.y1, 1))} w="1.35" />

          {/* 4 · side wall perspective lines, from the architectural corners */}
          <Ink g="walls" d={seg(BTL, FTL)} w="1.25" />
          <Ink g="walls" d={seg(BTR, FTR)} w="1.25" />
          <Ink g="walls" d={seg(P(FRONT.x0, fy(0.035), 1), P(FRONT.x0, fy(0.035), 0))} w="0.7" o="0.32" />
          <Ink g="walls" d={seg(P(FRONT.x1, fy(0.035), 1), P(FRONT.x1, fy(0.035), 0))} w="0.7" o="0.32" />

          {/* 5 · ceiling lines complete the volume */}
          <Ink g="ceil" d={seg(FTL, FTR)} w="1.1" o="0.5" />
          <Ink g="ceil" d={line(CEIL.recess)} w="0.75" o="0.36" />

          {/* 6 · window: outer frame → inner → divisions → sill */}
          <Ink g="win" d={poly([[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]])} w="1.3" o="0.88" />
          <Ink g="win" d={poly([WINR.tl, WINR.tr, WINR.br, WINR.bl])} w="0.9" o="0.6" />
          <Ink g="win" d={seg([WIN.mx, WIN.y0], [WIN.mx, WIN.y1])} w="0.85" o="0.62" />
          <Ink g="win" d={seg([WIN.x0, WIN.my], [WIN.x1, WIN.my])} w="0.85" o="0.62" />
          <Ink g="win" d={seg([WIN.x0 - 7, WIN.y1 + 4], [WIN.x1 + 7, WIN.y1 + 4])} w="1.15" o="0.7" />

          {/* 7 · door: frame → panel → handle */}
          <Ink g="door" d={poly(DOOR.quad)} w="1.25" o="0.85" />
          <Ink g="door" d={poly(DOOR.panel)} w="0.8" o="0.5" />
          <Ink g="door" d={seg(DOOR.handle[0], DOOR.handle[1])} w="1.6" o="0.8" />

          {/* 8 · architectural details */}
          <Ink g="detail" d={poly(NICHE.quad)} w="1.05" o="0.62" />
          <Ink g="detail" d={seg(NICHE.shelf[0], NICHE.shelf[1])} w="0.8" o="0.42" />
          <Ink g="detail" d={line(CEIL.cove)} w="0.7" o="0.3" />
          <Ink g="detail" d={poly(TRIM.skirtB)} w="0.7" o="0.34" />
          <Ink g="detail" d={line(SLATS[0])} w="0.6" o="0.24" />
          <Ink g="detail" d={line(STONE)} w="0.6" o="0.22" />

          {/* 9 · loose furniture placeholders — retracted before the shell is
                 declared finished, because an empty room is an empty room */}
          <g data-loose>
            <Ink g="loose" d={line(F.sofaSeat.top)} w="0.75" o="0.34" />
            <Ink g="loose" d={line(F.sofaBack.top)} w="0.75" o="0.34" />
            <Ink g="loose" d={line(F.table.top)} w="0.75" o="0.32" />
            <Ink g="loose" d={poly(FURNITURE.rug)} w="0.7" o="0.26" />
            <Ink g="loose" d={line(F.chairSeat.top)} w="0.7" o="0.3" />
          </g>
        </g>
      </g>
    </svg>
  )
})
