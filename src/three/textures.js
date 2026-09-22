import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const base = (key) => `/assets/textures/${key}`

/** All texture sets ship diff + nor(_gl) + arm (AO·Rough·Metal packed R·G·B). */
export function texturePaths(key) {
  return {
    map: `${base(key)}/diff.jpg`,
    normalMap: `${base(key)}/nor.jpg`,
    armMap: `${base(key)}/arm.jpg`,
  }
}

/**
 * A photographic PBR material for a surface. Textures are cloned per use so
 * the same wood can tile differently on a floor and on a ceiling beam.
 */
export function usePbr(key, { repeat = [1, 1], rotation = 0 } = {}) {
  const paths = texturePaths(key)
  const [map, normalMap, armMap] = useTexture([paths.map, paths.normalMap, paths.armMap])
  const [ru, rv] = repeat

  return useMemo(() => {
    const prep = (src, srgb) => {
      const t = src.clone()
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(ru, rv)
      t.rotation = rotation
      t.center.set(0.5, 0.5)
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
      return t
    }
    const arm = prep(armMap, false)
    arm.channel = 0 // AO reads uv0 — our geometry has no second UV set
    return {
      map: prep(map, true),
      normalMap: prep(normalMap, false),
      aoMap: arm,
      roughnessMap: arm,
      metalnessMap: arm,
    }
  }, [map, normalMap, armMap, ru, rv, rotation])
}
