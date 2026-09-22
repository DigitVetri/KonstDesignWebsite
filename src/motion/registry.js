/**
 * The element registry.
 *
 * Every animatable node in the scene registers here with a plain `{ p }` state
 * object. GSAP tweens those numbers; one central per-frame pass reads them and
 * writes scale / offset / opacity onto the three.js objects. Nothing in React
 * re-renders during a transition.
 */
import { PROFILES } from './profiles.js'

/** id -> entry */
const registry = new Map()
const listeners = new Set()

export function registerElement(id, { category, motion = 'grow', opacityMax = 1, initial = 0 }) {
  const existing = registry.get(id)
  const entry = existing ?? { id, state: { p: initial } }
  entry.category = category
  entry.motion = motion
  entry.opacityMax = opacityMax
  entry.mats = null
  entry.lastP = -1
  registry.set(id, entry)
  return entry
}

export function attachObject(id, obj) {
  const entry = registry.get(id)
  if (!entry) return
  entry.obj = obj
  entry.mats = null // re-collect on next frame
  entry.lastP = -1
}

export function releaseElement(id) {
  registry.delete(id)
}

export function getEntry(id) {
  return registry.get(id)
}

export function getStates(ids) {
  return ids.map((id) => registry.get(id)).filter(Boolean)
}

/** Notified when an element's materials are (re)collected — used for grading. */
export function onMaterialsCollected(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function collect(entry) {
  const mats = []
  const lights = []
  entry.obj.traverse((o) => {
    if (o.isLight) {
      if (o.userData.__baseIntensity === undefined) o.userData.__baseIntensity = o.intensity
      lights.push(o)
    }
    if (!o.material) return
    const list = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of list) {
      if (m && !mats.includes(m)) {
        if (m.userData.__baseOpacity === undefined) m.userData.__baseOpacity = m.opacity
        mats.push(m)
      }
    }
  })
  entry.mats = mats
  entry.lights = lights
  listeners.forEach((fn) => fn(entry))
}

/** One pass per frame over everything that actually moved. */
export function applyAll() {
  for (const entry of registry.values()) {
    const { obj } = entry
    if (!obj) continue
    const p = entry.state.p
    if (p === entry.lastP) continue
    entry.lastP = p

    const visible = p > 0.0015
    obj.visible = visible
    if (!visible) continue

    if (entry.mats === null) collect(entry)

    const prof = PROFILES[entry.motion] ?? PROFILES.grow
    const s = prof.scale(p)
    obj.scale.set(s, s, s)
    obj.position.y = prof.y(p)
    obj.rotation.y = prof.rot(p)

    const o = Math.min(1, prof.fade(p)) * entry.opacityMax
    const solid = o > 0.995
    for (const m of entry.mats) {
      m.opacity = o * (m.userData.__baseOpacity ?? 1)
      m.transparent = !solid || (m.userData.__baseOpacity ?? 1) < 1
      m.depthWrite = o > 0.82
    }
    // fittings light the room only as much as they have arrived
    for (const l of entry.lights) l.intensity = (l.userData.__baseIntensity ?? 1) * p * p
  }
}

/** Debug helper — proves elements really are at different states mid-transition. */
export function snapshot() {
  const out = {}
  for (const [id, e] of registry) out[id] = { p: +e.state.p.toFixed(3), category: e.category, motion: e.motion }
  return out
}

if (typeof window !== 'undefined') window.__konstElements = snapshot
