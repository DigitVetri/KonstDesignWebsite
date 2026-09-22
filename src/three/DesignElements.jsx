import { useMemo } from 'react'
import * as THREE from 'three'
import { ROOM, HALF_W, WINDOW } from '../data/room.js'
import { usePbr } from './textures.js'
import { MotionElement } from './MotionElement.jsx'
import { Model } from './Model.jsx'

const H = ROOM.height
const BACK = ROOM.back
const FRONT = ROOM.front
const DEPTH = FRONT - BACK
const MID_Z = (FRONT + BACK) / 2
const T = ROOM.wall

/** Finishes pivot on the middle of the room so they wash in from the centre. */
const PIVOT = [0, H / 2, MID_Z]
const rel = ([x, y, z]) => [x - PIVOT[0], y - PIVOT[1], z - PIVOT[2]]

/** Ceiling structure pivots on the slab, so it scales and drops out of it. */
const CEIL_PIVOT = [0, H, MID_Z]
const relCeil = ([x, y, z]) => [x - CEIL_PIVOT[0], y - CEIL_PIVOT[1], z - CEIL_PIVOT[2]]

/* ── floor / wall / ceiling finish ─────────────────────────────────────── */

function Finish({ el }) {
  const pbr = usePbr(el.texture, { repeat: el.repeat ?? [2, 2] })
  const mat = {
    ...pbr,
    color: el.color ?? '#ffffff',
    roughness: el.roughness ?? 0.8,
    metalness: el.metalness ?? 0,
  }

  if (el.surface === 'floor') {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={rel([0, 0.006, MID_Z])} receiveShadow>
        <planeGeometry args={[ROOM.width, DEPTH]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    )
  }

  if (el.surface === 'ceiling') {
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]} position={rel([0, H - 0.008, MID_Z])} receiveShadow>
        <planeGeometry args={[ROOM.width, DEPTH]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    )
  }

  // walls — the back wall keeps its window
  const z = BACK + T + 0.014
  const backPanels = [
    { size: [ROOM.width, WINDOW.y0], pos: [0, WINDOW.y0 / 2, z] },
    { size: [ROOM.width, H - WINDOW.y1], pos: [0, (H + WINDOW.y1) / 2, z] },
    {
      size: [HALF_W + WINDOW.x0, WINDOW.y1 - WINDOW.y0],
      pos: [(-HALF_W + WINDOW.x0) / 2, (WINDOW.y0 + WINDOW.y1) / 2, z],
    },
    {
      size: [HALF_W - WINDOW.x1, WINDOW.y1 - WINDOW.y0],
      pos: [(HALF_W + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, z],
    },
  ]

  return (
    <group>
      <mesh rotation={[0, Math.PI / 2, 0]} position={rel([-HALF_W + 0.014, H / 2, MID_Z])} receiveShadow>
        <planeGeometry args={[DEPTH, H]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={rel([HALF_W - 0.014, H / 2, MID_Z])} receiveShadow>
        <planeGeometry args={[DEPTH, H]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={rel([0, H / 2, FRONT - 0.014])} receiveShadow>
        <planeGeometry args={[ROOM.width, H]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {backPanels.map((p, i) =>
        p.size[0] > 0.01 && p.size[1] > 0.01 ? (
          <mesh key={i} position={rel(p.pos)} receiveShadow>
            <planeGeometry args={p.size} />
            <meshStandardMaterial {...mat} />
          </mesh>
        ) : null,
      )}
    </group>
  )
}

/* ── rugs, runners, stone bands ────────────────────────────────────────── */

function Rug({ el }) {
  const pbr = usePbr(el.texture, { repeat: el.repeat ?? [2, 2] })
  const [w, d] = el.size
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, el.rotation ?? 0]}
      position={[0, el.lift ?? 0.014, 0]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial
        {...pbr}
        color={el.color ?? '#ffffff'}
        roughness={el.roughness ?? 0.94}
        metalness={el.metalness ?? 0}
      />
    </mesh>
  )
}

/* ── exposed ceiling beams ─────────────────────────────────────────────── */

function Beams({ el }) {
  const pbr = usePbr(el.texture ?? 'wood_dark', { repeat: [5, 0.5] })
  const zs = useMemo(() => {
    const out = []
    for (let i = 0; i < el.count; i++) {
      out.push(el.from + ((el.to - el.from) * i) / (el.count - 1))
    }
    return out
  }, [el.count, el.from, el.to])

  return (
    <group>
      {zs.map((z, i) => (
        <mesh key={i} position={relCeil([0, H - el.depth / 2 - 0.01, z])} castShadow receiveShadow>
          <boxGeometry args={[ROOM.width, el.depth, el.width]} />
          <meshStandardMaterial {...pbr} color={el.color} roughness={el.roughness ?? 0.75} />
        </mesh>
      ))}
    </group>
  )
}

/* ── coffered ceiling ──────────────────────────────────────────────────── */

function Coffers({ el }) {
  const bars = useMemo(() => {
    const out = []
    const z0 = el.from
    const z1 = el.to
    const x0 = -HALF_W
    const x1 = HALF_W
    for (let i = 0; i <= el.cols; i++) {
      const x = x0 + ((x1 - x0) * i) / el.cols
      out.push({ size: [el.beam, el.depth, z1 - z0], pos: relCeil([x, H - el.depth / 2 - 0.01, (z0 + z1) / 2]) })
    }
    for (let j = 0; j <= el.rows; j++) {
      const z = z0 + ((z1 - z0) * j) / el.rows
      out.push({ size: [x1 - x0, el.depth, el.beam], pos: relCeil([0, H - el.depth / 2 - 0.01, z]) })
    }
    return out
  }, [el.cols, el.rows, el.from, el.to, el.beam, el.depth])

  return (
    <group>
      {/* the recessed panel field sits just above the grid */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={relCeil([0, H - 0.012, (el.from + el.to) / 2])} receiveShadow>
        <planeGeometry args={[ROOM.width, el.to - el.from]} />
        <meshStandardMaterial color={el.color} roughness={el.roughness ?? 0.85} />
      </mesh>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={el.trim} roughness={0.72} />
        </mesh>
      ))}
    </group>
  )
}

