/**
 * One tiny external store is the single source of truth for "which design is
 * the room showing". Scroll writes to it; the buttons write to it; the 3D
 * scene and the UI both read it. They cannot drift apart.
 */
import { useSyncExternalStore } from 'react'
import { EMPTY_INDEX, LAST_INDEX } from '../data/designs.js'

let state = {
  phase: 'loading', // 'loading' | 'revealing' | 'live'
  index: EMPTY_INDEX, // index into STATES — 0 is the empty room
  target: EMPTY_INDEX,
  /**
   * Which design the showcase settles on. Scrolling never cycles through the
   * schemes — it reveals this one. Choosing a design from the selector changes
   * it, so scrolling back out and in again returns to the viewer's choice
   * rather than overruling it.
   */
  preferred: LAST_INDEX,
  transitioning: false,
  selectorRevealed: false,
  assetsReady: false,
  progress: 0, // 0-1 through the pinned stage
}

const subs = new Set()
const emit = () => subs.forEach((fn) => fn())

export function setExperience(patch) {
  let changed = false
  for (const k in patch) {
    if (state[k] !== patch[k]) {
      changed = true
      break
    }
  }
  if (!changed) return
  state = { ...state, ...patch }
  emit()
}

export const getExperience = () => state

const subscribe = (fn) => {
  subs.add(fn)
  return () => subs.delete(fn)
}

export function useExperience(selector = (s) => s) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

export const clampIndex = (i) => Math.max(EMPTY_INDEX, Math.min(LAST_INDEX, i))
