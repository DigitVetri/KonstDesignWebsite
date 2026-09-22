/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ONE FILM, DECODED A FRAME AT A TIME
 * ─────────────────────────────────────────────────────────────────────────────
 *  A scroll-driven film cannot be a <video>: seeking lands on keyframes, so a
 *  reader dragging the page gets a slideshow going forward and a stall going
 *  back. Here every position is its own still, decoded directly, which is exact
 *  in both directions — that is what makes the sequence continuous.
 *
 *  The thing that actually breaks continuity is waiting on the network, so the
 *  work is split in two:
 *
 *    · a DECODE ring, narrow and eager, that turns bytes into drawable images
 *      around wherever the reader is now;
 *    · a WARM ring, wide and lazy, that pulls the bytes of frames the reader is
 *      heading towards into the HTTP cache and then forgets them.
 *
 *  Warming is what keeps the decode ring fed: by the time a frame is needed it
 *  is a local decode, not a round trip. Only the decode ring costs memory, and
 *  it stays bounded.
 *
 *  If the exact frame still is not ready — a fast flick outruns any ring — the
 *  nearest decoded frame is drawn instead. Motion that is one frame off reads
 *  as motion; a frozen picture reads as a broken page.
 */

import { FRAME_TIERS } from './frameQuality.js'

