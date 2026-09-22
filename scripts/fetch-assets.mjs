/**
 * Downloads the CC0 Poly Haven assets listed in assets.manifest.mjs into
 * public/assets/ and optimises the models (Draco + WebP) with gltf-transform.
 *
 *   npm run assets            # everything, skips what already exists
 *   npm run assets -- --force # re-download
 */
import fs from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { pipeline } from 'node:stream/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { MODELS, TEXTURES, HDRIS } from './assets.manifest.mjs'

const run = promisify(execFile)
const API = 'https://api.polyhaven.com'
const UA = { 'User-Agent': 'konst-design-asset-pipeline/1.0' }
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public', 'assets')
const TMP = path.join(os.tmpdir(), 'konst-assets')
const FORCE = process.argv.includes('--force')
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7)
const want = (group) => !ONLY || ONLY.split(',').includes(group)
const RES = '1k'

const exists = (p) => fs.access(p).then(() => true, () => false)

async function json(url) {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

async function download(url, dest) {
  if (!FORCE && (await exists(dest))) return false
  await fs.mkdir(path.dirname(dest), { recursive: true })
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  await pipeline(r.body, createWriteStream(dest))
  return true
}

/* ---------------------------------------------------------------- models -- */

async function fetchModel(key, slug) {
  const dest = path.join(OUT, 'models', `${key}.glb`)
  if (!FORCE && (await exists(dest))) return { key, skipped: true }

  const files = await json(`${API}/files/${slug}`)
  const entry = files?.gltf?.[RES]?.gltf ?? files?.gltf?.['2k']?.gltf
  if (!entry) throw new Error(`no gltf for ${slug}`)

  const work = path.join(TMP, key)
  await fs.rm(work, { recursive: true, force: true })
  await fs.mkdir(work, { recursive: true })

  const gltfName = entry.url.split('/').pop()
  await download(entry.url, path.join(work, gltfName))
  // `include` keys are paths relative to the .gltf (textures/foo.jpg, foo.bin…)
  for (const [rel, file] of Object.entries(entry.include ?? {})) {
    await download(file.url, path.join(work, rel))
  }

  const raw = path.join(work, gltfName)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  try {
    await run('npx', ['--yes', '@gltf-transform/cli@4', 'optimize', raw, dest,
      '--compress', 'draco', '--texture-compress', 'webp', '--texture-size', '1024',
      '--simplify', 'false'],
      { cwd: ROOT, maxBuffer: 1 << 26 })
  } catch (err) {
    console.warn(`  ! optimize failed for ${key}, packing uncompressed:`, err.message.split('\n')[0])
    await run('npx', ['--yes', '@gltf-transform/cli@4', 'copy', raw, dest], { cwd: ROOT, maxBuffer: 1 << 26 })
  }
  await fs.rm(work, { recursive: true, force: true })
  const { size } = await fs.stat(dest)
  return { key, size }
}

/* -------------------------------------------------------------- textures -- */

const MAP_FILES = [
  ['Diffuse', 'diff'],
  ['nor_gl', 'nor'],
  ['arm', 'arm'], // R=AO  G=Roughness  B=Metalness
]

async function fetchTexture(key, slug) {
  const files = await json(`${API}/files/${slug}`)
  const written = []
  for (const [apiKey, short] of MAP_FILES) {
    const url = files?.[apiKey]?.[RES]?.jpg?.url
    if (!url) continue
    const dest = path.join(OUT, 'textures', key, `${short}.jpg`)
    await download(url, dest)
    written.push(short)
  }
  if (!written.includes('diff')) throw new Error(`no diffuse for ${slug}`)
  return { key, maps: written }
}

/* ------------------------------------------------------------------ hdri -- */

async function fetchHdri(key, slug) {
  const files = await json(`${API}/files/${slug}`)
  const url = files?.hdri?.['2k']?.hdr?.url ?? files?.hdri?.[RES]?.hdr?.url
  if (!url) throw new Error(`no hdr for ${slug}`)
  await download(url, path.join(OUT, 'hdri', `${key}.hdr`))
  return { key }
}

/* ------------------------------------------------------------------ main -- */

async function pool(entries, worker, limit = 4) {
  const queue = [...entries]
  const results = []
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (queue.length) {
        const [k, v] = queue.shift()
        try {
          results.push(await worker(k, v))
          process.stdout.write(`  ✓ ${k}\n`)
        } catch (err) {
          process.stdout.write(`  ✗ ${k} — ${err.message}\n`)
          results.push({ key: k, error: err.message })
        }
      }
    }),
  )
  return results
}

/* ---------------------------------------------------------------- draco -- */

// The optimised .glb files are Draco-compressed; ship the decoder locally
// rather than pulling it off a CDN at runtime.
async function copyDracoDecoder() {
  const from = path.join(ROOT, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco')
  const to = path.join(ROOT, 'public', 'draco')
  await fs.rm(to, { recursive: true, force: true })
  await fs.cp(from, to, { recursive: true })
  console.log('  ✓ draco decoder → public/draco/')
}

const credits = []

let tex = []
if (want('textures')) {
  console.log('\nTextures')
  tex = await pool(Object.entries(TEXTURES), (k, v) => fetchTexture(k, v.slug), 4)
}
Object.entries(TEXTURES).forEach(([k, v]) => credits.push(`texture  ${k} → polyhaven.com/a/${v.slug}`))

if (want('hdri')) {
  console.log('\nHDRI')
  await pool(Object.entries(HDRIS), fetchHdri, 2)
}
Object.entries(HDRIS).forEach(([k, v]) => credits.push(`hdri     ${k} → polyhaven.com/a/${v}`))

let mod = []
if (want('models')) {
  await copyDracoDecoder()
  // warm the npx cache once — three cold `npx --yes` installs race each other
  await run('npx', ['--yes', '@gltf-transform/cli@4', '--version'], { cwd: ROOT }).catch(() => {})
  console.log('\nModels (download + Draco/WebP optimise — this takes a while)')
  mod = await pool(Object.entries(MODELS), fetchModel, 3)
}
Object.entries(MODELS).forEach(([k, v]) => credits.push(`model    ${k} → polyhaven.com/a/${v}`))

await fs.writeFile(
  path.join(ROOT, 'CREDITS.md'),
  `# Asset credits\n\nAll 3D models, PBR textures and HDRI environments are **CC0 / public domain**\nfrom [Poly Haven](https://polyhaven.com) — https://polyhaven.com/license\n\n\`\`\`\n${credits.join('\n')}\n\`\`\`\n`,
)

const failed = [...tex, ...mod].filter((r) => r.error)
console.log(`\nDone. ${failed.length ? `${failed.length} failed: ${failed.map((f) => f.key).join(', ')}` : 'All assets ready.'}`)
