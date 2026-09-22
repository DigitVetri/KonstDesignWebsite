/**
 * Optimise the three supplied principal photographs for the Studio Network row.
 *
 * Same contract as `make-services.mjs`: the source PNGs live wherever `--src`
 * points, nothing is cropped here — each image keeps its native aspect, and the
 * 4/3 frame in the layout is applied by `object-fit: cover` at render time —
 * and each is simply re-encoded to WebP at a sensible resolution.
 *
 *   node scripts/make-network.mjs --src=/path/to/konst_profile
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'network')
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d
const SRC = arg('src', '/tmp/konst_profile')
const MAX_W = 1400
const QUALITY = 84

/** supplied filename -> output slug (the studio city each principal heads) */
const MAP = {
  'Mohammad sheriff.,D.Arch_coimbatore.png': 'coimbatore',
  'Ar Hari Prasanth., B.Arch_bangalore.png': 'bengaluru',
  'Er safiq Ahamed B.E.,MBA_dindigul.png': 'dindigul',
}

await fs.mkdir(OUT, { recursive: true })
for (const [file, slug] of Object.entries(MAP)) {
  const img = sharp(path.join(SRC, file))
  const m = await img.metadata()
  const w = Math.min(MAX_W, m.width)
  await img
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path.join(OUT, `${slug}.webp`))
  console.log(`${slug}.webp  ${w}x${Math.round((m.height / m.width) * w)}`)
}