export function attachFrameRenderer(canvas, {
  film,
  tier = 'wide',
  count = 240,
  /**
   * How the frame meets the canvas.
   *
   * `cover` fills the panel and lets the crop fall where it may — right on a
   * landscape screen, where the frame and the panel are nearly the same shape
   * and the loss is a few percent of the margins.
   *
   * `contain` fits the WHOLE frame inside the panel and lets the ink show
   * above and below it. A phone held upright is about 0.46 wide for every 1
   * tall against a 1.78 frame — cover there is not a crop, it is a different
   * picture, keeping roughly a quarter of the width and throwing away the
   * composition on either side. Better a smaller picture that is still the
   * shot than a full-bleed one that is not.
   */
  fit = 'cover',
  /** the drift's ceiling, so `contain` can hold the full frame even at full
   *  zoom rather than letting the last two percent crop the edges back off */
  maxZoom = 1,
  /** the ground under everything, matching the section behind the canvas */
  ground = '#0b0a09',
  /** How far the veil over the spill knocks it back, 0 = untouched … 1 = ink.
   *  High enough that the sharp frame is plainly the subject and the rest is
   *  only light in the room around it. */
  spillVeil = 0.7,
  /** Width in pixels of the thumbnail the spill is built from. This IS the
   *  blur: thirty-odd pixels stretched across a phone cannot describe anything
   *  smaller than a broad wash of colour, which is the whole point, and it
   *  costs one tiny draw instead of a full-canvas filter pass every frame. */
  spillWidth = 30,
  /** where the crop sits vertically, 0 = top … 1 = bottom */
  focus = 0.5,
  /** frames decoded ahead of / behind the reader, capped against `CAPACITY` */
  reach = 10,
  /** frames whose bytes are pulled into the HTTP cache ahead of the reader */
  warmReach = 56,
  decoders = 4,
  warmers = 3,
} = {}) {
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) return { seek() {}, dispose() {} }

  const cache = new Map()
  const pending = new Set()
  const failed = new Set()
  const warmed = new Set()
  const warming = new Set()
  const quality = FRAME_TIERS[tier] ?? FRAME_TIERS.wide
  // A 1440p decoded frame uses about 14 MB; keep the cache memory bounded.
  const capacity = quality.capacity
  /* The decode ring must fit inside the cache with room to spare. If it did
     not, `trim` would evict a frame the ring is still asking for and `pump`
     would fetch it straight back — a treadmill that spends the whole decode
     budget on frames it keeps throwing away. */
  const span = Math.max(1, Math.min(reach, Math.floor((capacity - 3) / 2)))

  let target = 0
  let direction = 1
  let disposed = false
  let active = false
  let drawn = -1
  let paint = 0
  let width = 0
  let height = 0
  let zoom = 1
  let drawnZoom = 0

  const url = index => `/assets/home-frames/${film}/${tier}/${String(index).padStart(3, '0')}.webp`

  /* Scratch canvas for the spill, made once and reused every frame. */
  let spill = null
  let spillContext = null

  /**
   * Fill the panel behind a contained frame with the frame's own light.
   *
   * A 16:9 shot inside a panel two and a half times taller than it is wide
   * leaves a lot of panel over. Left as ink it reads as a picture that failed
   * to load; what belongs there is the same frame, cover-cropped so it reaches
   * every edge, and thrown so far out of focus that it is colour rather than
   * content. Nothing is cropped away — the crop only happens to the copy the
   * eye is not meant to read — and nothing is enlarged: the sharp frame in the
   * middle is still the whole shot at its own scale.
   *
   * The defocus is done by drawing the frame into a ~44px thumbnail and
   * blowing that back up to the panel. The upscale's own interpolation is the
   * blur, which is why this costs two draws rather than a filter pass, and why
   * it does not care how large the panel is.
   */
  const drawSpill = (image) => {
    const w = spillWidth
    const h = Math.max(1, Math.round(w * (height / width)))
    if (!spill) {
      spill = document.createElement('canvas')
      spillContext = spill.getContext('2d', { alpha: false })
    }
    if (!spillContext) return false
    if (spill.width !== w || spill.height !== h) {
      spill.width = w
      spill.height = h
    }
    const cover = Math.max(w / image.naturalWidth, h / image.naturalHeight)
    const cw = image.naturalWidth * cover
    const ch = image.naturalHeight * cover
    spillContext.imageSmoothingEnabled = true
    spillContext.drawImage(image, (w - cw) / 2, (h - ch) / 2, cw, ch)
    context.drawImage(spill, 0, 0, width, height)
    /* and settled back, so the eye goes to the frame and the captions over it
       keep the contrast they were set against */
    context.fillStyle = ground
    context.globalAlpha = spillVeil
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
    return true
  }

  const draw = () => {
    paint = 0
    if (disposed || !width || !height) return
    /* The exact frame if it is here, otherwise the closest one that is. A fast
       flick can outrun any decode ring; showing the neighbour keeps the film
       moving while the exact frame lands a beat later. */
    const index = cache.has(target)
      ? target
      : [...cache.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0]
    const image = cache.get(index)
    if (image === undefined) return
    if (drawn === index && drawnZoom === zoom) return
    const byWidth = width / image.naturalWidth
    const byHeight = height / image.naturalHeight
    /* `cover` takes the larger ratio, so the smaller side overflows and is
       cropped; `contain` takes the smaller, so the larger side falls short and
       is let-boxed. The drift is divided out of `contain` by its own ceiling,
       which means the frame reaches exactly the panel's edges at full zoom and
       sits a whisker inside it before that — the picture still breathes, and
       no part of it is ever pushed out of sight to pay for the breathing. */
    const scale = fit === 'contain'
      ? Math.min(byWidth, byHeight) * (zoom / maxZoom)
      : Math.max(byWidth, byHeight) * zoom
    const w = Math.round(image.naturalWidth * scale)
    const h = Math.round(image.naturalHeight * scale)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    /* Short of the edges, the panel has to be repainted under this frame or
       the last one's edges stay behind around it. */
    if (w < width || h < height) {
      if (!drawSpill(image)) {
        context.fillStyle = ground
        context.fillRect(0, 0, width, height)
      }
    }
    context.drawImage(image, Math.round((width - w) / 2), Math.round((height - h) * focus), w, h)
    drawn = index
    drawnZoom = zoom
    canvas.style.opacity = '1'
  }
  const schedule = () => {
    if (!paint && !disposed) paint = requestAnimationFrame(draw)
  }

  /* Evict from the far end first, and never the frame on screen or the one
     being scrolled towards. */
  const trim = () => {
    if (cache.size <= capacity) return
    const candidates = [...cache.keys()].filter(i => i !== target && i !== drawn)
      .sort((a, b) => Math.abs(b - target) - Math.abs(a - target))
    while (cache.size > capacity && candidates.length) cache.delete(candidates.shift())
  }

  /* Ordered outwards from the reader, leaning the way they are going: the next
     frame matters more than the one just left behind, but scrolling back must
     not start from empty either. */
  const ring = (radius) => {
    const indices = [target]
    for (let i = 1; i <= radius; i++) indices.push(target + i * direction, target - i * direction)
    return indices.filter(i => i >= 0 && i < count)
  }

  const warmSupported = typeof fetch === 'function' && warmers > 0

  const pump = () => {
    if (disposed || !active) return
    for (const index of ring(span)) {
      if (pending.size >= decoders) break
      if (cache.has(index) || pending.has(index) || failed.has(index)) continue
      pending.add(index)
      const image = new Image()
      image.decoding = 'async'
      image.src = url(index)
      image.decode().then(() => {
        if (disposed) return
        cache.set(index, image)
        warmed.add(index)
        trim()
        schedule()
      }).catch(() => {
        // The poster / last good frame stays on screen for a missing frame.
        failed.add(index)
      }).finally(() => {
        pending.delete(index)
        pump()
      })
    }
    warm()
  }

  /* Bytes only. Nothing is kept: the point is that the file is in the HTTP
     cache by the time the decode ring reaches it, so the decode is local.
     Held back while decodes are outstanding — the frame on screen always
     outranks the frame two seconds from now. */
  const warm = () => {
    if (disposed || !active || !warmSupported) return
    if (pending.size >= decoders) return
    for (const index of ring(warmReach)) {
      if (warming.size >= warmers) break
      if (warmed.has(index) || warming.has(index) || failed.has(index)) continue
      warming.add(index)
      const done = () => {
        warming.delete(index)
        warmed.add(index)
        if (!disposed) warm()
      }
      fetch(url(index), { priority: 'low', mode: 'same-origin' }).then(r => r.blob()).then(done, done)
    }
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    // Use available device pixels up to the export's actual resolution — past
    // that we would only be enlarging pixels that are not in the file.
    // Which axis can bind depends on the fit: cover-cropping draws past BOTH
    // edges, so both cap; contained, only the width is ever met, and capping
    // on a height the frame never reaches would throw away real resolution and
    // hand a phone a soft picture on top of a small one.
    const dpr = window.devicePixelRatio || 1
    const ratio = fit === 'contain'
      ? Math.min(dpr, quality.width / Math.max(1, rect.width))
      : Math.min(dpr, quality.width / Math.max(1, rect.width), quality.height / Math.max(1, rect.height))
    const nextW = Math.max(1, Math.round(rect.width * ratio))
    const nextH = Math.max(1, Math.round(rect.height * ratio))
    if (nextW === width && nextH === height) return
    width = canvas.width = nextW
    height = canvas.height = nextH
    drawn = -1
    // Resizing clears the backing store; expose the poster until repaint.
    canvas.style.opacity = '0'
    schedule()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  return {
    /** How much of the ladder is decoded around the reader, 0 → 1. The caller
     *  uses it to hold a poster until the film can actually move. */
    get ready() {
      return cache.has(target)
    },
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