/* ── recessed light cove ───────────────────────────────────────────────── */

function Cove({ el }) {
  const len = el.to - el.from
  const mid = (el.from + el.to) / 2
  return (
    <group>
      {/* the recess */}
      <mesh position={relCeil([el.x, H - 0.06, mid])}>
        <boxGeometry args={[el.width + 0.12, 0.12, len]} />
        <meshStandardMaterial color="#dcdad4" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      {/* the light itself */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={relCeil([el.x, H - 0.045, mid])}>
        <planeGeometry args={[el.width, len]} />
        <meshStandardMaterial
          color={el.color}
          emissive={el.color}
          emissiveIntensity={el.intensity ?? 2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={relCeil([el.x, H - 0.3, mid - len * 0.25])} color={el.color} intensity={9} distance={9} decay={2} />
      <pointLight position={relCeil([el.x, H - 0.3, mid + len * 0.25])} color={el.color} intensity={9} distance={9} decay={2} />
    </group>
  )
}

/* ── flat panels: canvases, wainscot, curtains ─────────────────────────── */

function foldedCurtain(w, h) {
  const g = new THREE.PlaneGeometry(w, h, 26, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, Math.sin((x / w) * Math.PI * 9) * 0.045)
  }
  g.computeVertexNormals()
  return g
}

function Panel({ el }) {
  const isCurtain = !el.frame
  const [pw, ph] = el.size
  const geo = useMemo(() => (isCurtain ? foldedCurtain(pw, ph) : null), [isCurtain, pw, ph])
  return (
    <group>
      {isCurtain ? (
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial
            color={el.color}
            roughness={el.roughness ?? 0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[el.size[0], el.size[1], 0.04]} />
            <meshStandardMaterial color={el.frame} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[el.size[0] - 0.09, el.size[1] - 0.09]} />
            <meshStandardMaterial color={el.color} roughness={el.roughness ?? 0.9} />
          </mesh>
        </>
      )}
    </group>
  )
}

/* ── built-in joinery ──────────────────────────────────────────────────── */

