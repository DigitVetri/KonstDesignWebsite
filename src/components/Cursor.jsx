import { useEffect, useRef, useState } from 'react'

/** Everything a reader can actually act on — the house grows over these. */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor]'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CURSOR  ·  a small drawn house
 * ─────────────────────────────────────────────────────────────────────────────
 *  A minimal architectural house outline in place of the arrow: a pitched roof
 *  over a square body, drawn in thin strokes at the size of a real pointer.
 *  It tracks the pointer exactly — no easing, so there is no trail — and over
 *  anything clickable it does nothing more than grow very slightly.
 *
 *  The outline is drawn twice, a dark stroke under a light one, so it stays
 *  legible over a bright interior photograph and over the near-black sections
 *  without any glow or blend trickery.
 *
 *  It is purely decorative: `pointer-events: none` throughout, so it can never
 *  intercept a click, and it is not rendered at all on touch/coarse-pointer
 *  devices — a phone keeps its native behaviour and no hidden system cursor.
 */
export function Cursor() {
  const [fine, setFine] = useState(false)
  const dot = useRef(null)

  /* only pointer devices that can actually hover get a custom cursor */
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!fine) return
    const house = dot.current
    if (!house) return

    document.documentElement.dataset.cursorMode = 'custom'

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let raf = 0
    let shown = false

    /* written once per paint from the latest position — exact, so the house
       sits under the pointer with no lag and leaves no trail behind it */
    const frame = () => {
      raf = requestAnimationFrame(frame)
      house.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }
    raf = requestAnimationFrame(frame)

    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (!shown) {
        shown = true
        house.style.opacity = '1'
      }
      const over = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null
      house.dataset.over = over ? 'true' : 'false'
    }
    const leave = () => {
      shown = false
      house.style.opacity = '0'
    }
    const down = () => (house.dataset.down = 'true')
    const up = () => (house.dataset.down = 'false')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('pointerleave', leave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      delete document.documentElement.dataset.cursorMode
    }
  }, [fine])

  if (!fine) return null

  return (
    <svg
      ref={dot}
      data-cursor-house
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* the dark pass, slightly heavier, so the house holds its shape over a
          pale wall; the light pass sits on top for the dark sections */}
      <g stroke="#0b0a09" strokeOpacity="0.55" strokeWidth="3">
        <path d="M3.6 10.4 12 3.6l8.4 6.8" />
        <path d="M5.9 9.1V20h12.2V9.1" />
      </g>
      <g stroke="#f3efe8" strokeWidth="1.5">
        <path d="M3.6 10.4 12 3.6l8.4 6.8" />
        <path d="M5.9 9.1V20h12.2V9.1" />
      </g>
    </svg>
  )
}
