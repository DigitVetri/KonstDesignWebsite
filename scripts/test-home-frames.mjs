import assert from 'node:assert/strict'
import { attachFrameRenderer } from '../src/home/frameRenderer.js'
import { frameAt, quoteAt, QUOTES } from '../src/home/sequence.js'

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
  naturalWidth = 1920
  naturalHeight = 1080
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
const renderer = attachFrameRenderer(canvas, { film: 'film-one' })
assert.equal(canvas.width, 1920)
renderer.seek(0)
assert.equal(jobs.length, 3, 'bound concurrent decodes')
renderer.seek(1)
jobs.shift().resolve()
await settle()
assert.ok(jobs.some(job => job.image.src.endsWith('/239.webp')), 'latest target wins next decode slot')
await finish()
assert.ok(drawings.at(-1).endsWith('/239.webp'), 'land on exact last frame')
renderer.seek(0.5)
await finish()
assert.ok(drawings.at(-1).endsWith('/120.webp'), 'reverse scroll reaches the correct frame')
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
for (let i = 0; i <= 1000; i++) {
  const p = i / 1000
  for (const value of Object.values(frameAt(p))) assert.ok(value >= 0 && value <= 1)
  assert.ok(QUOTES.filter(q => quoteAt(p, q.at) > 0).length <= 1)
}
assert.equal(quoteAt(0, QUOTES[0].at), 1)
assert.equal(frameAt(1).endCta2, 1)
console.log('PASS: decode concurrency, newest target, reverse scroll, resize, failed frames, cleanup and 1,001 storyboard positions.')
