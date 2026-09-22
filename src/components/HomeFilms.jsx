import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { attachFrameRenderer } from '../home/frameRenderer.js'
import { Navigation } from './Navigation.jsx'
import { BEAT, QUOTES, frameAt, quoteAt } from '../home/sequence.js'
import { ASH, BURN_W, SMOKE, BurnMark } from '../home/BurnMark.jsx'

gsap.registerPlugin(ScrollTrigger)


const BRAND = 'KONST DESIGN'
const BRAND_SUB = 'Architecture · Interior Designs'

/** Scroll budget for the whole sequence, in viewport heights. Long on purpose:
 *  the films must have room to be read frame by frame, and the burn needs room
 *  to be watched rather than flicked past. */
const TRACK_VH = { wide: 640, narrow: 540 }

const goTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const CTA_BASE =
  'group inline-flex items-center justify-center gap-3 px-7 py-4 font-sans text-[12px] tracking-label transition-colors duration-500'

/** A single eased scroll coordinate controls sharp image frames, type and burn.
 * Direct image decoding avoids video keyframe seeking in either direction. */
export function HomeFilms({ viewport, reduced = false }) {
  const root = useRef(null)
  const opening = useRef(null)
  const openingCopy = useRef(null)
  const filmOne = useRef(null)
  const furnished = useRef(null)
  const layerTwo = useRef(null)
  const chapters = useRef(null)
  const mark = useRef(null)
  const quotes = useRef(null)
  const progressBar = useRef(null)
  const scrollCue = useRef(null)
  const ending = useRef(null)
  const narrow = viewport?.mobile || viewport?.portrait

  useLayoutEffect(() => {
    const el = root.current
    const v1 = filmOne.current
    const finishedRoom = furnished.current
    const svg = mark.current
    if (!el || !v1 || !finishedRoom || !svg) return

    const ctx = gsap.context((self) => {
      if (reduced) {
        v1.style.opacity = '0'
      }
      const one = reduced ? null : attachFrameRenderer(v1, { film: 'film-one', small: narrow })

      /* everything the burn writes to, looked up once */
      const eaten = svg.querySelector('[data-burn-eaten]')
      const charGrad = svg.querySelector('[data-burn-char]')
      const emberGrad = svg.querySelector('[data-burn-ember]')
      const glow = svg.querySelector('[data-burn-glow]')
      const ashG = svg.querySelector('[data-burn-ash]')
      const smokeG = svg.querySelector('[data-burn-smoke]')
      const ashEls = ASH.map((_, i) => svg.querySelector(`[data-ash="${i}"]`))
      const smokeEls = SMOKE.map((_, i) => svg.querySelector(`[data-smoke="${i}"]`))

      const quoteEls = QUOTES.map((q) => self.selector(`[data-quote="${q.id}"]`)[0])
      const endEls = ['title', 'sub', 'cta1', 'cta2'].map(
        (k) => self.selector(`[data-end="${k}"]`)[0],
      )

      let progress = 0
      let raf = 0
      let targetProgress = 0
      let previousTime = 0

      const render = (time = performance.now()) => {
        raf = 0
        const delta = previousTime ? Math.min(time - previousTime, 64) : 16
        previousTime = time
        // A short, time-based settle absorbs wheel steps without a long tail.
        progress += (targetProgress - progress) * (1 - Math.exp(-delta / 75))
        if (Math.abs(targetProgress - progress) < 0.00015) progress = targetProgress
        const raw = reduced ? 1 : progress
        const p = Math.max(0, (raw - 0.12) / 0.88)
        const intro = 1 - Math.min(1, Math.max(0, (raw - 0.035) / 0.085))
        opening.current.style.opacity = String(intro)
        opening.current.style.transform = `scale(${1 + raw * 0.08})`
        openingCopy.current.style.opacity = String(intro)
        openingCopy.current.style.pointerEvents = intro > 0.6 ? 'auto' : 'none'
        openingCopy.current.querySelectorAll('a').forEach(a => { a.tabIndex = intro > 0.6 ? 0 : -1 })
        const f = frameAt(p)

        one?.seek(f.filmOne, 1 + 0.018 * f.filmOne)
        progressBar.current.style.transform = `scaleX(${raw})`
        scrollCue.current.style.opacity = String(1 - Math.min(1, raw / 0.035))
        // A spatial reveal keeps surfaces sharp; no ghosting between rooms.
        const reveal = finishedRoom.complete && finishedRoom.naturalWidth ? f.interiorReveal : 0
        finishedRoom.style.clipPath = `inset(0 ${(1 - reveal) * 100}% 0 0)`
        layerTwo.current.style.opacity = String(f.fadeTwo)
        const labels = chapters.current.children
        labels[0].style.opacity = p < BEAT.cross[1] ? '1' : '0.38'
        labels[1].style.opacity = p >= BEAT.cross[0] ? '1' : '0.38'

        /* ── the burn ─────────────────────────────────────────────────────
           One front position drives all five layers. The letters are drawn
           once and never transformed; only the masks move across them. */
        svg.style.opacity = String(f.markVisible)
        svg.style.visibility = f.markVisible ? 'visible' : 'hidden'
        if (f.markVisible && !reduced) {
          const front = f.burn * BURN_W

          eaten.setAttribute('width', String(front))

          /* the scorch band trails the front; the ember band is tighter still */
          charGrad.setAttribute('x1', String(front - 190))
          charGrad.setAttribute('x2', String(front + 40))
          emberGrad.setAttribute('x1', String(front - 62))
          emberGrad.setAttribute('x2', String(front + 16))
          glow.style.opacity = String(f.ember * 0.85)

          /* ash and smoke only exist while the front is actually travelling */
          ashG.style.opacity = String(f.ember)
          smokeG.style.opacity = String(f.ember)
          for (let i = 0; i < ashEls.length; i++) {
            const a = ASH[i]
            const lift = f.ember
            ashEls[i].setAttribute('cx', String(front - a.lead + a.dx * lift))
            ashEls[i].setAttribute('cy', String(a.y - a.dy * lift))
            ashEls[i].style.opacity = String(Math.max(0, 1 - lift * 0.75))
          }
          for (let i = 0; i < smokeEls.length; i++) {
            const s = SMOKE[i]
            smokeEls[i].setAttribute('cx', String(front - s.lead + s.dx * f.ember))
            smokeEls[i].setAttribute('cy', String(200 - s.dy * f.ember))
            smokeEls[i].style.opacity = String(s.o * (1 - f.ember * 0.45))
          }
        }

        /* ── captions ─────────────────────────────────────────────────────
           Each one owns a band of the scroll; outside it, it is simply not
           there, so two can never overlap and scrolling back up hands over
           in exactly the reverse order. */
        for (let i = 0; i < quoteEls.length; i++) {
          const o = raw < 0.12 ? 0 : quoteAt(p, QUOTES[i].at)
          quoteEls[i].setAttribute('aria-hidden', String(o === 0))
          quoteEls[i].style.opacity = String(o)
          quoteEls[i].style.transform = reduced ? 'none' : `translate3d(0,${(1 - o) * 14}px,0)`
        }

        /* ── the closing scene ────────────────────────────────────────── */
        const ends = [f.endTitle, f.endSub, f.endCta1, f.endCta2]
        for (let i = 0; i < endEls.length; i++) {
          endEls[i].style.opacity = String(ends[i])
          endEls[i].style.transform = reduced ? 'none' : `translate3d(0,${(1 - ends[i]) * 26}px,0)`
        }
        /* the buttons are only clickable once they are actually there */
        ending.current.style.pointerEvents = f.endCta1 > 0.6 ? 'auto' : 'none'
        endEls[2].tabIndex = f.endCta1 > 0.6 ? 0 : -1
        endEls[3].tabIndex = f.endCta2 > 0.6 ? 0 : -1
        if (!reduced && progress !== targetProgress) schedule()
      }
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(render)
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onRefresh: (self) => {
          targetProgress = self.progress
          schedule()
        },
        onUpdate: (self) => {
          targetProgress = self.progress
          schedule()
        },
      })

      // Restore deep links immediately; ease only subsequent user scroll.
      finishedRoom.addEventListener('load', schedule)
      progress = targetProgress = st.progress
      schedule()
      return () => {
        cancelAnimationFrame(raf)
        one?.dispose()
        finishedRoom.removeEventListener('load', schedule)
      }
    }, root)

    return () => ctx.revert()
  }, [reduced, narrow])

  return (
    <section
      ref={root}
      aria-label="KONST DESIGN — in motion"
      className="home-films relative w-full bg-ink"
      style={{ height: reduced ? 'var(--app-vh, 100svh)' : `${narrow ? TRACK_VH.narrow : TRACK_VH.wide}svh` }}
    >
      <div className="sticky top-0 panel-h w-full overflow-hidden bg-ink">
        <div className="home-film-picture">
          <div className="home-film-layer" style={{ backgroundImage: "url('/assets/home-frames/film-one/" + (narrow ? 'small' : 'wide') + "/000.webp')" }}>
            <canvas ref={filmOne} className="home-film-canvas" aria-hidden="true" style={{ opacity: 0 }} />
          </div>
          <div ref={layerTwo} className="home-film-layer" style={{ opacity: reduced ? 1 : 0, backgroundImage: "url('/assets/rooms/interior-empty.png')" }}>
            <img ref={furnished} src="/assets/rooms/interior-furnished.png" alt="" aria-hidden="true" width="1774" height="887" decoding="async" className="home-room-still" style={{ clipPath: reduced ? 'inset(0)' : 'inset(0 100% 0 0)' }} />
          </div>
        </div>
        <div ref={opening} className="home-opening-image" aria-hidden="true"><img src="/assets/services/visiting-room.webp" alt="" width="1600" height="900" fetchPriority="high" /></div>
        <div ref={openingCopy} className="home-opening-copy">
          <p className="eyebrow">Architecture · Interiors · Visualization</p>
          <h1>Spaces for life.<br /><em>Designed around you.</em></h1>
          <div className="home-opening-bottom"><p>Thoughtful architecture and interiors.<br />From the first idea to the way you live.</p><a href="#projects" className="primary-link">Discover our work <span aria-hidden="true">↗</span></a></div>
        </div>
        <div ref={chapters} aria-hidden="true" className="home-film-chapters">
          <span>01 <i /> Architecture</span>
          <span>02 <i /> Interiors</span>
        </div>

        <div className="home-film-vignette pointer-events-none absolute inset-0 z-10" />
        <div aria-hidden="true" className="home-film-progress absolute inset-x-0 bottom-0 z-30 h-px bg-white/15">
          <div ref={progressBar} className="h-full origin-left bg-brass" style={{ transform: 'scaleX(0)' }} />
        </div>
        <div ref={scrollCue} aria-hidden="true" className="home-film-cue pointer-events-none absolute bottom-8 right-5 z-30 flex items-center gap-3 sm:right-8 lg:bottom-16 lg:right-12">
          <span className="font-sans text-[12px] uppercase tracking-[0.22em] text-bone/70">Scroll to discover</span>
          <span className="relative h-9 w-px overflow-hidden bg-white/20"><span className="home-film-cue-line absolute inset-x-0 top-0 h-4 bg-brass" /></span>
        </div>

        {/* legibility scrims — top for the chrome, bottom for the caption */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[22vh]"
          style={{ background: 'linear-gradient(to bottom, rgba(8,7,6,0.72), rgba(8,7,6,0.28) 55%, transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30vh]"
          style={{ background: 'linear-gradient(to top, rgba(8,7,6,0.68), rgba(8,7,6,0.12) 55%, transparent)' }}
        />

        {/* the branding + navigation, over the sequence */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-9">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="pointer-events-auto font-sans text-[12px] font-extralight uppercase tracking-brand text-bone sm:text-[16px]"
            >
              KONST&nbsp;DESIGN
            </a>
            <Navigation />
          </div>
        </header>

        {/* the wordmark, burning — stationary, centred, letters only */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <BurnMark text={BRAND} sub={BRAND_SUB} markRef={mark} />
        </div>

        {/* ── the caption, lower left, clear of the navigation ──────────── */}
        <div
          ref={quotes}
          className="pointer-events-none absolute bottom-0 left-0 z-20 w-full px-5 pb-10 sm:px-8 sm:pb-12 lg:max-w-[46vw] lg:px-12 lg:pb-16"
        >
          {QUOTES.map((q, i) => (
            <div
              key={q.id}
              data-quote={q.id}
              style={{ opacity: 0, willChange: 'transform, opacity' }}
              className="home-film-caption"
            >
              <div className="home-film-eyebrow"><span>{String(i + 1).padStart(2, '0')} / 07</span><span>{i < 4 ? 'THE ARCHITECTURE' : 'THE INTERIOR'}</span></div>
              <p className="home-film-heading">
                {q.heading}
              </p>
              <p className="mt-2 max-w-[34ch] font-display text-[clamp(0.82rem,1.5vw,1.15rem)] font-light italic leading-snug text-bone/75 [text-shadow:0_2px_16px_rgba(8,7,6,0.9)] sm:mt-3">
                {q.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── the closing scene, at the end of the second film ──────────── */}
        <div
          ref={ending}
          style={{ pointerEvents: 'none' }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          {/* high-contrast editorial serif — hairline horizontals against
              weighted stems, tracked open. Delicate, not bold; the weight is
              400 and never rises. Size, position, alignment and the
              scroll-driven reveal are unchanged. */}
          <h2
            data-end="title"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
            className="font-editorial text-[clamp(1.9rem,7vw,5.4rem)] leading-[1.05] tracking-editorial text-bone [text-shadow:0_2px_30px_rgba(8,7,6,0.7)]"
          >
            {BRAND}
          </h2>
          <p
            data-end="sub"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
            className="mt-5 font-display text-[clamp(0.9rem,1.7vw,1.15rem)] font-light italic text-bone/75 [text-shadow:0_2px_18px_rgba(8,7,6,0.7)]"
          >
            Architecture, 3D design, visualization
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              data-end="cta1"
              tabIndex={-1}
              href="#projects"
              onClick={goTo('projects')}
              style={{ opacity: 0, willChange: 'transform, opacity' }}
              className={`${CTA_BASE} border border-brass bg-brass text-ink hover:border-bone hover:bg-bone`}
            >
              Explore Our Work
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <a
              data-end="cta2"
              tabIndex={-1}
              href="#start-project"
              onClick={goTo('start-project')}
              style={{ opacity: 0, willChange: 'transform, opacity' }}
              className={`${CTA_BASE} border border-bone bg-bone text-ink hover:border-brass hover:bg-brass`}
            >
              Start Your Project
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
