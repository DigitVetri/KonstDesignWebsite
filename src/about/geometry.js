/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ONE ROOM. ONE CAMERA. THREE STAGES.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every coordinate in the About sequence is derived from a single one-point
 *  perspective solve, so the sketch, the concrete shell and the finished
 *  interior are physically incapable of disagreeing about where the window is.
 *
 *  The picture plane is the front of the room. `P(x, y, t)` pushes a point on
 *  that plane to depth `t` (0 = front frame, 1 = back wall) by scaling it about
 *  the vanishing point. Front rect and back rect are therefore homothetic —
 *  which is exactly what a one-point perspective is.
 *
 *  Nothing here knows about scroll. This module is pure geometry.
 */

export const VIEW = { w: 1000, h: 700 }
export const FRONT = { x0: 40, y0: 50, x1: 960, y1: 650 }
export const VP = { x: 500, y: 350 }

/** How much the front frame shrinks by the time it reaches the back wall. */
const K = 0.3217

export const depthScale = (t) => 1 - (1 - K) * t

/** A point on the picture plane, pushed to depth `t`. */
export function P(x, y, t) {
  const s = depthScale(t)
  return [VP.x + (x - VP.x) * s, VP.y + (y - VP.y) * s]
}

/** Picture-plane coordinates from room fractions: u across, v up from floor. */
export const fx = (u) => FRONT.x0 + u * (FRONT.x1 - FRONT.x0)
export const fy = (v) => FRONT.y1 - v * (FRONT.y1 - FRONT.y0)

/* ── path helpers ─────────────────────────────────────────────────────────── */

const n = (v) => Math.round(v * 10) / 10
const pt = (p) => `${n(p[0])} ${n(p[1])}`

export const seg = (a, b) => `M${pt(a)}L${pt(b)}`
export const poly = (pts) => `M${pts.map(pt).join('L')}Z`
export const line = (pts) => `M${pts.map(pt).join('L')}`

/* ── the shell ────────────────────────────────────────────────────────────── */

export const FTL = P(FRONT.x0, FRONT.y0, 0)
export const FTR = P(FRONT.x1, FRONT.y0, 0)
export const FBR = P(FRONT.x1, FRONT.y1, 0)
export const FBL = P(FRONT.x0, FRONT.y1, 0)
export const BTL = P(FRONT.x0, FRONT.y0, 1)
export const BTR = P(FRONT.x1, FRONT.y0, 1)
export const BBR = P(FRONT.x1, FRONT.y1, 1)
export const BBL = P(FRONT.x0, FRONT.y1, 1)

/** The back wall, in absolute coordinates — everything on it lives at t = 1. */
export const BACK = { x0: BTL[0], y0: BTL[1], x1: BTR[0], y1: BBR[1] }

export const SURFACE = {
  ceiling: poly([FTL, FTR, BTR, BTL]),
  floor: poly([FBL, FBR, BBR, BBL]),
  wallL: poly([FTL, BTL, BBL, FBL]),
  wallR: poly([FTR, BTR, BBR, FBR]),
  wallB: poly([BTL, BTR, BBR, BBL]),
}

/** Bounding boxes, used to build the progressive clip sweeps. */
export const BBOX = {
  ceiling: { x: FRONT.x0, y: FRONT.y0, w: 920, h: BTL[1] - FRONT.y0 + 1 },
  floor: { x: FRONT.x0, y: BBL[1] - 1, w: 920, h: FRONT.y1 - BBL[1] + 2 },
  wallL: { x: FRONT.x0, y: FRONT.y0, w: BTL[0] - FRONT.x0 + 1, h: 600 },
  wallR: { x: BTR[0] - 1, y: FRONT.y0, w: FRONT.x1 - BTR[0] + 2, h: 600 },
  wallB: { x: BACK.x0, y: BACK.y0, w: BACK.x1 - BACK.x0, h: BACK.y1 - BACK.y0 },
  room: { x: 0, y: 0, w: VIEW.w, h: VIEW.h },
}

