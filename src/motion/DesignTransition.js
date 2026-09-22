/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE TRANSITION ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 *  One shared engine drives every state change — scroll steps and button
 *  clicks alike. There is no image swap anywhere in this file, because there
 *  are no images: a transition is a staggered set of per-element tweens on
 *  `p` (presence), grouped by category.
 *
 *    leaving   decor → furniture → materials → architecture   (p: 1 → 0)
 *    arriving  architecture → materials → furniture → decor   (p: 0 → 1)
 *
 *  A forward step builds ONE timeline. Stepping back to where you came from
 *  replays that very timeline with .reverse() — not a second hand-authored
 *  animation. Anything else (a button jump, an interrupted step) builds a
 *  fresh timeline from whatever the elements are doing right now, so the room
 *  always retargets from its live state.
 */
import gsap from 'gsap'
import { STATES } from '../data/designs.js'
import { getEntry } from './registry.js'
import {
  EXIT, EXIT_DUR, EXIT_EASE,
  ENTER, ENTER_DUR, ENTER_EASE,
  HANDOVER, HANDOVER_FROM_EMPTY,
} from './profiles.js'

const CATEGORIES = ['architecture', 'materials', 'furniture', 'decor']

/** Scene-wide mood tweened alongside the elements (exposure / warmth grade). */
export const mood = { exposure: 1, warmth: 0.95, sweep: 0, scroll: 0 }

let activeTl = null
let lastLeg = null // { from, to, tl } — the timeline we could run backwards
let listeners = new Set()

export function onTransition(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const emit = (payload) => listeners.forEach((fn) => fn(payload))

function byCategory(elements) {
  const map = new Map(CATEGORIES.map((c) => [c, []]))
  for (const el of elements) {
    const entry = getEntry(el.id)
    if (entry) map.get(el.category ?? 'decor').push(entry)
  }
  return map
}

function stageDelays(entries, { at, amount }) {
  const n = entries.length
  if (n === 0) return []
  if (n === 1) return [at]
  return entries.map((_, i) => at + (i / (n - 1)) * amount)
}

/**
 * Build the timeline for from → to. Start values are captured when each tween
 * actually starts, so an interrupted build picks up from the live state and a
 * completed one can be reversed exactly.
 */
export function buildTransition(from, to, { reduced = false } = {}) {
  const incoming = STATES[to]?.elements ?? []
  const keep = new Set(incoming.map((e) => e.id))

  // Everything currently on screen that the target does not want, wherever it
  // came from. Retargeting mid-flight can therefore never strand a half-faded
  // chair from a design we were already leaving.
  const outgoing = []
  for (const state of STATES) {
    for (const el of state.elements) {
      if (keep.has(el.id)) continue
      const entry = getEntry(el.id)
      if (entry && entry.state.p > 0.001) outgoing.push(el)
    }
  }

  const tl = gsap.timeline({ paused: true })

  if (reduced) {
    for (const el of outgoing) {
      const e = getEntry(el.id)
      if (e) tl.to(e.state, { p: 0, duration: 0.24, ease: 'none' }, 0)
    }
    for (const el of incoming) {
      const e = getEntry(el.id)
      if (e) tl.to(e.state, { p: 1, duration: 0.24, ease: 'none' }, 0.1)
    }
    tl.to(mood, { ...STATES[to].grade, duration: 0.3, ease: 'none' }, 0)
    return tl
  }

  /* ── leaving ─────────────────────────────────────────────────────────── */
  const outMap = byCategory(outgoing)
  let exitEnd = 0
  for (const cat of CATEGORIES) {
    const entries = outMap.get(cat)
    const delays = stageDelays(entries, EXIT[cat])
    entries.forEach((entry, i) => {
      tl.to(entry.state, { p: 0, duration: EXIT_DUR, ease: EXIT_EASE }, delays[i])
      exitEnd = Math.max(exitEnd, delays[i] + EXIT_DUR)
    })
  }

  /* ── arriving ────────────────────────────────────────────────────────── */
  const base = outgoing.length ? HANDOVER : HANDOVER_FROM_EMPTY
  const inMap = byCategory(incoming)
  for (const cat of CATEGORIES) {
    const entries = inMap.get(cat)
    const delays = stageDelays(entries, ENTER[cat])
    entries.forEach((entry, i) => {
      tl.to(entry.state, { p: 1, duration: ENTER_DUR, ease: ENTER_EASE }, base + delays[i])
    })
  }

  /* ── the room's own light shifting with the scheme ───────────────────── */
  const grade = STATES[to].grade ?? { exposure: 1, warmth: 1 }
  tl.to(mood, { exposure: grade.exposure, warmth: grade.warmth, duration: 1.5, ease: 'sine.inOut' }, base * 0.4)
  // a single slow camera breath so the room feels observed, not screenshotted
  tl.fromTo(mood, { sweep: 0 }, { sweep: 1, duration: tl.duration() || 2.4, ease: 'sine.inOut' }, 0)

  return tl
}

/**
 * Drive the room to `to` from wherever it is. Used identically by the scroll
 * stepper and by the design buttons — they share one code path, so they can
 * never disagree about what the room is showing.
 */
export function playTransition(from, to, { reduced = false } = {}) {
  if (from === to) return null

  // Stepping straight back the way we came? Rewind the very same timeline.
  if (lastLeg && lastLeg.from === to && lastLeg.to === from && lastLeg.tl.progress() === 1 && activeTl === lastLeg.tl) {
    activeTl.eventCallback('onReverseComplete', () => emit({ from, to, done: true }))
    activeTl.timeScale(1.12).reverse()
    lastLeg = { from, to, tl: activeTl, reversed: true }
    emit({ from, to, done: false })
    return activeTl
  }

  if (activeTl) {
    activeTl.kill() // live element values are preserved; the new tweens start from them
    activeTl = null
  }

  const tl = buildTransition(from, to, { reduced })
  tl.eventCallback('onComplete', () => emit({ from, to, done: true }))
  activeTl = tl
  lastLeg = { from, to, tl }
  emit({ from, to, done: false })
  tl.play()
  return tl
}

/** Snap the room to a state with no animation (first paint, reduced motion). */
export function applyStateInstantly(index) {
  if (activeTl) {
    activeTl.kill()
    activeTl = null
  }
  lastLeg = null
  const wanted = new Set((STATES[index]?.elements ?? []).map((e) => e.id))
  for (const state of STATES) {
    for (const el of state.elements) {
      const entry = getEntry(el.id)
      if (entry) entry.state.p = wanted.has(el.id) ? 1 : 0
    }
  }
  Object.assign(mood, STATES[index]?.grade ?? { exposure: 1, warmth: 1 }, { sweep: 0 })
}

export function isTransitioning() {
  return !!activeTl && activeTl.isActive()
}