/**
 * A run of built-in library shelving — carcass, side panels, dividers, shelf
 * boards and a plinth, in the same photographic timber as the beams. No CC0
 * model is a *built-in*: the point of one is that it is made for the wall it
 * sits against, so it is drawn to the wall's dimensions here. The books and
 * objects that fill it are separate elements, which is what lets them arrive
 * on their own beat after the carcass has landed.
 */
function Joinery({ el }) {
  const pbr = usePbr(el.texture ?? 'wood_dark', { repeat: el.repeat ?? [3, 2] })
  const { length: w, height: h, depth: d, bays = 3, shelves = 4 } = el
  const mat = { ...pbr, color: el.color, roughness: el.roughness ?? 0.42, metalness: el.metalness ?? 0.04 }
  const back = { color: el.back ?? el.color, roughness: 0.7 }
  const T = 0.034
  const plinth = 0.085

  const parts = useMemo(() => {
    const out = []
    // carcass
    out.push({ size: [w, T, d], pos: [0, h - T / 2, 0] }) // top
    out.push({ size: [w, T, d], pos: [0, plinth + T / 2, 0] }) // bottom
    out.push({ size: [T, h, d], pos: [-w / 2 + T / 2, h / 2, 0] })
    out.push({ size: [T, h, d], pos: [w / 2 - T / 2, h / 2, 0] })
    // vertical dividers
    for (let i = 1; i < bays; i++) {
      out.push({ size: [0.028, h - plinth, d], pos: [-w / 2 + (w * i) / bays, (h + plinth) / 2, 0] })
    }
    // shelf boards
    const inner = h - plinth - T * 2
    for (let j = 1; j <= shelves; j++) {
      out.push({ size: [w - T * 2, 0.03, d - 0.02], pos: [0, plinth + T + (inner * j) / (shelves + 1), 0.008] })
    }
    return out
  }, [w, h, d, bays, shelves])

  return (
    <group>
      {/* back panel, recessed and a shade darker so the bays read as depth */}
      <mesh position={[0, (h + plinth) / 2, -d / 2 + 0.012]} receiveShadow>
        <boxGeometry args={[w - T * 2, h - plinth - T, 0.022]} />
        <meshStandardMaterial {...pbr} {...back} />
      </mesh>
      {/* plinth, set back from the face */}
      <mesh position={[0, plinth / 2, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.05, plinth, d - 0.04]} />
        <meshStandardMaterial color={el.back ?? el.color} roughness={0.55} />
      </mesh>
      {parts.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
      {/* integrated shelf lighting */}
      {el.light &&
        Array.from({ length: shelves + 1 }, (_, j) => {
          const inner = h - plinth - T * 2
          const y = plinth + T + (inner * j) / (shelves + 1) + 0.012
          return (
            <mesh key={`l${j}`} position={[0, y, d / 2 - 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w - 0.14, 0.02]} />
              <meshStandardMaterial
                color={el.light}
                emissive={el.light}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
          )
        })}
    </group>
  )
}

/* ── wall-mounted flat panel ───────────────────────────────────────────── */

/**
 * A modern television is, physically, a very thin dark slab that mirrors the
 * room — which is exactly what makes it read as real. Rather than a period CRT
 * model, this is built to spec: aluminium chassis, hairline bezel, and a glossy
 * near-black screen with a high environment contribution, so the window and the
 * lit ceiling reflect across it as they would on a real panel.
 */
function Tv({ el }) {
  const [w, h] = el.size
  return (
    <group>
      {/* wall bracket, just visible at the edges */}
      <mesh position={[0, 0, -0.055]} castShadow>
        <boxGeometry args={[w * 0.28, h * 0.42, 0.055]} />
        <meshStandardMaterial color="#151618" roughness={0.62} metalness={0.35} />
      </mesh>
      {/* chassis */}
      <mesh position={[0, 0, -0.014]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.028]} />
        <meshStandardMaterial color="#191a1c" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* screen */}
      <mesh position={[0, 0, 0.0015]}>
        <planeGeometry args={[w - 0.016, h - 0.016]} />
        <meshStandardMaterial
          color="#07080a"
          roughness={0.055}
          metalness={0.6}
          envMapIntensity={1.9}
        />
      </mesh>
    </group>
  )
}

