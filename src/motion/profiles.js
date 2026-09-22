/**
 * Motion profiles. `p` is the element's presence: 0 = fully gone, 1 = settled.
 * The SAME mapping serves arrival and departure — an element leaving simply
 * runs its p from 1 → 0, which shrinks it and sinks it back down. That is why
 * every transition is reversible by construction.
 */
export const PROFILES = {
  /** Furniture & decor: grows up out of nothing and settles into place. */
  grow: {
    scale: (p) => 0.52 + 0.48 * p,
    y: (p) => -0.46 * (1 - p),
    rot: (p) => 0.16 * (1 - p),
    fade: (p) => Math.min(1, p * 1.35),
  },
  /** Tall pieces (shelving, consoles, drapes): grow mostly in height. */
  rise: {
    scale: (p) => 0.62 + 0.38 * p,
    y: (p) => -0.78 * (1 - p),
    rot: (p) => 0.1 * (1 - p),
    fade: (p) => Math.min(1, p * 1.25),
  },
  /** Wall / floor / ceiling finishes: a material washing over the surface. */
  surface: {
    scale: (p) => 1.045 - 0.045 * p,
    y: () => 0,
    rot: () => 0,
    fade: (p) => Math.min(1, p * 1.15),
  },
  /** Ceiling structure & light fittings: descend from the slab. */
  drop: {
    scale: (p) => 0.7 + 0.3 * p,
    y: (p) => 0.58 * (1 - p),
    rot: (p) => -0.12 * (1 - p),
    fade: (p) => Math.min(1, p * 1.3),
  },
}

/**
 * Stagger choreography, in seconds.
 * Leaving reads decor → furniture → materials → architecture (the room strips
 * itself back). Arriving reads architecture → materials → furniture → decor
 * (the room is rebuilt, structure first). `amount` spreads a whole category
 * over a fixed window so the rhythm does not depend on how many pieces exist.
 */
export const EXIT = {
  decor: { at: 0.0, amount: 0.26 },
  furniture: { at: 0.14, amount: 0.22 },
  materials: { at: 0.32, amount: 0.16 },
  architecture: { at: 0.42, amount: 0.18 },
}
export const EXIT_DUR = 0.62
export const EXIT_EASE = 'power2.in'

export const ENTER = {
  architecture: { at: 0.0, amount: 0.3 },
  materials: { at: 0.2, amount: 0.22 },
  furniture: { at: 0.5, amount: 0.34 },
  decor: { at: 0.8, amount: 0.34 },
}
export const ENTER_DUR = 0.86
export const ENTER_EASE = 'expo.out'

/** How long the outgoing pass runs before the incoming pass starts. */
export const HANDOVER = 0.66
/** Skipped when there is nothing to remove (empty room → first design). */
export const HANDOVER_FROM_EMPTY = 0.12
