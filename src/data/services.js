/**
 * The six services, in the exact order the brief fixes them.
 *
 * `ratio` is each supplied photograph's native width ÷ height — the gallery
 * sizes every panel to a common height and derives its width from this, so no
 * image is ever cropped to fit a frame. Descriptions are short and factual:
 * what the service is, in the studio's own register. Nothing here claims an
 * award, a statistic, or a client — konstdesign.in lists none.
 */
export const SERVICES = [
  {
    id: 'bedroom',
    number: '01',
    title: 'Bedroom Interior',
    image: '/assets/services/bedroom.webp',
    ratio: 1.502,
    blurb: 'Restful, considered bedrooms — layered lighting, warm materials and integrated wardrobes that make the most of the room without crowding it.',
  },
  {
    id: 'ceiling',
    number: '02',
    title: 'Ceiling Design',
    image: '/assets/services/ceiling.webp',
    ratio: 1.502,
    blurb: 'False ceilings and cove detailing designed as architecture in their own right, holding recessed and indirect light to shape the whole room.',
  },
  {
    id: 'pooja',
    number: '03',
    title: 'Pooja Room',
    image: '/assets/services/pooja.webp',
    ratio: 1.778,
    blurb: 'Quiet, dignified prayer spaces — traditional detailing and craft, resolved cleanly into the modern home with the right materials and light.',
  },
  {
    id: 'tv-unit',
    number: '04',
    title: 'TV Unit',
    image: '/assets/services/tv-unit.webp',
    ratio: 1.778,
    blurb: 'Feature media walls and TV units that anchor the living room — storage, panelling and finishes composed as one integrated surface.',
  },
  {
    id: 'visiting-room',
    number: '05',
    title: 'Visiting Room',
    image: '/assets/services/visiting-room.webp',
    ratio: 1.778,
    blurb: 'Living and visiting rooms arranged for how a home actually receives people — seating, surfaces and finishes that are warm and unmistakably premium.',
  },
  {
    id: 'kitchen',
    number: '06',
    title: 'Modular Kitchen',
    image: '/assets/services/kitchen.webp',
    ratio: 1.778,
    blurb: 'Complete modular kitchens — ergonomic layouts, durable finishes and full storage, built and installed as part of the residential interior works.',
  },
]
