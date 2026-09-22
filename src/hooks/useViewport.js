import { useEffect, useState } from 'react'

const read = () => {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    /** small GPU — lower DPR and shadow maps */
    mobile: w < 900,
    /** taller than it is wide: a one-point interior cannot fill this crop */
    portrait: h > w * 1.05,
    /** not much vertical room — drop the supporting line */
    compact: h < 560,
  }
}

export function useViewport() {
  const [v, setV] = useState(read)
  useEffect(() => {
    let frame = 0
    const on = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setV(read()))
    }
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
    }
  }, [])
  return v
}
