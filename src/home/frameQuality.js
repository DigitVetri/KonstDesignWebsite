// Shared by the encoder and canvas so display resolution matches the assets.
// These are enhanced exports from 720p footage, not native higher-resolution masters.
export const FRAME_TIERS = {
  wide: { width: 2560, height: 1440, quality: 92, capacity: 12 },
  small: { width: 1440, height: 810, quality: 90, capacity: 24 },
  tall: { width: 1200, height: 1500, quality: 92, capacity: 20 },
}
