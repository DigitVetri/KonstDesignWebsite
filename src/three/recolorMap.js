import * as THREE from 'three'

/**
 * Re-upholstery.
 *
 * Almost every Poly Haven model ships a single material covering leather,
 * fabric and timber together, so we cannot recolour "just the cushions" by
 * material name. Instead we rebuild the albedo map: keep each pixel's
 * LUMINANCE — the tufting, the seams, the wear, the grain — and replace its
 * hue and saturation with the scheme's. The piece keeps every bit of
 * photographic detail and changes colour completely.
 *
 * Cached per (asset, colour) so the two matching wing chairs in Design 03
 * share one texture.
 */
const cache = new Map()
const SIZE = 512

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export function recolorAlbedo(source, hex, key, { strength = 1, contrast = 1.05 } = {}) {
  const id = `${key}|${hex}|${strength}|${contrast}`
  const hit = cache.get(id)
  if (hit) return hit

  const image = source?.image
  if (!image || typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  try {
    ctx.drawImage(image, 0, 0, SIZE, SIZE)
  } catch {
    return null
  }

  const frame = ctx.getImageData(0, 0, SIZE, SIZE)
  const px = frame.data

  // mean luminance of the original, so we can re-centre onto the target
  let mean = 0
  for (let i = 0; i < px.length; i += 4) {
    mean += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
  }
  mean /= px.length / 4 / 1
  mean /= 255

  const target = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  target.getHSL(hsl)

  const out = new THREE.Color()
  for (let i = 0; i < px.length; i += 4) {
    const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255
    const shifted = clamp01(hsl.l + (l - mean) * contrast)
    out.setHSL(hsl.h, hsl.s, shifted)
    // three's Color is linear-space; we are writing sRGB bytes
    const r = Math.round(Math.pow(out.r, 1 / 2.2) * 255)
    const g = Math.round(Math.pow(out.g, 1 / 2.2) * 255)
    const b = Math.round(Math.pow(out.b, 1 / 2.2) * 255)
    px[i] = px[i] + (r - px[i]) * strength
    px[i + 1] = px[i + 1] + (g - px[i + 1]) * strength
    px[i + 2] = px[i + 2] + (b - px[i + 2]) * strength
  }
  ctx.putImageData(frame, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.flipY = source.flipY
  tex.wrapS = source.wrapS
  tex.wrapT = source.wrapT
  tex.repeat.copy(source.repeat)
  tex.offset.copy(source.offset)
  tex.channel = source.channel ?? 0
  tex.anisotropy = 8
  tex.needsUpdate = true

  cache.set(id, tex)
  return tex
}