/* ── the window (back wall, t = 1) ────────────────────────────────────────── */

const bw = BACK.x1 - BACK.x0
const bh = BACK.y1 - BACK.y0

export const WIN = {
  x0: BACK.x0 + bw * 0.36,
  x1: BACK.x0 + bw * 0.86,
  y0: BACK.y0 + bh * 0.16,
  y1: BACK.y0 + bh * 0.76,
}
WIN.mx = (WIN.x0 + WIN.x1) / 2
WIN.my = (WIN.y0 + WIN.y1) / 2

/** The opening is a hole, so its reveal recedes toward the vanishing point. */
const R = 0.915
const rin = (x, y) => [VP.x + (x - VP.x) * R, VP.y + (y - VP.y) * R]
export const WINR = {
  tl: rin(WIN.x0, WIN.y0),
  tr: rin(WIN.x1, WIN.y0),
  br: rin(WIN.x1, WIN.y1),
  bl: rin(WIN.x0, WIN.y1),
}

/* ── the door (left wall) ─────────────────────────────────────────────────── */

const DOOR_T = [0.42, 0.7]
const DOOR_V = 0.62 // head height as a fraction of room height

export const DOOR = {
  quad: [
    P(FRONT.x0, fy(0), DOOR_T[0]),
    P(FRONT.x0, fy(DOOR_V), DOOR_T[0]),
    P(FRONT.x0, fy(DOOR_V), DOOR_T[1]),
    P(FRONT.x0, fy(0), DOOR_T[1]),
  ],
  leaf: [
    P(FRONT.x0, fy(0), DOOR_T[0] + 0.012),
    P(FRONT.x0, fy(DOOR_V - 0.014), DOOR_T[0] + 0.012),
    P(FRONT.x0, fy(DOOR_V - 0.014), DOOR_T[1] - 0.012),
    P(FRONT.x0, fy(0), DOOR_T[1] - 0.012),
  ],
  panel: [
    P(FRONT.x0, fy(0.06), DOOR_T[0] + 0.045),
    P(FRONT.x0, fy(DOOR_V - 0.06), DOOR_T[0] + 0.045),
    P(FRONT.x0, fy(DOOR_V - 0.06), DOOR_T[1] - 0.045),
    P(FRONT.x0, fy(0.06), DOOR_T[1] - 0.045),
  ],
  handle: [P(FRONT.x0, fy(0.3), 0.465), P(FRONT.x0, fy(0.345), 0.465)],
}

/* ── the niche and the built-in (right wall) ──────────────────────────────── */

const NICHE_T = [0.28, 0.6]
export const NICHE = {
  quad: [
    P(FRONT.x1, fy(0.18), NICHE_T[0]),
    P(FRONT.x1, fy(0.7), NICHE_T[0]),
    P(FRONT.x1, fy(0.7), NICHE_T[1]),
    P(FRONT.x1, fy(0.18), NICHE_T[1]),
  ],
  shelf: [
    P(FRONT.x1, fy(0.44), NICHE_T[0]),
    P(FRONT.x1, fy(0.44), NICHE_T[1]),
  ],
}

/* ── ceiling structure ────────────────────────────────────────────────────── */

const rect = (u0, u1, t0, t1, v) => [
  P(fx(u0), fy(v), t0),
  P(fx(u1), fy(v), t0),
  P(fx(u1), fy(v), t1),
  P(fx(u0), fy(v), t1),
]

export const CEIL = {
  recess: rect(0.18, 0.82, 0.16, 0.9, 1),
  cove: rect(0.225, 0.775, 0.225, 0.845, 1),
  spots: [0.3, 0.74].flatMap((t) =>
    [0.28, 0.5, 0.72].map((u) => P(fx(u), fy(0.985), t)),
  ),
}

/* ── skirting and cornice bands ───────────────────────────────────────────── */

