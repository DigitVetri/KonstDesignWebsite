# Konst Design

A single screen. One room, photographed once, redesigned three times in front of
you as you scroll — then, below it, a second room drawn, built and designed
line by line under the scrollbar.

```bash
npm install
npm run assets      # fetch + optimise the CC0 asset set (~36 MB, one time)
npm run backdrop    # build the view through the window
npm run dev
```

`npm run assets` must run before the first `npm run dev` — `public/assets/` is
not committed. Both scripts are idempotent and skip anything already present.

---

## What this is

The brief that produced this had failed twice before, both times the same way:
the "designs" ended up as finished photographs cross-fading into one another.
So the constraint here is structural rather than stylistic — **there is no
picture of a room anywhere in this project.** There is a room, made of real
geometry and real photographic materials, and every object in it is an
independently animatable node. A cross-fade is not something this codebase can
express.

## How it is built

**A real 3D room, not layered images.** Three.js via React Three Fiber. The
shell (floor, ceiling, three walls, a punched window with reveals, mullions,
skirting, cornice) is geometry carrying PBR textures — albedo, normal and packed
AO/roughness/metalness maps. Furniture is real CC0 models. Lighting is an HDRI
environment plus a low golden-hour sun that throws the window's own shadow
across the floor.

Everything is [Poly Haven](https://polyhaven.com) CC0 — see [CREDITS.md](CREDITS.md).

**Why 3D rather than photographic cut-outs.** Cut-outs from different shoots
never share a light direction, so they composite into a collage. One HDRI-lit
scene gives every object the same sun for free — and, more to the point, it
removes the shortcut: there is no flat "before" and "after" layer available to
fade between.

**Every element animates on its own.** `src/motion/registry.js` holds one
`{ p }` presence value per element. GSAP tweens those numbers; a single
per-frame pass writes scale, lift and opacity onto the three.js objects. Nothing
in React re-renders during a transition. At any moment mid-transition the
elements are genuinely at different states — in the browser console:

```js
__konstElements()   // { 'd1-sofa': {p: 0.86}, 'd1-table': {p: 0.50}, … }
```

**One engine, two inputs.** `src/motion/DesignTransition.js` builds a timeline
that runs the outgoing pieces out — decor, then furniture, then materials, then
architecture — and the incoming pieces in the other way round: architecture
first, decor last. Scroll steps and button clicks both go through
`goTo()` in `src/state/controller.js` and share one store, so the scroll
position and the highlighted button cannot disagree.

Stepping straight back the way you came replays the *same* timeline with
`.reverse()`. Anything else — a button jump, an interrupted step — builds a
fresh timeline from wherever the elements currently are, and drives out anything
the target does not want regardless of which design it belonged to, so a
half-faded chair can never be stranded.

**Re-upholstery.** Most CC0 models put leather, fabric and timber on one
material, so "recolour the cushions" is not addressable by material name. A
`tint` only multiplies the albedo, which can only darken — a navy chesterfield
stays navy. `src/three/recolorMap.js` rebuilds the albedo map instead: it keeps
each pixel's luminance (tufting, seams, wear, grain) and replaces hue and
saturation. That is how the same sofa reads cognac in Design 01 and the same
wing chair reads ivory in Design 03, with all its photographic detail intact.

**Framing.** The camera never moves between designs. Its vertical FOV is solved
per viewport from a target visible width and height at the back wall, so a 21:9
monitor and a laptop get the same composition. A one-point interior cannot
survive a 9:16 crop, so on phones the room is framed as its own landscape band
with the type below it — a different composition, not a squeezed one.

## Layout

```
src/
├─ data/
│  ├─ room.js            room dimensions, window, camera, sun
│  └─ designs.js         the three schemes, as flat lists of elements
├─ motion/
│  ├─ profiles.js        grow / rise / surface / drop + the stagger table
│  ├─ registry.js        element registry and the per-frame apply pass
│  └─ DesignTransition.js the shared engine
├─ state/
│  ├─ experience.js      the single source of truth
│  └─ controller.js      goTo() — the one place a design change happens
├─ three/
│  ├─ RoomScene.jsx      canvas, camera rig, lighting
│  ├─ RoomShell.jsx      the empty room
│  ├─ DesignElements.jsx finishes, rugs, beams, coffers, coves, panels
│  ├─ MotionElement.jsx  registers one animatable node
│  ├─ Model.jsx          GLB loading, auto-fit, re-upholstery
│  └─ recolorMap.js      luminance-preserving albedo recolour
├─ about/
│  ├─ geometry.js        the one-point perspective solve, shared by all 3 stages
│  ├─ RoomDrawing.jsx    sketch · shell · interior, one SVG
│  └─ useAboutTimeline.js the scrubbed timeline
├─ services/
│  ├─ useServicesTimeline.js the scrubbed horizontal-gallery pass
│  └─ ServiceDetail.jsx  the expanded service overlay
├─ projects/
│  ├─ useProjectsDeck.js the scrubbed 3D coverflow deck
│  └─ ProjectDetail.jsx  the project case-study modal
├─ hooks/                usePrefersReducedMotion · useViewport · useScrollReveal
├─ data/                 …plus studio.js (stats · awards · principles · studios · footer)
└─ components/           LoadingScreen · Navigation · Hero · DesignSelector ·
                         DesignCaption · Quote · Services · Projects · About ·
                         Experience · Recognition · HowWeWork · StartProject ·
                         Studios · SiteFooter
```

`data/services.js` and `data/projects.js` hold the section content;
`scripts/make-services.mjs` / `scripts/make-projects.mjs`
(`npm run services` / `npm run projects`) re-encode the supplied photographs
to WebP.

## Adding Design 04

Add the model slugs to `scripts/assets.manifest.mjs`, run `npm run assets`, and
append one object to `DESIGNS` in `src/data/designs.js`. The transition engine,
the scroll stepper and the selector all read from that array; none of them need
changing.

Real Konst Design photography or renders drop in the same way — a `.glb` per
piece in `public/assets/models/`, a texture set per finish. Placement is written
as "this tall, here, facing this way"; `Model.jsx` measures each piece's
bounding box and sits it on the floor, so nothing needs hand-tuned offsets.

## About Us

A second pinned section, below the hero and sharing nothing with it but the
design tokens. One room is drawn, built and then designed in front of you:

```
LINE → STRUCTURE → SPACE → MATERIAL → LIFE
```

**Scroll is the only timeline.** One GSAP timeline, 100 units long, scrubbed
1:1 by `ScrollTrigger` with `scrub: true` — deliberately `true` and never a
number, because a number keeps easing after you have stopped. There is no
`repeat`, no `delay`, and no tween in `useAboutTimeline.js` that can advance on
its own. Stop mid-stroke and it freezes mid-stroke; scroll back and every stage
retracts through the identical path, down to the first pencil line. Forward and
reverse are verifiably the same states, not two code paths.

```
 0 – 20   the pen draws the room, line by line
20 – 35   the completed drawing flies LEFT → CENTRE → RIGHT
35 – 70   those same lines gain surface, depth and shadow
70 – 80   the completed empty room flies RIGHT → CENTRE → LEFT
80 – 100  paint → materials → ceiling → floor → furniture → decor → light
```

Each stage finishes before the next begins — no two ranges overlap across a
stage boundary.

**One room, not three pictures.** `about/geometry.js` solves a single one-point
perspective: `P(x, y, t)` pushes a point on the picture plane to depth `t` by
scaling it about the vanishing point, so the front frame and the back wall are
homothetic. Every wall, the window, the door, the niche, the ceiling recess and
every piece of furniture is derived from that one solve. The window in the
finished interior is the same window, to the pixel, as the one in the opening
sketch — there is no second asset available to drift out of alignment, which is
the same constraint the hero applies to the 3D room.

**Lines draw, they do not fade.** Each pen stroke carries `pathLength="1000"`
and is revealed with `stroke-dashoffset`, its own sub-range of the scroll. The
normalisation is 1000 rather than 1 because GSAP rounds px-unit values to whole
numbers: normalise to 1 and the entire reveal collapses into a single integer
step, so every line snaps in instead of drawing itself.

**Surfaces wipe, they do not appear.** Each surface is revealed by a clip rect
scaling out of the edge it belongs to — a wall grows out of the corner it meets,
the floor grows back to front. The origin is expressed against the rect's own
box rather than in user space; GSAP's `svgOrigin` leaves a residual translate
behind when set on an element that already carries a transform, which silently
slides a clip off the surface it is meant to reveal.

Copy is taken only from [konstdesign.in](https://konstdesign.in/index.html) —
the three services it lists, how it describes its work, and where it is. The
counters on that site are placeholders, so no numbers, awards or client names
appear in this section.

On phones the left/right composition is dropped rather than squeezed: the room
sits above its own copy in reading order, with the same scroll-controlled
reveal for each stage.

## Services

A horizontal gallery of the six services — bedroom, ceiling, pooja room, TV
unit, visiting room, modular kitchen — sitting between the hero and About Us on
a warm cream ground, the one light beat between the two dark rooms.

**Scroll is the only clock**, exactly as next door. `services/useServicesTimeline.js`
runs one paused GSAP timeline scrubbed `scrub: true` (never a number): the six
photographs travel left→right tied 1:1 to the scrollbar, freeze the instant
scrolling stops, and retrace on the way back up. No autoplay, no carousel, no
loop. A sticky child pins the section for the length of the pass, then releases
into About Us untouched.

The travel distance is read from the DOM on every refresh (`track.scrollWidth −
container width`), so the sixth image always lands at the right margin whatever
the viewport or the image widths — nothing is hard-coded to a pixel count, and
no photograph is ever cropped to fit a frame (each panel's width is derived
from the image's native ratio).

**The detail overlay** (`services/ServiceDetail.jsx`) opens above the gallery
without navigating away: large image, number, title, a short factual
description, an ENQUIRE mail-to CTA (the studio's real address), close, and
prev/next that step through all six in place with the `0X / 06` progress. It
locks the background scroll while open and restores the exact position on
close. On mobile it restructures to a vertical stack.

Copy is drawn only from konstdesign.in — no invented awards, statistics, or
clients.

## Projects

A 3D floating presentation-board gallery — six projects on a curved arc in a
deep-brown architectural space, one board dominant at centre and the rest
receding in depth, over a fine perspective drafting floor. It sits after Quote
3 (which introduces it) and shares the site's one rule: scroll is the only
clock.

`projects/useProjectsDeck.js` runs one paused GSAP timeline scrubbed
`scrub: true` (never a number), pinned by a sticky child, advancing a single
continuous `progress` from 0 to 5 — the index at centre. Each board's place on
the arc is derived from its distance to `progress` (nearer = larger, more
front-facing, more forward; further = smaller, rotated, deeper, dimmer),
written per scrubbed frame as transform + opacity only. The rounded centre
index drives the left-hand active copy and the right-hand 01–06 index, and
re-renders React at most six times across a pass, never per frame.

Clicking any board opens `projects/ProjectDetail.jsx` — a case-study modal
(large image, category/number, title, location·year·area, two description
paragraphs, outlined service tags, a ruled details table, and a
START-A-PROJECT mail-to CTA), closed by the × or Escape, leaving the gallery
at the exact project behind it. On mobile the arc tightens and the modal
stacks vertically. All copy is transcribed verbatim from the brief.

Project photographs come only from the supplied ZIP, mapped 01–06 in fixed
order. (That ZIP currently holds two distinct images across the six slots;
`npm run projects` re-encodes by filename, so replacing the source files with
distinct photographs — same names — updates every slot.)

## Experience → Footer

Everything after Projects is one cinematic close, built entirely on the site's
existing cream drafting-paper language (the About / Quotes / Services token
set) so no new palette is introduced; a soft gradient bridges the dark
Projects seam. Every motion is scroll-driven through the site's ScrollTrigger,
transform/opacity only, reversible, and collapses to a clean static state under
`prefers-reduced-motion`.

- **Experience** — the `14+ / years of / designing / better / spaces.` headline
  builds line by line, scrubbed 1:1 by scroll with drafting lines drawing
  around it; the completed living-room photograph parallaxes gently; the four
  credentials settle in. (The brief's `04 Recognition` reads as the next
  section's index, not a fifth stat, so four stats are shown.)
- **Recognition** — the six awards listed once as an editorial credits sweep;
  whichever crosses the focal line becomes the active (ink + terracotta) one.
  No arrows, no carousel.
- **How we work** — the four principles assembled one active layer at a time.
- **Start a project** — a floor plan drawn entirely in SVG (dimension → walls →
  partition + door → labels → title block) that constructs itself on scroll and
  bridges into the `Let's design your space.` call to action.
- **Studios** — a 50/50 map + information block, pinned by a sticky child. A
  code-drawn top-down map (no external tiles) zooms regional → Coimbatore on
  scroll and reveals the pin only at the end; the two studios reveal beside it.
- **Footer** — the dark cocoa page with the inverse cream grid, bookending
  Quote 3 and Projects: brand, navigation, services, contact, follow.

Content (`data/studio.js`) is transcribed from the brief; addresses, phones and
email are the real konstdesign.in details. Two things await you: the exact
Google Maps share URLs (per studio — the links currently open each studio's own
stated address, not an invented coordinate) and the social handles (rendered
but not linked). Drop both into `data/studio.js` and they wire up.

## Scope

One continuous portfolio, from the pinned hero to the footer:

```
HOME → QUOTE 1 → ABOUT US → QUOTE 2 → SERVICES → QUOTE 3 → PROJECTS
     → EXPERIENCE → RECOGNITION → HOW WE WORK → START A PROJECT
     → STUDIOS → FOOTER
```

The three quotes (`components/Quote.jsx`) are full-page drafting-paper
interstitials on one shared grid system — a faint brown grid on the cream
pages, a faint cream grid on the deep-brown page (Quote 3), built from CSS
gradients, no images. Each carries a numbered ruled header, an eyebrow, a
large Cormorant statement whose first line rests in the terracotta accent, and
a short supporting line; the type warms from ink to terracotta on hover/touch,
and reveals once on scroll-in via the site's existing ScrollTrigger — never
pinned, so they never trap the reader. Copy is the studio's own register, with
no invented awards, statistics, or clients. No routes; the nav's About Us item
scrolls to `#about`, the rest are decorative.

### Home frame sequence

The home uses individual WebP frames rendered to canvas. The original films stay
in `public/assets/video`; `npm run home:frames` rebuilds the 240 frames per film
in three sizes: 2560×1440 desktop, 1440×810 small landscape, and 1200×1500
portrait (requires FFmpeg). Exports use the original 720p films directly, avoiding
the extra compression in the scroll-video derivatives. Lanczos enlargement and
the existing colour/sharpening treatment preserve the imagery; these are upscaled
exports, not native 1440p or generated detail. WebP quality is 92 (90 for small).
`src/home/frameQuality.js` keeps the encoder and renderer dimensions in sync.
Only the selected size is loaded, with four concurrent decodes and a bounded
nearby-frame cache (12 desktop, 24 small, 20 portrait frames). Canvas resolution
accounts for device pixel density and both axes of the cover crop, and settled
frames avoid redundant paints. Higher-quality frames cost more bandwidth;
nearby frames are prefetched, rather than decoding the entire sequence in memory.
Posters remain visible if images are unavailable.

`npm run test:home` checks decode scheduling, reversal, resize, error handling,
cleanup, and timeline boundaries. Reduced motion displays the final still.

### Portfolio UI

The home now opens immediately on the supplied living-room image with a visible
heading and project link. Its scroll sequence follows the introduction. Services
and projects use native document-flow galleries; all detail dialogs remain
available. Mobile navigation is a keyboard-accessible overlay. About and Studios
use document flow on small screens, and reduced-motion layouts avoid their pins.

Run `node scripts/check-site.mjs` for desktop/mobile structural rendering and
local module/asset checks. This does not replace visual browser testing.

The interior portion now uses matched AI-reconstructed room stills in
`public/assets/rooms/`. A scroll-driven clip reveal replaces interior-video
scrubbing, so this section no longer downloads the old film-two frame sequence.
The exterior construction sequence continues to use its original frame renderer.
