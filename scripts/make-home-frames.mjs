// Rebuild directly from the original films. Requires ffmpeg; no generative detail.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const assets = fileURLToPath(new URL('../public/assets/', import.meta.url))
const films = process.argv[2] ? [process.argv[2]] : ['film-one', 'film-two']
if (films.some(film => !['film-one', 'film-two'].includes(film))) throw new Error('Expected film-one or film-two')
for (const film of films) {
  for (const [tier, width] of [['wide', 1920], ['small', 960]]) {
    const dir = `${assets}home-frames/${film}/${tier}`
    mkdirSync(dir, { recursive: true })
    // Sharpen the soft interior at source size first, before enlargement.
    // Keep flat walls natural; only luma is sharpened, never colour noise.
    const detail = film === 'film-two'
    const grade = detail
      ? `unsharp=7:7:0.65:3:3:0,scale=${width}:-2:flags=lanczos,eq=contrast=1.055:brightness=0.008:saturation=1.0,unsharp=3:3:0.35:3:3:0`
      : `scale=${width}:-2:flags=lanczos,eq=contrast=1.045:brightness=0.006:saturation=1.025,unsharp=5:5:0.45:3:3:0`
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i',
      `${assets}video/${film}.mp4`, '-vf', grade, '-an', '-c:v', 'libwebp',
      '-quality', detail ? '95' : '88', '-compression_level', '4', '-start_number', '0',
      `${dir}/%03d.webp`], { stdio: 'inherit' })
  }
}
