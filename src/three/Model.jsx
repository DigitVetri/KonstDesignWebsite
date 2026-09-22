import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { recolorAlbedo } from './recolorMap.js'

const box = new THREE.Box3()
const size = new THREE.Vector3()
const centre = new THREE.Vector3()

/**
 * A real CC0 furniture model, auto-fitted into the room.
 *
 * Poly Haven models are already real-world scale, but they arrive with
 * assorted origins. Rather than hand-tuning 30 magic numbers, we measure the
 * bounding box and normalise: the piece is scaled to the height the design
 * asks for, centred on its footprint, and sat exactly on the floor (or hung
 * exactly from the ceiling). Placement data stays readable.
 */
export function Model({
  asset,
  height,
  anchor = 'floor',
  tint,
  tintStrength = 0.8,
  /**
   * Upholstery recolouring. A `tint` multiplies the albedo map, which can only
   * ever darken — a navy chesterfield stays navy. `recolor` instead drops the
   * albedo map and keeps the normal / roughness / AO maps, so the weave, seams
   * and tufting survive while the palette becomes ours to set. That is what
   * makes the same piece read cognac in one scheme and ivory in another.
   */
  recolor,
  recolorMatch,
  recolorStrength = 1,
  recolorContrast = 1.05,
  roughness,
  metalness,
  emitLight,
}) {
  const { scene } = useGLTF(`/assets/models/${asset}.glb`, '/draco/gltf/')

  const { object, scale, offset } = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      // unique materials per instance, so one element's fade never touches another
      const src = Array.isArray(o.material) ? o.material : [o.material]
      const made = src.map((m) => {
        const c = m.clone()
        c.envMapIntensity = 1.0
        const soft = (c.metalness ?? 0) < 0.5
        const named = !recolorMatch || new RegExp(recolorMatch, 'i').test(m.name ?? '')
        if (recolor && named) {
          // glTF sets metallicFactor to 1 whenever a metal/rough texture exists,
          // so metalness cannot tell us what is upholstery — recolour is an
          // explicit instruction and wins.
          const remapped = c.map
            ? recolorAlbedo(c.map, recolor, `${asset}:${m.name ?? 'm'}`, {
                strength: recolorStrength,
                contrast: recolorContrast,
              })
            : null
          if (remapped) {
            c.map = remapped
            c.color = new THREE.Color('#ffffff')
          } else {
            c.map = null
            c.color = new THREE.Color(recolor)
          }
          c.metalness = metalness ?? 0
          c.roughness = roughness ?? c.roughness
        } else if (tint && soft) {
          c.color = c.color.clone().lerp(new THREE.Color(tint), tintStrength)
        }
        c.userData.__baseOpacity = c.opacity ?? 1
        return c
      })
      o.material = Array.isArray(o.material) ? made : made[0]
    })

    box.setFromObject(clone)
    box.getSize(size)
    box.getCenter(centre)

    const s = height && size.y > 0.0001 ? height / size.y : 1
    const off =
      anchor === 'ceiling'
        ? [-centre.x * s, -box.max.y * s, -centre.z * s]
        : [-centre.x * s, -box.min.y * s, -centre.z * s]

    return { object: clone, scale: s, offset: off }
  }, [scene, asset, height, anchor, tint, tintStrength, recolor, recolorMatch, recolorStrength, recolorContrast, roughness, metalness])

  return (
    <group scale={scale} position={offset}>
      <primitive object={object} />
      {emitLight && (
        <pointLight
          position={emitLight.position ?? [0, 0, 0]}
          color={emitLight.color}
          intensity={emitLight.intensity}
          distance={emitLight.distance ?? 7}
          decay={2}
        />
      )}
    </group>
  )
}
