/**
 * Optimise the six supplied service photographs for the Services gallery.
 *
 * Source PNGs live in a folder next to the project (or wherever `--src`
 * points); this crops nothing — each image keeps its native aspect — and
 * simply re-encodes to WebP at a sensible resolution so the horizontal
 * gallery scrolls smoothly without shipping ten megabytes of PNG.
 *
 *   node scripts/make-services.mjs --src=/path/to/services_photo
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'services')
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d
const SRC = arg('src', '/tmp/svc/services_photo')
const MAX_W = 1600
const QUALITY = 84

/** supplied filename -> output slug */
const MAP = {
  'Bedroom  interior.png': 'bedroom',
  'ceiling design.png': 'ceiling',
  'Pooja unit.png': 'pooja',
  'TV Room.png': 'tv-unit',
  'Visitor room.png': 'visiting-room',
  'Modular Kitchen.png': 'kitchen',
}

await fs.mkdir(OUT, { recursive: true })
const meta = {}
for (const [file, slug] of Object.entries(MAP)) {
  const src = path.join(SRC, file)
  const img = sharp(src)
  const m = await img.metadata()
  const w = Math.min(MAX_W, m.width)
  await img
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path.join(OUT, `${slug}.webp`))
  meta[slug] = { w, h: Math.round((m.height / m.width) * w) }
  process.stdout.write(`${slug}.webp  ${w}×${meta[slug].h}\n`)
}
process.stdout.write('\naspect ratios:\n')
for (const [slug, { w, h }] of Object.entries(meta)) {
  process.stdout.write(`  ${slug}: ${(w / h).toFixed(3)}\n`)
}
