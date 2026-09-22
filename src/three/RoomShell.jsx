import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { ROOM, HALF_W, WINDOW, BACKDROP } from '../data/room.js'
import { usePbr } from './textures.js'
import { useTexture } from '@react-three/drei'

const H = ROOM.height
const BACK = ROOM.back
const FRONT = ROOM.front
const DEPTH = FRONT - BACK
const MID_Z = (FRONT + BACK) / 2
const T = ROOM.wall

/**
 * The empty room: a real box with a real hole in it. Floor, ceiling, three
 * walls, a punched window with reveals, mullions and glazing, plus skirting
 * and cornice. This shell is shared by every design and never animates — the
 * camera framing is therefore identical in all four states.
 */
export function RoomShell() {
  const floor = usePbr('floor_base', { repeat: [4.6, 5.6] })
  const wall = usePbr('wall_base', { repeat: [3, 1.6] })
  const ceiling = usePbr('ceiling_base', { repeat: [3, 3] })

  const rawView = useTexture('/assets/backdrop.jpg')
  const view = useMemo(() => {
    const texture = rawView.clone()
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [rawView])

  useEffect(() => () => view.dispose(), [view])

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dfeaf2',
        roughness: 0.03,
        metalness: 0,
        transmission: 0.97,
        thickness: 0.004,
        ior: 1.45,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
      }),
    [],
  )

  const backPieces = useMemo(
    () => [
      // sill wall below the opening
      { size: [ROOM.width, WINDOW.y0, T], pos: [0, WINDOW.y0 / 2, BACK + T / 2] },
      // header above the opening
      { size: [ROOM.width, H - WINDOW.y1, T], pos: [0, (H + WINDOW.y1) / 2, BACK + T / 2] },
      // jambs either side
      {
        size: [HALF_W + WINDOW.x0, WINDOW.y1 - WINDOW.y0, T],
        pos: [(-HALF_W + WINDOW.x0) / 2, (WINDOW.y0 + WINDOW.y1) / 2, BACK + T / 2],
      },
      {
        size: [HALF_W - WINDOW.x1, WINDOW.y1 - WINDOW.y0, T],
        pos: [(HALF_W + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, BACK + T / 2],
      },
    ],
    [],
  )

  const mullions = useMemo(() => {
    const bars = []
    const span = WINDOW.x1 - WINDOW.x0
    for (let i = 1; i <= WINDOW.mullions; i++) {
      bars.push({
        size: [0.055, WINDOW.y1 - WINDOW.y0, 0.09],
        pos: [WINDOW.x0 + (span * i) / (WINDOW.mullions + 1), (WINDOW.y0 + WINDOW.y1) / 2, BACK + 0.1],
      })
    }
    // transom
    bars.push({ size: [span, 0.05, 0.09], pos: [0, WINDOW.y0 + (WINDOW.y1 - WINDOW.y0) * 0.68, BACK + 0.1] })
    // frame
    bars.push({ size: [span + 0.12, 0.09, 0.12], pos: [0, WINDOW.y0 - 0.02, BACK + 0.11] })
    bars.push({ size: [span + 0.12, 0.09, 0.12], pos: [0, WINDOW.y1 + 0.02, BACK + 0.11] })
    bars.push({ size: [0.09, WINDOW.y1 - WINDOW.y0 + 0.16, 0.12], pos: [WINDOW.x0 - 0.02, (WINDOW.y0 + WINDOW.y1) / 2, BACK + 0.11] })
    bars.push({ size: [0.09, WINDOW.y1 - WINDOW.y0 + 0.16, 0.12], pos: [WINDOW.x1 + 0.02, (WINDOW.y0 + WINDOW.y1) / 2, BACK + 0.11] })
    return bars
  }, [])

  return (
    <group>
      {/* what you can see out of the window */}
      <mesh position={[0, BACKDROP.y, BACKDROP.z]}>
        <planeGeometry args={[BACKDROP.width, BACKDROP.height]} />
        <meshBasicMaterial map={view} toneMapped={false} />
      </mesh>

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, MID_Z]} receiveShadow>
        <planeGeometry args={[ROOM.width, DEPTH]} />
        <meshStandardMaterial {...floor} color="#cfc4b2" roughness={0.5} />
      </mesh>

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, MID_Z]} receiveShadow>
        <planeGeometry args={[ROOM.width, DEPTH]} />
        <meshStandardMaterial {...ceiling} color="#eeeae1" roughness={0.95} />
      </mesh>

      {/* side walls */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-HALF_W, H / 2, MID_Z]} receiveShadow>
        <planeGeometry args={[DEPTH, H]} />
        <meshStandardMaterial {...wall} color="#d3cdc3" roughness={0.94} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[HALF_W, H / 2, MID_Z]} receiveShadow>
        <planeGeometry args={[DEPTH, H]} />
        <meshStandardMaterial {...wall} color="#d3cdc3" roughness={0.94} />
      </mesh>

      {/* wall behind the camera — bounces light back into the room */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, H / 2, FRONT]} receiveShadow>
        <planeGeometry args={[ROOM.width, H]} />
        <meshStandardMaterial {...wall} color="#cdc7bd" roughness={0.95} />
      </mesh>

      {/* back wall, punched for the window (four solids around the opening) */}
      {backPieces.map((p, i) => (
        <mesh key={i} position={p.pos} castShadow receiveShadow>
          <boxGeometry args={p.size} />
          <meshStandardMaterial {...wall} color="#d3cdc3" roughness={0.94} />
        </mesh>
      ))}

      {/* glazing */}
      <mesh position={[0, (WINDOW.y0 + WINDOW.y1) / 2, BACK + 0.1]}>
        <planeGeometry args={[WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0]} />
        <primitive object={glass} attach="material" />
      </mesh>

      {/* steel mullions and frame */}
      {mullions.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#1e1c19" roughness={0.55} metalness={0.35} />
        </mesh>
      ))}

      {/* skirting */}
      {[
        { size: [ROOM.width, 0.13, 0.035], pos: [0, 0.065, BACK + T + 0.018] },
        { size: [0.035, 0.13, DEPTH], pos: [-HALF_W + 0.017, 0.065, MID_Z] },
        { size: [0.035, 0.13, DEPTH], pos: [HALF_W - 0.017, 0.065, MID_Z] },
      ].map((b, i) => (
        <mesh key={`s${i}`} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#e2dbcf" roughness={0.5} />
        </mesh>
      ))}

      {/* cornice shadow-gap */}
      {[
        { size: [ROOM.width, 0.07, 0.05], pos: [0, H - 0.045, BACK + T + 0.024] },
        { size: [0.05, 0.07, DEPTH], pos: [-HALF_W + 0.024, H - 0.045, MID_Z] },
        { size: [0.05, 0.07, DEPTH], pos: [HALF_W - 0.024, H - 0.045, MID_Z] },
      ].map((b, i) => (
        <mesh key={`c${i}`} position={b.pos} receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#e5dfd4" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
