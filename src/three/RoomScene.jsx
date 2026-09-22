import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA, SUN, ROOM } from '../data/room.js'
import { DESIGNS } from '../data/designs.js'
import { RoomShell } from './RoomShell.jsx'
import { DesignElement } from './DesignElements.jsx'
import { applyAll } from '../motion/registry.js'
import { mood } from '../motion/DesignTransition.js'

/* ── camera: fixed framing, with a slow hand-held breath ───────────────── */

const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}

/** Solve the vertical FOV that frames the room for this viewport. */
function fitFov(aspect, dist) {
  const f = CAMERA.fit
  const t = Math.max(0, Math.min(1, (aspect - 0.5625) / (1.7778 - 0.5625)))
  const width =
    t < 0.5
      ? f.widthTall + (f.widthSquare - f.widthTall) * (t / 0.5)
      : f.widthSquare + (f.widthWide - f.widthSquare) * ((t - 0.5) / 0.5)
  const fromHeight = 2 * Math.atan(f.height / 2 / dist)
  const fromWidth = 2 * Math.atan(width / 2 / dist / aspect)
  const fov = (Math.max(fromHeight, fromWidth) * 180) / Math.PI
  return Math.max(f.minFov, Math.min(f.maxFov, fov))
}

function CameraRig({ mobile }) {
  const size = useThree(state => state.size)
  const target = useMemo(() => new THREE.Vector3(...CAMERA.target), [])
  const base = useMemo(() => new THREE.Vector3(...CAMERA.position), [])
  const current = useRef(base.clone())

  useFrame(({ camera }, dt) => {
    const fov = fitFov(size.width / size.height, base.z - ROOM.back)
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    const k = Math.min(1, dt * 2.2)
    // parallax is deliberately tiny — the framing must not change between designs
    const px = mobile ? 0 : pointer.x * 0.16
    const py = mobile ? 0 : -pointer.y * 0.09
    // the transition itself adds one slow push-in, then releases
    const breath = Math.sin(mood.sweep * Math.PI) * 0.13

    current.current.lerp(
      new THREE.Vector3(base.x + px, base.y + py + breath * 0.15, base.z - breath - mood.scroll * 0.22),
      k,
    )
    camera.position.copy(current.current)
    camera.lookAt(target.x + px * 0.4, target.y + py * 0.4, target.z)
  })
  return null
}

/* ── per-frame element pass + tone grading ─────────────────────────────── */

function MotionDriver({ mobile }) {
  const { scene, camera } = useThree()
  const sun = useRef(null)
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { __konstScene: scene, __konstCamera: camera })
  }, [scene, camera])
  useFrame(({ gl }) => {
    applyAll()
    gl.toneMappingExposure = 1.06 * mood.exposure
    if (sun.current) {
      sun.current.intensity = SUN.intensity * (0.82 + mood.warmth * 0.22)
      sun.current.color.setHSL(
        0.083 - (mood.warmth - 1) * 0.026,
        Math.min(0.75, 0.55 * mood.warmth),
        0.6,
      )
    }
  })
  return (
    <>
      <directionalLight
        ref={sun}
        position={SUN.position}
        target-position={SUN.target}
        color={SUN.color}
        intensity={SUN.intensity}
        castShadow
        shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.022}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
    </>
  )
}

/* ── the scene ─────────────────────────────────────────────────────────── */

function SceneContents({ mobile }) {
  return (
    <>
      <CameraRig mobile={mobile} />
      <MotionDriver mobile={mobile} />

      {/* lighting only — the window view is a sharp photographic plane */}
      <Environment files="/assets/hdri/golden.hdr" environmentIntensity={1.0} />
      <ambientLight intensity={0.2} color="#cfd8e2" />
      {/* bounce off the floor, keeps the shadows from going dead */}
      <hemisphereLight args={['#ffe8c8', '#8a7a64', 0.55]} position={[0, ROOM.height, 0]} />
      {/* cool fill from the camera side so the shadow wall never goes dead */}
      <directionalLight position={[6.5, 3.4, 6]} intensity={0.85} color="#cddbe6" />

      {/* light bouncing off the sunlit floor back onto the ceiling */}
      <pointLight position={[0, 0.45, -1.8]} intensity={7} distance={9} decay={2} color="#ffdcae" />

      <RoomShell />

      {DESIGNS.map((design) => (
        <group key={design.id}>
          {design.elements.map((el) => (
            <DesignElement key={el.id} el={el} />
          ))}
        </group>
      ))}
    </>
  )
}

export function RoomScene({ mobile = false, dpr = [1, 1.85], onReady }) {
  return (
    <Canvas
      shadows="soft"
      dpr={dpr}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        position: CAMERA.position,
        fov: CAMERA.fov,
        near: CAMERA.near,
        far: CAMERA.far,
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.06
        onReady?.()
      }}
    >
      <Suspense fallback={null}>
        <SceneContents mobile={mobile} />
      </Suspense>
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  )
}
