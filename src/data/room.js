/**
 * The physical room. Metres, Y-up, one-point perspective toward the back wall.
 * Every design is staged inside this exact shell — the camera and the shell
 * never move between designs, only what is inside them.
 */
export const ROOM = {
  width: 7.0, // x: -3.5 … 3.5
  height: 3.35, // y: 0 … 3.35
  back: -5.2, // z of the back (window) wall
  front: 3.4, // z of the front wall, behind the camera
  wall: 0.16, // wall thickness
}

export const HALF_W = ROOM.width / 2

/** The window punched through the back wall. */
export const WINDOW = {
  x0: -2.45,
  x1: 2.45,
  y0: 0.46,
  y1: 2.86,
  reveal: 0.34, // depth of the reveal / jamb
  mullions: 3, // vertical divisions between the glazing
}

export const CAMERA = {
  position: [0, 1.08, 3.0],
  target: [0, 1.34, -5.0],
  fov: 38,
  near: 0.1,
  far: 60,
  /**
   * The framing is fitted, not fixed: we ask for a minimum visible width and
   * height at the back wall and solve for the vertical FOV. That keeps the
   * same composition on a 21:9 monitor and a phone in portrait — and, more
   * importantly, keeps it identical across all four design states.
   */
  fit: {
    height: 5.2,
    widthWide: 10.4, // at 16:9 and wider
    widthSquare: 7.7, // at 1:1
    widthTall: 6.4, // at 9:16
    minFov: 26,
    maxFov: 66,
  },
}

/** Warm, low, late-afternoon sun raking in through the window. */
/** The photographic view through the glass — same sky as the HDRI. */
export const BACKDROP = {
  z: -21.2,
  width: 26,
  height: 13.52, // matches backdrop.jpg's 1.923 aspect
  y: 1.6,
}

export const SUN = {
  position: [-7.2, 8.6, -14],
  target: [0.2, 0.2, -1.6],
  color: '#ffd7a1',
  intensity: 26,
}