const band = (planeX, v0, v1) => [
  P(planeX, fy(v0), 0),
  P(planeX, fy(v1), 0),
  P(planeX, fy(v1), 1),
  P(planeX, fy(v0), 1),
]

export const TRIM = {
  skirtL: band(FRONT.x0, 0, 0.035),
  skirtR: band(FRONT.x1, 0, 0.035),
  skirtB: [
    [BACK.x0, BACK.y1],
    [BACK.x1, BACK.y1],
    [BACK.x1, BACK.y1 - 0.035 * 600 * K],
    [BACK.x0, BACK.y1 - 0.035 * 600 * K],
  ],
  corniceL: band(FRONT.x0, 0.968, 1),
  corniceR: band(FRONT.x1, 0.968, 1),
}

/* ── wall materials ───────────────────────────────────────────────────────── */

/** Timber slats run the left wall from the front corner up to the door. */
export const SLATS = Array.from({ length: 7 }, (_, i) => {
  const a = 0.075 + i * 0.048
  return [
    P(FRONT.x0, fy(0.035), a),
    P(FRONT.x0, fy(0.968), a),
    P(FRONT.x0, fy(0.968), a + 0.03),
    P(FRONT.x0, fy(0.035), a + 0.03),
  ]
})

export const STONE = [
  P(FRONT.x1, fy(0.035), 0.2),
  P(FRONT.x1, fy(0.968), 0.2),
  P(FRONT.x1, fy(0.968), 0.66),
  P(FRONT.x1, fy(0.035), 0.66),
]

/* ── furniture ────────────────────────────────────────────────────────────── */

/**
 * An axis-aligned box, floated between two heights. Returns every face; the
 * caller draws the top, the front and whichever flank the camera can see.
 */
export function box2(u0, u1, t0, t1, v0, v1) {
  const A = P(fx(u0), fy(v0), t0)
  const B = P(fx(u1), fy(v0), t0)
  const C = P(fx(u1), fy(v0), t1)
  const D = P(fx(u0), fy(v0), t1)
  const a = P(fx(u0), fy(v1), t0)
  const b = P(fx(u1), fy(v1), t0)
  const c = P(fx(u1), fy(v1), t1)
  const d = P(fx(u0), fy(v1), t1)
  return {
    base: [A, B, C, D],
    top: [a, b, c, d],
    front: [A, B, b, a],
    left: [A, D, d, a],
    right: [B, C, c, b],
  }
}

/** The common case: a box standing on the floor. */
export const box = (u0, u1, t0, t1, v) => box2(u0, u1, t0, t1, 0, v)

export const centroid = (pts) => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
]

export const FURNITURE = {
  rug: rect(0.18, 0.72, 0.46, 0.9, 0),
  sofaSeat: box(0.13, 0.5, 0.68, 0.9, 0.125),
  sofaBack: box(0.13, 0.5, 0.855, 0.9, 0.25),
  sofaArmL: box(0.13, 0.175, 0.68, 0.9, 0.19),
  sofaArmR: box(0.455, 0.5, 0.68, 0.9, 0.19),
  table: box(0.3, 0.58, 0.5, 0.64, 0.12),
  chairSeat: box(0.62, 0.79, 0.56, 0.72, 0.125),
  chairBack: box(0.62, 0.79, 0.685, 0.72, 0.28),
  side: box(0.805, 0.895, 0.52, 0.62, 0.16),
  console: box(0.86, 1.0, 0.3, 0.56, 0.17),
  cushA: box2(0.185, 0.255, 0.795, 0.85, 0.125, 0.235),
  cushB: box2(0.375, 0.445, 0.795, 0.85, 0.125, 0.225),
}

/** Where a small object sits when it is placed on a surface. */
FURNITURE.tableTopC = centroid(FURNITURE.table.top)
FURNITURE.consoleTopC = centroid(FURNITURE.console.top)
FURNITURE.sideTopC = centroid(FURNITURE.side.top)

