/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  A VIDEO WHOSE PLAYHEAD IS A NUMBER, NOT A CLOCK
 * ─────────────────────────────────────────────────────────────────────────────
 *  Binds one video's `currentTime` to a 0–1 value. The video is never played:
 *  the caller owns the number, so the film only ever moves when that number
 *  moves — forward when it rises, backward when it falls, frozen when it stops.
 *
 *  Seeking a compressed video is expensive, so the work is shaped to avoid the
 *  three things that make scrubbing stutter:
 *
 *    · seeks are applied at most once per paint, never once per scroll event;
 *    · the target is snapped to the frame grid and skipped when it is already
 *      within half a frame, so the decoder is not asked for work that would
 *      not change the picture;
 *    · while a seek is in flight the newest target is only remembered, and
 *      applied when `seeked` fires — overlapping seeks are what stall playback.
 *
 *  `attach` returns a `seek(0..1)` and a `dispose()`; nothing else is exposed
 *  and nothing here reads the clock.
 */
export function attachScrubber(video, { fps = 30 } = {}) {
  let target = 0
  let raf = 0

  const apply = () => {
    raf = 0
    const d = video.duration
    if (!Number.isFinite(d) || d <= 0) return // metadata has not landed yet
    const lastFrame = Math.max(0, Math.ceil(d * fps) - 1)
    const t = Math.min(lastFrame, Math.round(Math.max(0, target) * lastFrame)) / fps
    if (Math.abs(t - video.currentTime) < 0.5 / fps) return
    if (video.seeking) return // `seeked` re-runs this with the latest target
    video.currentTime = t
  }

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply)
  }

  video.addEventListener('seeked', schedule)
  /* once the duration is known, redraw at whatever position we are already at,
     so arriving mid-section is never a blank frame */
  video.addEventListener('loadedmetadata', schedule)
  video.addEventListener('loadeddata', schedule)
  video.pause()

  return {
    seek(v) {
      target = v
      schedule()
    },
    dispose() {
      cancelAnimationFrame(raf)
      video.removeEventListener('seeked', schedule)
      video.removeEventListener('loadedmetadata', schedule)
      video.removeEventListener('loadeddata', schedule)
    },
  }
}
