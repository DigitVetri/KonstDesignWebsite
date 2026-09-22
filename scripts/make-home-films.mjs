// Generate seek-friendly derivatives without changing the original footage.
// Run: node scripts/make-home-films.mjs (requires ffmpeg).
import { execFileSync } from 'node:child_process'

const dir = new URL('../public/assets/video/', import.meta.url).pathname
const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
for (const name of ['film-one', 'film-two']) {
  run(['-i', `${dir}${name}.mp4`, '-an', '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '17', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${dir}${name}-scroll.mp4`])
  run(['-i', `${dir}${name}.mp4`, '-frames:v', '1', '-update', '1', `${dir}${name}-poster.webp`])
}
run(['-ss', '9.9', '-i', `${dir}film-two.mp4`, '-frames:v', '1', '-update', '1', `${dir}film-two-still.webp`])
