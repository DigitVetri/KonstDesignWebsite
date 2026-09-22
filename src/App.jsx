import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HomeFilms } from './components/HomeFilms.jsx'
import { Quote } from './components/Quote.jsx'
import { Services } from './components/Services.jsx'
import { Projects } from './components/Projects.jsx'
import { Experience } from './components/Experience.jsx'
import { Recognition } from './components/Recognition.jsx'
import { HowWeWork } from './components/HowWeWork.jsx'
import { StartProject } from './components/StartProject.jsx'
import { Studios } from './components/Studios.jsx'
import { SiteFooter } from './components/SiteFooter.jsx'
import { About } from './components/About.jsx'
import { setExperience } from './state/experience.js'
import { setReducedMotion } from './state/controller.js'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js'
import { useViewport } from './hooks/useViewport.js'

export default function App() {
  const reduced = usePrefersReducedMotion()
  const viewport = useViewport()
  /**
   * The pinned panels have to cover the viewport exactly, or the section's own
   * background shows through as a band along the bottom — which on the dark
   * sections reads as a black stripe on a phone.
   *
   * Viewport units alone do not settle it: `svh` is the height with the
   * address bar showing, so the band appears the moment that bar retracts, and
   * even `dvh` is resolved by the CSS engine and can disagree with the height
   * the page actually scrolls through. So the viewport is measured here and
   * published as `--app-vh`, which is what `.panel-h` reads.
   *
   * The measurement is re-taken on resize and on the visual viewport's own
   * changes, rAF-batched, and only written when it actually moved — and
   * `ignoreMobileResize` stops the address bar's resize from making
   * ScrollTrigger recalculate every pin mid-scroll.
   */
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })

    let raf = 0
    let last = 0
    const measure = () => {
      raf = 0
      /* Whichever of the two is larger. `innerHeight` is the layout viewport
         the page actually scrolls through; `visualViewport` is what is on
         screen right now. They disagree in both directions depending on the
         browser and whether the address bar is out, and covering the LARGER
         is the only choice that can never leave a strip of the section
         showing underneath. */
      const h = Math.round(Math.max(window.innerHeight || 0, window.visualViewport?.height || 0))
      if (!h || Math.abs(h - last) < 1) return
      last = h
      document.documentElement.style.setProperty('--app-vh', `${h}px`)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()

    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [])

  useEffect(() => {
    setReducedMotion(reduced)

  }, [reduced])

  useEffect(() => {
    setExperience({ phase: 'live', assetsReady: true })
    document.body.dataset.locked = 'false'
    let alive = true
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh() })
    return () => { alive = false }
  }, [])

  return (
    <>
      <a className="skip-link" href="#about">Skip the introduction</a>
      <main id="top">
        {/* Home opens on the two-film sequence — both scroll-controlled, one
            continuous shot — and flows from there into the first quote. */}
        <HomeFilms viewport={viewport} reduced={reduced} />

        {/* HOME → QUOTE 1 → ABOUT → QUOTE 2 → SERVICES → QUOTE 3. */}
        <Quote
          index="01"
          eyebrow="THE STUDIO"
          tag="ARCHITECTURE · INTERIORS · 3D"
          lines={['DESIGNED AROUND', 'THE WAY YOU LIVE.']}
          body="We design, build and develop homes shaped around the people who live in them — clean, modern and progressive, from the first plan to the finished room."
          reduced={reduced}
        />

        <About viewport={viewport} reduced={reduced} />

        <Quote
          index="02"
          eyebrow="OUR EXPERTISE"
          tag="ARCHITECTURE · INTERIORS · 3D"
          lines={['ARCHITECTURE.', 'INTERIORS.', 'VISUALIZATION.']}
          body="Three disciplines, one studio. Every project moves through the same hands — from the first sketch of a plan to the last light fitting on site."
          reduced={reduced}
        />

        <Services viewport={viewport} reduced={reduced} />

        <Quote
          index="03"
          eyebrow="THE STUDIO"
          tag="COIMBATORE"
          lines={['DRAWN, DETAILED,', 'DELIVERED.']}
          body="The same care from the first measured drawing to the day the keys are handed over — considered, resolved, and finished to last."
          reduced={reduced}
        />

        {/* Selected work — the 3D presentation-board gallery Quote 3 introduces.
            Added after Quote 3; nothing above it is touched. */}
        <Projects reduced={reduced} />

        {/* Everything after Projects — one continuous cinematic close on the
            site's cream drafting-paper language, ending on the dark footer.
            Additive only; every section above is untouched. */}
        <Experience reduced={reduced} />
        <Recognition reduced={reduced} />
        <HowWeWork reduced={reduced} />
        <StartProject reduced={reduced} />
        <Studios viewport={viewport} reduced={reduced} />
        <SiteFooter reduced={reduced} />
      </main>
    </>
  )
}
