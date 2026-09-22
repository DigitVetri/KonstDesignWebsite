/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE HOME SEQUENCE, AS PURE ARITHMETIC
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every visual state of the two-film hero is a function of one number: how far
 *  the reader has scrolled through the pinned track, 0 → 1. Nothing here reads
 *  the clock, holds state, or remembers which way the reader was going, which
 *  is precisely what makes the sequence reversible — scrolling up runs it
 *  backward because `frameAt(0.3)` is the same picture whether it was reached
 *  from 0.2 or from 0.4.
 *
 *  Keeping it separate from the component also means the whole storyboard can
 *  be asserted without a browser.
 */

/**
 * Where each beat sits, as fractions of total progress.
 *
 *  film one scrubs → holds its last frame → the wordmark chars into being →
 *  it burns away left to right → the films cross-dissolve → film two scrubs →
 *  the closing title, subtitle and two buttons arrive one after another.
 *
 *  The overlaps are deliberate; nothing cuts, every beat hands over to the next.
 */
export const BEAT = {
  filmOne: [0.0, 0.42],
  burnIn: [0.39, 0.445], // the letters char into existence, right → left
  burnOut: [0.475, 0.55], // and burn away, left → right
  cross: [0.52, 0.60], // film one dissolves into film two
  filmTwo: [0.54, 0.94],
  furnishing: [0.66, 0.80], // sharp empty-to-furnished architectural reveal
  endTitle: [0.855, 0.9],
  endSub: [0.885, 0.925],
  endCta1: [0.915, 0.955],
  endCta2: [0.94, 0.98],
}

/** how far ahead of film two's first frame we start fetching it */
export const PREFETCH_LEAD = 0.2

/**
 * The captions, written against what each film is actually showing at that
 * point — film one moves from a marked-out site to a finished shell, film two
 * from a bare room to a furnished home — so the words and the picture are
 * never describing different things.
 *
 * Each is a large caps line with the existing sentence set small underneath
 * it, the same pairing the About stages use.
 */
export const QUOTES = [
  { id: 'site', heading: 'THE SITE', sub: 'Every space begins with an idea.', at: [0.0, 0.084] },
  { id: 'form', heading: 'TAKING SHAPE', sub: 'Where vision takes form.', at: [0.084, 0.19] },
  { id: 'built', heading: 'THE BUILD', sub: 'Built with precision.', at: [0.19, 0.315] },
  { id: 'shell', heading: 'THE SHELL', sub: 'The structure is only the beginning.', at: [0.315, 0.39] },
  { id: 'room', heading: 'THE EMPTY ROOM', sub: 'An empty room, and every possibility in it.', at: [0.55, 0.65] },
  { id: 'light', heading: 'DEFINE THE SPACE', sub: 'Light, surface, proportion.', at: [0.65, 0.79] },
  { id: 'live', heading: 'A FINISHED HOME', sub: 'Where design becomes experience.', at: [0.79, 0.855] },
]

/** how much of a caption's band is spent easing in and out — capped against
 *  the band's own width, so a short band still reaches full strength */
const QUOTE_EASE = 0.018

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const spanOf = (p, [a, b]) => clamp01((p - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)

/**
 * A caption's opacity: up at the start of its band, down at the end, nothing
 * outside it. Because it is derived from `p` alone, two captions can never both
 * be showing and scrolling back up reverses the handover exactly.
 */
export function quoteAt(p, [a, b]) {
  if (p < a || p >= b) return 0
  const ease = Math.min(QUOTE_EASE, (b - a) * 0.4)
  return smooth(Math.min((a === 0 ? 1 : clamp01((p - a) / ease)), clamp01((b - p) / ease)))
}

/**
 * The complete picture at progress `p`.
 *
 *  - `filmOne` / `filmTwo` are normalised playheads (0 = first frame, 1 = last)
 *  - `fadeOne` / `fadeTwo` are the two films' opacities
 *  - `burn` is how far the charring front has crossed the wordmark, 0 → 1.
 *    During `burnIn` it runs backward across the letters, leaving them whole;
 *    during `burnOut` it runs forward again, taking them away. The letters
 *    themselves never move.
 *  - `ember` peaks while the front is actually travelling — it drives the char
 *    glow, the ash and the smoke, all of which only exist mid-burn
 *  - `endTitle` … `endCta2` reveal the closing scene one element at a time
 */
export function frameAt(p) {
  const cross = smooth(spanOf(p, BEAT.cross))
  const inT = spanOf(p, BEAT.burnIn)
  const outT = spanOf(p, BEAT.burnOut)

  /* one front, two directions: it sweeps back off the letters to leave them
     whole, then sweeps forward again to consume them */
  const burn = inT < 1 ? 1 - smooth(inT) : smooth(outT)

  /* Char, ash and smoke exist only while the front is actually moving across
     the letters. Between the two sweeps the wordmark stands whole and nothing
     is burning, so they must fall to nothing — a bump that is zero at both
     ends of each sweep, rather than anything derived from the front's
     position, which would leave them lit through the hold. */
  const bump = (t) => Math.sin(Math.PI * clamp01(t))
  const within = (beat) => p >= beat[0] && p <= beat[1]
  const ember = Math.max(
    within(BEAT.burnIn) ? bump(inT) : 0,
    within(BEAT.burnOut) ? bump(outT) : 0,
  )

  return {
    filmOne: spanOf(p, BEAT.filmOne),
    filmTwo: spanOf(p, BEAT.filmTwo),
    fadeOne: 1, // opaque base prevents a dip to black during the dissolve
    fadeTwo: cross,
    interiorReveal: smooth(spanOf(p, BEAT.furnishing)),

    burn,
    ember,
    markVisible: p > BEAT.burnIn[0] && p < BEAT.burnOut[1] ? 1 : 0,

    endTitle: smooth(spanOf(p, BEAT.endTitle)),
    endSub: smooth(spanOf(p, BEAT.endSub)),
    endCta1: smooth(spanOf(p, BEAT.endCta1)),
    endCta2: smooth(spanOf(p, BEAT.endCta2)),
  }
}
