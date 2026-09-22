/**
 * Optimise the three supplied award photographs for the Recognition section.
 *
 * Same contract as `make-services.mjs` and `make-network.mjs`: nothing is
 * cropped here — each photograph keeps its native aspect, and the frame in the
 * layout is applied by `object-fit: cover` at render time — and each is simply
 * re-encoded to WebP at a sensible resolution.
 *
 *   node scripts/make-awards.mjs --src=/path/to/konst_awards
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'awards')
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d
const SRC = arg('src', '/tmp/konst_awards')
const MAX_W = 1600
const QUALITY = 84

/** supplied filename -> output slug, in the order the awards are numbered */
const MAP = {
  'one.png': 'award-01',
  'two.png': 'award-02',
  'last.png': 'award-03',
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