/* ── laptop ────────────────────────────────────────────────────────────── */

/**
 * The only laptop in the CC0 catalogue is a beige 1990s clamshell. A current
 * machine is two thin aluminium slabs and a dark glossy panel, so it is drawn
 * rather than sourced — at desk scale the reflection in the screen is the
 * whole illusion.
 */
function Laptop({ el }) {
  const w = el.width ?? 0.33
  const d = w * 0.7
  const screenH = w * 0.66
  const tilt = -(el.tilt ?? 1.9) // radians back from vertical
  return (
    <group>
      <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.016, d]} />
        <meshStandardMaterial color="#b6babf" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* keyboard well */}
      <mesh position={[0, 0.0165, 0.012]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.82, d * 0.6]} />
        <meshStandardMaterial color="#2b2d30" roughness={0.72} />
      </mesh>
      <group position={[0, 0.016, -d / 2 + 0.01]} rotation={[tilt, 0, 0]}>
        <mesh position={[0, screenH / 2, 0]} castShadow>
          <boxGeometry args={[w, screenH, 0.008]} />
          <meshStandardMaterial color="#aeb2b7" roughness={0.32} metalness={0.85} />
        </mesh>
        <mesh position={[0, screenH / 2, 0.0045]}>
          <planeGeometry args={[w - 0.014, screenH - 0.016]} />
          <meshStandardMaterial
            color="#0a0b0d"
            roughness={0.07}
            metalness={0.5}
            envMapIntensity={1.7}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ── dispatcher ────────────────────────────────────────────────────────── */

export function DesignElement({ el }) {
  const common = {
    id: el.id,
    category: el.category,
    motion: el.motion,
    opacityMax: el.opacityMax ?? 1,
  }

  switch (el.kind) {
    case 'model': {
      const y = el.anchor === 'ceiling' ? H - (el.drop ?? 0) : (el.position[1] ?? 0)
      return (
        <MotionElement
          {...common}
          position={[el.position[0], y, el.position[2]]}
          rotation={[0, el.rotation ?? 0, 0]}
        >
          <Model
            asset={el.asset}
            height={el.height}
            anchor={el.anchor}
            tint={el.tint}
            tintStrength={el.tintStrength}
            recolor={el.recolor}
            recolorMatch={el.recolorMatch}
            recolorStrength={el.recolorStrength}
            recolorContrast={el.recolorContrast}
            roughness={el.roughness}
            metalness={el.metalness}
            emitLight={el.emitLight}
          />
        </MotionElement>
      )
    }
    case 'finish':
      return (
        <MotionElement {...common} position={PIVOT}>
          <Finish el={el} />
        </MotionElement>
      )
    case 'rug':
      return (
        <MotionElement {...common} position={[el.position[0], 0, el.position[1]]}>
          <Rug el={el} />
        </MotionElement>
      )
    case 'beams':
      return (
        <MotionElement {...common} position={CEIL_PIVOT}>
          <Beams el={el} />
        </MotionElement>
      )
    case 'coffers':
      return (
        <MotionElement {...common} position={CEIL_PIVOT}>
          <Coffers el={el} />
        </MotionElement>
      )
    case 'cove':
      return (
        <MotionElement {...common} position={CEIL_PIVOT}>
          <Cove el={el} />
        </MotionElement>
      )
    case 'joinery':
      return (
        <MotionElement {...common} position={el.position} rotation={[0, el.rotation ?? 0, 0]}>
          <Joinery el={el} />
        </MotionElement>
      )
    case 'laptop':
      return (
        <MotionElement {...common} position={el.position} rotation={[0, el.rotation ?? 0, 0]}>
          <Laptop el={el} />
        </MotionElement>
      )
    case 'tv':
      return (
        <MotionElement {...common} position={el.position} rotation={el.rotation ?? [0, 0, 0]}>
          <Tv el={el} />
        </MotionElement>
      )
    case 'panel':
      return (
        <MotionElement {...common} position={el.position} rotation={el.rotation ?? [0, 0, 0]}>
          <Panel el={el} />
        </MotionElement>
      )
    default:
      return null
  }
}