export const CURTAIN = {
  l: [
    [WIN.x0 - 23, BACK.y0 + bh * 0.04],
    [WIN.x0 + 2, BACK.y0 + bh * 0.04],
    [WIN.x0 + 2, BACK.y1],
    [WIN.x0 - 23, BACK.y1],
  ],
  r: [
    [WIN.x1 - 2, BACK.y0 + bh * 0.04],
    [WIN.x1 + 23, BACK.y0 + bh * 0.04],
    [WIN.x1 + 23, BACK.y1],
    [WIN.x1 - 2, BACK.y1],
  ],
}

export const ART = [
  P(FRONT.x0, fy(0.42), 0.14),
  P(FRONT.x0, fy(0.72), 0.14),
  P(FRONT.x0, fy(0.72), 0.3),
  P(FRONT.x0, fy(0.42), 0.3),
]

export const PLANT = {
  potBase: P(fx(0.095), fy(0), 0.35),
  pot: box(0.058, 0.132, 0.325, 0.375, 0.062),
  stem: [P(fx(0.095), fy(0.075), 0.35), P(fx(0.095), fy(0.3), 0.35)],
  canopy: P(fx(0.095), fy(0.36), 0.35),
}

/** Daylight landing on the floor, thrown forward and left of the window. */
export const LIGHT_POOL = [
  P(fx(0.46), fy(0), 0.95),
  P(fx(0.79), fy(0), 0.95),
  P(fx(0.71), fy(0), 0.52),
  P(fx(0.33), fy(0), 0.52),
]

/* ── articulated furniture ────────────────────────────────────────────────── */

/**
 * The boxes above are the room's FOOTPRINTS — the sketch layer draws its loose
 * pen lines from them, and the timeline positions everything against them, so
 * they must not move. What follows builds real furniture INSIDE those same
 * footprints: legs, cushions, rails, reveals and gaps, each one still solved
 * through `P()`, so a chair leg lands on the floor plane at the same depth as
 * the chair seat above it.
 *
 * Nothing here is a placeholder primitive. A chair is a seat, a backrest with
 * daylight under it, and four tapered legs — the gaps are what make it read as
 * a chair rather than a block.
 */

/** A slim upright — a leg, a post, a lamp stem. `hu`/`ht` are its half-widths. */
export const post = (u, t, v0, v1, hu = 0.007, ht = 0.007) =>
  box2(u - hu, u + hu, t - ht, t + ht, v0, v1)

/** A horizontal disc — a round top, a pedestal foot, a lamp base. `r` is a
 *  fraction of room width; the 0.36 is the floor plane's foreshortening. */
export const disc = (u, t, v, r) => {
  const c = P(fx(u), fy(v), t)
  const s = depthScale(t)
  const rx = r * (FRONT.x1 - FRONT.x0) * s
  return { cx: c[0], cy: c[1], rx, ry: rx * 0.36 }
}

/**
 * The ellipse inscribed in a box's projected top face.
 *
 * Deriving it from the face rather than guessing a foreshortening is what keeps
 * a round table top sitting exactly on its own edge band — the two are the same
 * measurement, so they cannot drift apart at any depth.
 */
