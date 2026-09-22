/** Direct, bounded image decoding: the latest scroll target always has priority.
 * Frames are enhanced from the original 24fps films, not interpolated.
 */
export function attachFrameRenderer(canvas, { film, small = false, count = 240 }) {
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return { seek() {}, dispose() {} }
  const tier = small ? 'small' : 'wide'
  const cache = new Map()
  const pending = new Set()
  const failed = new Set()
  const capacity = small ? 14 : 22
  let target = 0
  let direction = 1
  let disposed = false
  let active = false
  let drawn = -1
  let paint = 0
  let width = 0
  let height = 0
  let zoom = 1

  const url = index => `/assets/home-frames/${film}/${tier}/${String(index).padStart(3, '0')}.webp${film === 'film-two' ? '?v=2' : ''}`
  const draw = () => {
    paint = 0
    if (disposed || !width || !height) return
    // Show the closest decoded frame during fast scroll, then refine to exact.
    // This keeps motion moving even when the target advances during decoding.
    const index = cache.has(target) ? target : [...cache.keys()]
      .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0]
    const image = cache.get(index)
    if (!image) return
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom
    const w = Math.round(image.naturalWidth * scale)
    const h = Math.round(image.naturalHeight * scale)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, Math.round((width - w) / 2), Math.round((height - h) / 2), w, h)
    drawn = index
    canvas.style.opacity = '1'
  }
  const schedule = () => {
    if (!paint && !disposed) paint = requestAnimationFrame(draw)
  }
  const trim = () => {
    if (cache.size <= capacity) return
    const candidates = [...cache.keys()].filter(i => i !== target && i !== drawn)
      .sort((a, b) => Math.abs(b - target) - Math.abs(a - target))
    while (cache.size > capacity && candidates.length) cache.delete(candidates.shift())
  }
  const priorities = () => {
    const indices = [target]
    for (let i = 1; i <= 6; i++) indices.push(target + i * direction, target - i * direction)
    return indices.filter(i => i >= 0 && i < count)
  }
  const pump = () => {
    if (disposed || !active) return
    for (const index of priorities()) {
      if (pending.size >= 3) break
      if (cache.has(index) || pending.has(index) || failed.has(index)) continue
      pending.add(index)
      const image = new Image()
      image.decoding = 'async'
      image.src = url(index)
      image.decode().then(() => {
        if (disposed) return
        cache.set(index, image)
        trim()
        schedule()
      }).catch(() => {
        // The poster/last good frame stays visible on an unavailable frame.
        failed.add(index)
      }).finally(() => {
        pending.delete(index)
        pump()
      })
    }
  }
  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2, (small ? 960 : 1920) / Math.max(1, rect.width))
    const nextW = Math.max(1, Math.round(rect.width * ratio))
    const nextH = Math.max(1, Math.round(rect.height * ratio))
    if (nextW === width && nextH === height) return
    width = canvas.width = nextW
    height = canvas.height = nextH
    // Resizing clears the backing store; expose the poster until repaint.
    canvas.style.opacity = '0'
    schedule()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  return {
    seek(progress, scale = 1) {
      const next = Math.round(Math.max(0, Math.min(1, progress)) * (count - 1))
      if (next !== target) direction = Math.sign(next - target)
      const changed = next !== target || zoom !== scale
      target = next
      zoom = scale
      active = true
      if (changed || drawn !== target) schedule()
      pump()
    },
    dispose() {
      disposed = true
      observer.disconnect()
      cancelAnimationFrame(paint)
      cache.clear()
    },
  }
}
