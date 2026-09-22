/**
 * Optimise the four supplied "Four things we never compromise" photographs.
 *   node scripts/make-principles.mjs --src=/path/to/experience-konst
 * image1..image4 map to the four principles in order:
 * Experience, Craft, Visualization, Personalization.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets', 'principles')
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d
const SRC = arg('src', '/tmp/fourthings/experience-konst')

const MAP = {
  'image1.jpeg': 'experience',
  'image2.jpeg': 'craft',
  'image3.jpeg': 'visualization',
  'image4.jpeg': 'personalization',
}

await fs.mkdir(OUT, { recursive: true })
for (const [file, slug] of Object.entries(MAP)) {
  await sharp(path.join(SRC, file)).webp({ quality: 85 }).toFile(path.join(OUT, `${slug}.webp`))
  process.stdout.write(`${slug}.webp\n`)
}