export const discOfTop = (b) => {
  const xs = b.top.map((q) => q[0])
  const ys = b.top.map((q) => q[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: (x1 - x0) / 2, ry: (y1 - y0) / 2 }
}

/** The four corners of a rectangular piece, as leg positions. */
const legsOf = (u0, u1, t0, t1, v, inset = 0.014, hu = 0.007, ht = 0.007) => [
  post(u0 + inset, t0 + inset, 0, v, hu, ht),
  post(u1 - inset, t0 + inset, 0, v, hu, ht),
  post(u0 + inset, t1 - inset, 0, v, hu, ht),
  post(u1 - inset, t1 - inset, 0, v, hu, ht),
]

/**
 * SOFA — four legs, a recessed plinth, two seat cushions with a seam between
 * them, two back cushions and two arms standing proud of the seat. Built inside
 * the `sofaSeat` / `sofaBack` / `sofaArm*` footprints.
 */
export const SOFA = {
  legs: [
    post(0.148, 0.684, 0, 0.046, 0.009, 0.009),
    post(0.674, 0.684, 0, 0.046, 0.009, 0.009),
    post(0.148, 0.892, 0, 0.046, 0.009, 0.009),
    post(0.674, 0.892, 0, 0.046, 0.009, 0.009),
  ],
  plinth: box2(0.126, 0.696, 0.672, 0.9, 0.046, 0.09),
  seat: [
    box2(0.186, 0.333, 0.682, 0.858, 0.09, 0.162),
    box2(0.341, 0.488, 0.682, 0.858, 0.09, 0.162),
    box2(0.496, 0.643, 0.682, 0.858, 0.09, 0.162),
  ],
  back: [
    box2(0.186, 0.333, 0.856, 0.904, 0.156, 0.286),
    box2(0.341, 0.488, 0.856, 0.904, 0.156, 0.286),
    box2(0.496, 0.643, 0.856, 0.904, 0.156, 0.286),
  ],
  armL: box2(0.12, 0.18, 0.66, 0.908, 0.062, 0.216),
  armR: box2(0.649, 0.709, 0.66, 0.908, 0.062, 0.216),
}

/**
 * ACCENT CHAIR — the daylight gap between the seat and the backrest is the
 * detail that stops it reading as a cube. Two rear posts carry a shaped back;
 * four tapered legs carry the seat.
 */
export const CHAIR = {
  legs: legsOf(0.62, 0.79, 0.56, 0.72, 0.072, 0.014, 0.0065, 0.0065),
  plinth: box2(0.626, 0.784, 0.568, 0.714, 0.072, 0.104),
  seat: box2(0.65, 0.76, 0.578, 0.706, 0.104, 0.158),
  armL: box2(0.62, 0.65, 0.56, 0.72, 0.104, 0.206),
  armR: box2(0.76, 0.79, 0.56, 0.72, 0.104, 0.206),
  back: box2(0.62, 0.79, 0.694, 0.72, 0.104, 0.302),
  backCushion: box2(0.65, 0.76, 0.668, 0.694, 0.152, 0.278),
}

/**
 * COFFEE TABLE — a thin top floating on four inset legs, so the rug reads
 * through underneath it.
 */
export const TABLE = {
  legs: legsOf(0.3, 0.58, 0.5, 0.64, 0.104, 0.018, 0.0065, 0.0065),
  apron: box2(0.318, 0.562, 0.518, 0.622, 0.086, 0.1),
  top: box2(0.3, 0.58, 0.5, 0.64, 0.104, 0.128),
}

/** SIDE TABLE — a round pedestal: disc top, slim column, disc foot. */
const sideFoot = box2(0.818, 0.882, 0.538, 0.602, 0, 0.014)
const sideTop = box2(0.798, 0.902, 0.518, 0.622, 0.152, 0.164)
export const SIDE = {
  footEdge: sideFoot,
  foot: discOfTop(sideFoot),
  column: post(0.85, 0.57, 0.014, 0.152, 0.009, 0.009),
  topEdge: sideTop,
  top: discOfTop(sideTop),
}

/** STOOL — a round upholstered seat on three splayed legs, set back beside the
 *  console where the floor was previously empty. */
const stoolEdge = box2(0.586, 0.654, 0.352, 0.42, 0.112, 0.136)
export const STOOL = {
  legs: [
    post(0.598, 0.364, 0, 0.114, 0.005, 0.005),
    post(0.642, 0.364, 0, 0.114, 0.005, 0.005),
    post(0.598, 0.408, 0, 0.114, 0.005, 0.005),
    post(0.642, 0.408, 0, 0.114, 0.005, 0.005),
  ],
  stretcher: box2(0.592, 0.648, 0.378, 0.394, 0.042, 0.052),
  seatEdge: stoolEdge,
  seat: discOfTop(stoolEdge),
}

/** CONSOLE / CABINETRY — a carcass on a recessed plinth, split into two drawer
 *  fronts by a reveal, each with a slim pull. */
export const CABINET = {
  plinth: box2(0.872, 0.988, 0.315, 0.545, 0, 0.026),
  carcass: box2(0.86, 1.0, 0.3, 0.56, 0.026, 0.172),
  drawerA: box2(0.862, 0.998, 0.306, 0.31, 0.036, 0.094),
  drawerB: box2(0.862, 0.998, 0.306, 0.31, 0.102, 0.16),
  pullA: [P(fx(0.9), fy(0.065), 0.305), P(fx(0.96), fy(0.065), 0.305)],
  pullB: [P(fx(0.9), fy(0.131), 0.305), P(fx(0.96), fy(0.131), 0.305)],
}

/** FLOOR LAMP — base, stem and a drum shade, standing beside the sofa. */
const lampBase = box2(0.062, 0.114, 0.589, 0.641, 0, 0.012)
const lampShade = box2(0.056, 0.12, 0.583, 0.647, 0.48, 0.552)
export const LAMP = {
  baseEdge: lampBase,
  base: discOfTop(lampBase),
  stem: post(0.088, 0.615, 0.012, 0.49, 0.0035, 0.0035),
  shade: { side: lampShade, top: discOfTop(lampShade) },
}

/**
 * ROUND COFFEE TABLE and CEILING PENDANT — both read straight off the
 * reference: a pale round top on a slim frame sitting on the rug, and a single
 * pendant hung on the room's centre line. The table stays inside the original
 * `FURNITURE.table` footprint, so the loose pen line the sketch stage draws
 * from that footprint still frames it.
 */
const tableTop = box2(0.305, 0.52, 0.462, 0.614, 0.118, 0.134)
const tableUnder = box2(0.305, 0.52, 0.462, 0.614, 0.106, 0.122)
export const TABLE_ROUND = {
  top: discOfTop(tableTop),
  /* the same disc dropped by the slab's thickness — the sliver of it showing
     below the top IS the edge, so a round top can never sit on a square band */
  under: discOfTop(tableUnder),
  /* a slim ring base rather than four legs — the reference table is carried on
     a metal frame, and the rug reads right through it */
  ringEdge: box2(0.345, 0.48, 0.496, 0.58, 0.006, 0.018),
  ring: discOfTop(box2(0.345, 0.48, 0.496, 0.58, 0.006, 0.018)),
  stemL: post(0.355, 0.538, 0.012, 0.124, 0.005, 0.005),
  stemR: post(0.47, 0.538, 0.012, 0.124, 0.005, 0.005),
}

const pendantShade = box2(0.452, 0.548, 0.482, 0.578, 0.7, 0.775)
export const PENDANT = {
  cord: [P(fx(0.5), fy(1), 0.53), P(fx(0.5), fy(0.79), 0.53)],
  shadeEdge: pendantShade,
  shadeTop: discOfTop(pendantShade),
  shadeBottom: discOfTop(box2(0.442, 0.558, 0.472, 0.588, 0.69, 0.7)),
  glow: P(fx(0.5), fy(0.7), 0.53),
}

/* ── what makes it read as a photograph rather than a diagram ─────────────── */

/**
 * CONTACT SHADOWS. A piece of furniture without one floats; with one it stands
 * on the floor. Each is an ellipse on the floor plane at the piece's own
 * footprint, so it sits under the object at the right depth and foreshortens
 * with it.
 */
export const CONTACT = {
  sofa: disc(0.414, 0.784, 0, 0.312),
  table: disc(0.412, 0.538, 0, 0.124),
  cabinet: disc(0.93, 0.432, 0, 0.09),
}

/**
 * FLOOR BOARDS. Board joints run away from the camera, so they are simply the
 * perspective lines through the floor plane — the same construction the sketch
 * stage draws its floor with, which is why they land dead straight on the
 * vanishing point instead of being faked with a pattern.
 */
export const BOARDS = {
  joints: Array.from({ length: 13 }, (_, i) => {
    const u = (i + 1) / 14
    return [P(fx(u), fy(0), 0), P(fx(u), fy(0), 1)]
  }),
  /* a few cross-joints, spaced so they crowd toward the back as they should */
  ends: [0.12, 0.28, 0.46, 0.66, 0.86].map((t) => [
    P(fx(0), fy(0), t),
    P(fx(1), fy(0), t),
  ]),
}

/** Where the wall meets the floor, darkened — the room's own ambient occlusion. */
export const BASE_AO = {
  left: [P(FRONT.x0, fy(0), 0), P(FRONT.x0, fy(0), 1), P(fx(0.055), fy(0), 1), P(fx(0.055), fy(0), 0)],
  right: [P(FRONT.x1, fy(0), 0), P(FRONT.x1, fy(0), 1), P(fx(0.945), fy(0), 1), P(fx(0.945), fy(0), 0)],
  back: [P(fx(0), fy(0), 1), P(fx(1), fy(0), 1), P(fx(1), fy(0), 0.93), P(fx(0), fy(0), 0.93)],
}

/* ── the reference room's fittings ───────────────────────────────────────── */

/**
 * A patterned rug. The reference's rug carries a fine diamond lattice, and
 * because the rug is a plane on the floor the lattice has to be solved through
 * `P()` like everything else — a flat pattern fill would sit on the screen
 * instead of lying on the floor.
 */
const RU = [0.18, 0.72] // the rug's own u range, matching FURNITURE.rug
const RT = [0.46, 0.9]
const rugPt = (a, b) => P(fx(RU[0] + a * (RU[1] - RU[0])), fy(0), RT[0] + b * (RT[1] - RT[0]))

export const RUG = {
  /* an inset border, the way a bordered rug is woven */
  border: [rugPt(0.06, 0.06), rugPt(0.94, 0.06), rugPt(0.94, 0.94), rugPt(0.06, 0.94)],
  /* the lattice: two families of diagonals crossing into diamonds */
  lattice: (() => {
    const lines = []
    const N = 7
    for (let i = -N; i <= N; i++) {
      const a0 = i / N
      lines.push([rugPt(a0, 0.06), rugPt(a0 + 1, 0.94)])
      lines.push([rugPt(a0 + 1, 0.06), rugPt(a0, 0.94)])
    }
    return lines
  })(),
}

/** White painted skirting, drawn in the finished room only. */
export const SKIRT = {
  left: [P(FRONT.x0, fy(0), 0), P(FRONT.x0, fy(0.052), 0), P(FRONT.x0, fy(0.052), 1), P(FRONT.x0, fy(0), 1)],
  right: [P(FRONT.x1, fy(0), 0), P(FRONT.x1, fy(0.052), 0), P(FRONT.x1, fy(0.052), 1), P(FRONT.x1, fy(0), 1)],
  back: [
    [BACK.x0, BACK.y1],
    [BACK.x1, BACK.y1],
    [BACK.x1, BACK.y1 - 0.052 * 600 * K],
    [BACK.x0, BACK.y1 - 0.052 * 600 * K],
  ],
}

/** The second, outer step of the tray ceiling the reference room has. */
export const CEIL_OUTER = [
  P(fx(0.1), fy(1), 0.08),
  P(fx(0.9), fy(1), 0.08),
  P(fx(0.9), fy(1), 0.96),
  P(fx(0.1), fy(1), 0.96),
]

/** A brass band around the pendant's drum, as in the reference fitting. */
export const PENDANT_BAND = box2(0.452, 0.548, 0.482, 0.578, 0.744, 0.775)

