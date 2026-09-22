import assert from 'node:assert/strict'
import { attachFrameRenderer } from '../src/home/frameRenderer.js'
import { FRAME_TIERS } from '../src/home/frameQuality.js'
import { BEAT, frameAt, longestStill, quoteAt, QUOTES } from '../src/home/sequence.js'

let serial = 0
const rafs = new Map()
const jobs = []
const drawings = []
let resize
let disconnected = false
globalThis.window = { devicePixelRatio: 2 }
globalThis.requestAnimationFrame = fn => { rafs.set(++serial, fn); return serial }
globalThis.cancelAnimationFrame = id => rafs.delete(id)
globalThis.ResizeObserver = class {
  constructor(fn) { resize = fn }
  observe() {}
  disconnect() { disconnected = true }
}
globalThis.Image = class {
  naturalWidth = 2560
  naturalHeight = 1440
  decode() { return new Promise((resolve, reject) => jobs.push({ image: this, resolve, reject })) }
}
let rect = { width: 1440, height: 900 }
const canvas = {
  style: {}, getBoundingClientRect: () => rect,
  getContext: () => ({ drawImage: image => drawings.push(image.src) }),
}
const paint = () => { const tasks = [...rafs.values()]; rafs.clear(); tasks.forEach(fn => fn()) }
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }
const finish = async () => {
  while (jobs.length) { jobs.splice(0).forEach(job => job.resolve()); await settle() }
  paint()
}
// `warmers: 0` keeps the byte-warming pass — which is a real network fetch —
// out of the test; everything it touches is asserted through the decode ring.
const renderer = attachFrameRenderer(canvas, { film: 'film-one', warmers: 0 })
assert.equal(canvas.width, 2304, 'canvas preserves available detail after cover cropping')
assert.equal(canvas.height, 1440, 'canvas is capped by the source height')
renderer.seek(0)
assert.equal(jobs.length, 4, 'bound concurrent decodes')
renderer.seek(1)
jobs.shift().resolve()
await settle()
assert.ok(jobs.some(job => job.image.src.endsWith('/239.webp')), 'latest target wins next decode slot')
await finish()
assert.ok(drawings.at(-1).endsWith('/239.webp'), 'land on exact last frame')
renderer.seek(0.5)
await finish()
assert.ok(drawings.at(-1).endsWith('/120.webp'), 'reverse scroll reaches the correct frame')
const settledDraws = drawings.length
renderer.seek(0.5)
paint()
assert.equal(drawings.length, settledDraws, 'settled frames avoid redundant full-resolution paints')
renderer.seek(0.5, 1.02)
paint()
assert.equal(drawings.length, settledDraws + 1, 'zoom still repaints the same frame')
rect = { width: 800, height: 600 }
resize()
paint()
assert.equal(canvas.width, 1600)
assert.equal(canvas.style.opacity, '1', 'redraw after resize')
renderer.seek(0.1)
jobs.splice(0).forEach(job => job.reject(new Error('offline')))
await settle()
await finish()
assert.equal(canvas.style.opacity, '1', 'failed frames retain visible image')
renderer.seek(0.8)
const before = drawings.length
renderer.dispose()
await finish()
assert.equal(drawings.length, before, 'no drawing after disposal')
assert.ok(disconnected)

// Each tier is a different crop, and each must be reachable and self-consistent.
for (const [tier, quality] of Object.entries(FRAME_TIERS)) {
  rect = { width: 4000, height: 2000 }
  const style = {}
  const surface = { style, getBoundingClientRect: () => rect, getContext: () => ({ drawImage() {} }) }
  const probe = attachFrameRenderer(surface, { film: 'film-two', tier, warmers: 0 })
  assert.equal(style.opacity, '0', `${tier}: poster holds until the first frame lands`)
  assert.ok(surface.width <= quality.width && surface.height <= quality.height,
    `${tier}: neither backing-store axis exceeds the source`)
  if (tier === 'tall') {
    window.devicePixelRatio = 3
    rect = { width: 390, height: 844 }
    resize()
    assert.equal(surface.height, 1500, 'portrait canvas stops at source height')
    assert.equal(surface.width, 693, 'portrait cover crop retains the correct pixel density')
    rect = { width: 300, height: 400 }
    resize()
    assert.equal(surface.width, 900, '3x phones use their available pixels')
    assert.equal(surface.height, 1200)
    window.devicePixelRatio = 2
  }
  probe.dispose()
  jobs.splice(0)
  rafs.clear()
}

// ── the storyboard ─────────────────────────────────────────────────────────
for (let i = 0; i <= 1000; i++) {
  const p = i / 1000
  for (const [key, value] of Object.entries(frameAt(p))) {
    assert.ok(value >= 0 && value <= 1, `${key} stays inside 0…1 at ${p}`)
  }
  assert.ok(QUOTES.filter(q => quoteAt(p, q.at) > 0).length <= 1, 'captions never overlap')
}
assert.equal(quoteAt(0, QUOTES[0].at), 1)
assert.equal(frameAt(1).endCta2, 1)
assert.equal(frameAt(1).filmTwo, 1, 'the room film reaches its last frame')
assert.equal(frameAt(0).filmOne, 0)

// Both playheads advance monotonically, so scrolling never runs a film backward.
for (const key of ['filmOne', 'filmTwo']) {
  let previous = -1
  for (let i = 0; i <= 1000; i++) {
    const value = frameAt(i / 1000)[key]
    assert.ok(value >= previous - 1e-9, `${key} never reverses`)
    previous = value
  }
}

// The beats have to overlap: the second film must already be running before
// the dissolve finishes, and the closing title must arrive over it still
// moving, or the reader scrolls through a frozen picture.
assert.ok(BEAT.filmTwo[0] < BEAT.cross[1], 'film two is moving before it is fully visible')
assert.ok(BEAT.endTitle[0] < BEAT.filmTwo[1], 'the closing title arrives over a moving film')
assert.ok(BEAT.burnIn[0] < BEAT.filmOne[1], 'the wordmark chars in over a moving film')

// Nothing is allowed to stand still for long. The one permitted hold is the
// final composition, after the last button has settled.
const still = longestStill()
assert.ok(still <= 0.03, `longest static stretch is ${still.toFixed(3)} of the track`)

console.log('PASS: decode concurrency, newest target, reverse scroll, resize, failed frames,')
console.log('      cleanup, three crop tiers, 1,001 storyboard positions, monotonic playheads,')
console.log(`      overlapping beats and a longest still stretch of ${(still * 100).toFixed(1)}%.`)
