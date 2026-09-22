/**
 * Optimise the six supplied project photographs for the Projects gallery.
 *
 *   node scripts/make-projects.mjs --src=/path/to/projects_photo
 *
 * Re-encodes to WebP at a sensible resolution. The gallery and the detail
 * modal both display these with object-fit: cover, so the native aspect is
 * kept here and the framing is done in CSS.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'projects')
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d
const SRC = arg('src', '/tmp/proj/projects_photo')
const MAX_W = 1500
const QUALITY = 84

/** supplied filename -> output slug, in the fixed project order 01..06 */
const MAP = {
  'Rathnapuri residency.png': 'rathinapuri',
  'Courtyard house.png': 'courtyard',
  'The Loft Living Room.png': 'loft',
  'Mak Complex Interiors.png': 'mak',
  'saravanapatti villa.png': 'saravanampatti',
  'Peelamedu apartment.png': 'peelamedu',
}

await fs.mkdir(OUT, { recursive: true })
for (const [file, slug] of Object.entries(MAP)) {
  const src = path.join(SRC, file)
  const m = await sharp(src).metadata()
  const w = Math.min(MAX_W, m.width)
  await sharp(src)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path.join(OUT, `${slug}.webp`))
  process.stdout.write(`${slug}.webp  ${w}×${Math.round((m.height / m.width) * w)}\n`)
}
