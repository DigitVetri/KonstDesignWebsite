import { useLayoutEffect, useRef } from 'react'
import { registerElement, attachObject, releaseElement } from '../motion/registry.js'

/**
 * Wraps one animatable thing in the room.
 *
 *   <group>            static placement from the design data — never animated
 *     <group ref>      the motion node — scale / lift / fade live here
 *       …geometry…
 *
 * Registering it makes it addressable by the transition engine. Every element
 * in the scene goes through this component, which is what guarantees a
 * mid-transition frame has each piece at its own scale and opacity.
 */
export function MotionElement({
  id,
  category,
  motion = 'grow',
  opacityMax = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
}) {
  const inner = useRef(null)

  useLayoutEffect(() => {
    registerElement(id, { category, motion, opacityMax })
    attachObject(id, inner.current)
    if (inner.current) inner.current.visible = false
    return () => releaseElement(id)
  }, [id, category, motion, opacityMax])

  return (
    <group position={position} rotation={rotation}>
      <group ref={inner}>{children}</group>
    </group>
  )
}
