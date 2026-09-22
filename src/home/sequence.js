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
 *
 *  THE RULE THE BEATS ARE BUILT ON: at no progress is the picture standing
 *  still. A stretch of scroll where nothing moves is what makes a sequence
 *  read as a set of slides rather than one continuous shot, so the beats below
 *  overlap — a film is still running under the wordmark, the second film is
 *  still settling under the closing title, and the two films cross while both
 *  are in motion. `SILENCE` asserts it.
 */

/**
 * Where each beat sits, as fractions of total progress.
 *
 *  film one scrubs → the wordmark chars into being over its last seconds →
 *  it burns away left to right while the rooms dissolve in underneath →
 *  film two scrubs the whole way from bare shell to furnished home →
 *  the closing title, subtitle and two buttons arrive over its final settle.
 */
export const BEAT = {
  filmOne: [0.0, 0.44],
  burnIn: [0.355, 0.415], // the letters char into existence, right → left
  burnOut: [0.425, 0.50], // and burn away, left → right
  cross: [0.44, 0.515], // film one dissolves into film two
  filmTwo: [0.45, 0.93], // the room: bare shell → finished home, continuous
  endTitle: [0.845, 0.895],
  endSub: [0.875, 0.92],
  endCta1: [0.905, 0.95],
  endCta2: [0.93, 0.975],
}

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
  { id: 'site', heading: 'THE SITE', sub: 'Every space begins with an idea.', at: [0.0, 0.088] },
  { id: 'form', heading: 'TAKING SHAPE', sub: 'Where vision takes form.', at: [0.088, 0.2] },
  { id: 'built', heading: 'THE BUILD', sub: 'Built with precision.', at: [0.2, 0.31] },
  { id: 'shell', heading: 'THE SHELL', sub: 'The structure is only the beginning.', at: [0.31, 0.375] },
  { id: 'room', heading: 'THE EMPTY ROOM', sub: 'An empty room, and every possibility in it.', at: [0.525, 0.63] },
  { id: 'light', heading: 'DEFINE THE SPACE', sub: 'Light, surface, proportion.', at: [0.63, 0.745] },
  { id: 'live', heading: 'A FINISHED HOME', sub: 'Where design becomes experience.', at: [0.745, 0.845] },
]

/** how much of a caption's band is spent easing in and out — capped against
 *  the band's own width, so a short band still reaches full strength */
const QUOTE_EASE = 0.018

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const spanOf = (p, [a, b]) => clamp01((p - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
/** Eased at both ends but linear through the middle, which is what a scrubbed
 *  film wants: it must leave and arrive without a jolt, yet spend the body of
 *  its beat advancing at an even rate rather than racing the midpoint. */
const glide = (t) => {
  const e = 0.22
  if (t <= 0) return 0
  if (t >= 1) return 1
  const total = 1 - e // area of the eased-ends ramp, normalised
  if (t < e) return (t * t) / (2 * e) / total
  if (t > 1 - e) return (total - ((1 - t) * (1 - t)) / (2 * e)) / total
  return (t - e / 2) / total
}

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
 *  - `fadeTwo` is the second film's opacity over the first
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
    filmOne: glide(spanOf(p, BEAT.filmOne)),
    filmTwo: glide(spanOf(p, BEAT.filmTwo)),
    fadeTwo: cross,

    burn,
    ember,
    markVisible: p > BEAT.burnIn[0] && p < BEAT.burnOut[1] ? 1 : 0,

    endTitle: smooth(spanOf(p, BEAT.endTitle)),
    endSub: smooth(spanOf(p, BEAT.endSub)),
    endCta1: smooth(spanOf(p, BEAT.endCta1)),
    endCta2: smooth(spanOf(p, BEAT.endCta2)),
  }
}

/**
 * Where, if anywhere, the sequence stands still — the check that the beats
 * above actually overlap. For every position it asks how much any of the
 * picture's moving parts changes over the next slice of scroll; a run of
 * positions where that is ~0 is a stretch the reader scrolls through watching
 * a frozen frame, which is the one thing this storyboard must not do.
 *
 * Returns the longest such run, as a fraction of the track.
 */
export function longestStill(step = 0.001) {
  /* Playheads are weighted by how visible their film is, so film one holding
     its last frame under a fully-crossed film two is not counted as motion,
     and neither is film two scrubbing while still invisible. */
  const parts = (p) => {
    const f = frameAt(p)
    return [
      f.filmOne * (1 - f.fadeTwo), f.filmTwo * f.fadeTwo, f.fadeTwo,
      f.burn * f.markVisible, f.ember,
      f.endTitle, f.endSub, f.endCta1, f.endCta2,
      ...QUOTES.map((q) => quoteAt(p, q.at)),
    ]
  }
  let run = 0
  let longest = 0
  let previous = parts(0)
  for (let p = step; p <= 1 + 1e-9; p += step) {
    const now = parts(p)
    const moved = now.some((v, i) => Math.abs(v - previous[i]) > step * 0.05)
    run = moved ? 0 : run + step
    if (run > longest) longest = run
    previous = now
  }
  return longest
}
