/**
 * Rebuild the home films as still-frame ladders, straight from the supplied
 * originals (`film-*.mp4`). Requires ffmpeg; no generative detail.
 *
 * A scroll-driven film cannot be a <video>: seeking lands on keyframes, so a
 * reader dragging the page gets a slideshow that judders one way and stalls
 * the other. Decoding one still per position is exact in both directions,
 * which is what makes the sequence continuous.
 *
 * Three tiers, because the crop is the composition:
 *   wide  — landscape, large screens
 *   small — landscape, small screens (same frame, fewer pixels)
 *   tall  — a 4:5 centre crop, so a phone held upright gets a picture composed
 *           for it rather than a 16:9 frame with three quarters cut away
 *
 * Read the original footage to avoid the extra H.264 generation in the scroll
 * derivatives. Higher-quality WebP preserves fine edges and gradients; Lanczos
 * enlargement keeps the original content and the existing colour treatment.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { FRAME_TIERS } from '../src/home/frameQuality.js'

const assets = fileURLToPath(new URL('../public/assets/', import.meta.url))
const FILMS = ['film-one', 'film-two']
const films = process.argv[2] ? [process.argv[2]] : FILMS
if (films.some(film => !FILMS.includes(film))) throw new Error('Expected film-one or film-two')

/** Sharpen the soft source at its own size first, before any enlargement. */
const pre = film => (film === 'film-two' ? 'unsharp=7:7:0.65:3:3:0' : 'unsharp=5:5:0.5:3:3:0')
const grade = film => (film === 'film-two'
  ? 'eq=contrast=1.055:brightness=0.008:saturation=1.0,unsharp=3:3:0.32:3:3:0'
  : 'eq=contrast=1.045:brightness=0.006:saturation=1.025,unsharp=3:3:0.3:3:3:0')

for (const film of films) {
  const source = `${assets}video/${film}.mp4`
  if (!existsSync(source)) throw new Error(`Missing original footage: ${source}`)
  for (const [tier, { width, height, quality }] of Object.entries(FRAME_TIERS)) {
    const crop = tier === 'tall' ? 'crop=ih*0.8:ih:(iw-ih*0.8)/2:0,' : ''
    const scale = `${crop}scale=${width}:${height}:flags=lanczos`
    const dir = `${assets}home-frames/${film}/${tier}`
    mkdirSync(dir, { recursive: true })
    process.stdout.write(`${film}/${tier} … `)
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
      '-vf', [pre(film), scale, grade(film)].join(','), '-an', '-c:v', 'libwebp',
      '-quality', String(quality), '-compression_level', '6', '-start_number', '0',
      `${dir}/%03d.webp`], { stdio: 'inherit' })
    console.log('done')
  }
}
