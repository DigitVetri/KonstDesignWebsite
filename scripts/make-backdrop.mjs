/**
 * The view out of the window.
 *
 * A 2k equirect is far too soft to look through, so we pull Poly Haven's
 * full-resolution tonemapped JPG, crop the slice of horizon the window
 * actually frames, and ship that as a sharp plane sitting behind the glass.
 *
 * The source is chosen for the VIEW, not the light — a leafy enclosure makes a
 * beautiful garden and a terrible environment map, so lighting stays with the
 * open-sky HDRI in the manifest and the two are graded to agree.
 *
 *   node scripts/make-backdrop.mjs [--yaw=0.5] [--pitch=0.5]
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import sharp from 'sharp'
import { BACKDROP } from './assets.manifest.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'backdrop.jpg')
const arg = (n, d) => Number((process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d)

const YAW = arg('yaw', BACKDROP.yaw) // 0-1 around the horizon
const PITCH = arg('pitch', BACKDROP.pitch) // 0-1 top to bottom
const FOV_U = arg('fov', BACKDROP.fov) // fraction of the full 360° to keep
const WIDTH = 2400

const slug = BACKDROP.slug
const url = `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${slug}.jpg`
const cache = path.join(os.tmpdir(), `${slug}-tonemapped.jpg`)

async function ensureSource() {
  try {
    await fs.access(cache)
    return cache
  } catch {
    /* download below */
  }
  process.stdout.write(`downloading ${slug} tonemapped JPG…\n`)
  const r = await fetch(url, { headers: { 'User-Agent': 'konst-design-asset-pipeline/1.0' } })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  await fs.writeFile(cache, Buffer.from(await r.arrayBuffer()))
  return cache
}

const src = await ensureSource()
const meta = await sharp(src, { limitInputPixels: false }).metadata()

const cropW = Math.round(meta.width * FOV_U)
const cropH = Math.round(cropW * 0.52)
const left = Math.max(0, Math.min(meta.width - cropW, Math.round(meta.width * YAW - cropW / 2)))
const top = Math.max(0, Math.min(meta.height - cropH, Math.round(meta.height * PITCH - cropH / 2)))

await fs.mkdir(path.dirname(OUT), { recursive: true })
await sharp(src, { limitInputPixels: false })
  .extract({ left, top, width: cropW, height: cropH })
  .resize({ width: WIDTH })
  // a light warm push so the daylight outside sits with the low sun inside
  .linear([1.05, 1.0, 0.945], [0, 0, 0])
  .modulate({ saturation: 1.08 })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT)

const { size } = await fs.stat(OUT)
console.log(`backdrop.jpg  ${cropW}×${cropH} → ${WIDTH}px  (${(size / 1e6).toFixed(2)} MB)`)
