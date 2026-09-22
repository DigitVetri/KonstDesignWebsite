/**
 * The six projects, in the fixed order 01–06 (master prompt §32).
 *
 * All copy — titles, locations, years, areas, both description paragraphs,
 * service tags and the detail rows — is transcribed verbatim from the brief.
 * Nothing is invented. `image` points at the optimised WebP produced by
 * `npm run projects` from the supplied ZIP.
 *
 * NOTE: the supplied ZIP contains only two distinct photographs, so several
 * slots reference the same file — that is the source data, used as mapped
 * rather than substituted, per the brief's "do not invent/replace images".
 */
export const PROJECTS = [
  {
    id: 'rathinapuri',
    number: '01',
    category: 'Architecture',
    title: 'Rathinapuri Residence',
    location: 'Coimbatore',
    year: '2025',
    area: '2,400 sq ft',
    image: '/assets/projects/rathinapuri.webp',
    description: [
      'The site is a standard 30x50 plot with neighbours hard against both long walls, which rules out side windows for most of the plan. Rather than fight that, the house is organised around a central light well that runs the full height of the building. Every habitable room opens onto it, so daylight and cross ventilation come from inside the plot instead of the boundary.',
      'The street face is deliberately quiet — a solid parapet, a recessed entry and a single deep opening — while the rear opens up completely to a small garden. Finishes stay restrained: exposed concrete lintels, plastered walls in a warm off-white, and teak only where a hand actually touches it.',
    ],
    blurb:
      'A three-bedroom family home on a tight urban plot, folded around a central light well so every room borrows daylight without borrowing the street.',
    services: ['Site planning', 'Elevation', 'Working drawings', 'Site supervision'],
    details: [
      { label: 'Typology', value: 'Private residence' },
      { label: 'Built area', value: '2,400 sq ft' },
      { label: 'Plot', value: '30 x 50 ft' },
      { label: 'Duration', value: '14 months' },
      { label: 'Status', value: 'Completed 2025' },
    ],
  },
  {
    id: 'courtyard',
    number: '02',
    category: 'Architecture',
    title: 'Courtyard House',
    location: 'Pollachi',
    year: '2024',
    area: '3,100 sq ft',
    image: '/assets/projects/courtyard.webp',
    description: [
      'The brief was a house for three generations under one roof, on a generous plot with mature trees worth keeping. The plan wraps a square courtyard, with the older couple on the ground floor and the younger family above, so the two households share the court without sharing a corridor.',
      'Passive cooling drove most of the decisions. The courtyard pulls hot air up and out, the verandah depth is set to shade the walls through the worst of the afternoon, and the roof carries an air gap over the slab. Through April the interior sits several degrees below the street.',
    ],
    blurb:
      'A home for three generations wrapped around a square courtyard that cools the house and keeps the two households together but apart.',
    services: ['Architecture', 'Landscape', 'Site supervision'],
    details: [
      { label: 'Typology', value: 'Multi-generational home' },
      { label: 'Built area', value: '3,100 sq ft' },
      { label: 'Courtyard', value: '18 x 18 ft' },
      { label: 'Duration', value: '18 months' },
      { label: 'Status', value: 'Completed 2024' },
    ],
  },
  {
    id: 'loft',
    number: '03',
    category: 'Interior Design',
    title: 'The Loft Living Room',
    location: 'Coimbatore',
    year: '2025',
    area: '850 sq ft',
    image: '/assets/projects/loft.webp',
    description: [
      'The original room had height but no anchor — seating pushed to the walls and a nine-foot blank above the television. We pulled the sofa off the wall onto a single long axis, and used a floating veneer unit to give the tall wall a horizontal line to sit against.',
      'Lighting does the rest. A cove washes the upper volume so the ceiling reads as a surface rather than a void, track spots pick out the art wall, and low table lamps take over in the evening. Three circuits, three completely different rooms.',
    ],
    blurb:
      'A double-height living room given an anchor — a long horizontal axis and three lighting circuits that make one volume read as three rooms.',
    services: ['Space planning', 'Joinery', 'Lighting', 'Furniture'],
    details: [
      { label: 'Typology', value: 'Living room fit-out' },
      { label: 'Area', value: '850 sq ft' },
      { label: 'Ceiling', value: '18 ft, double height' },
      { label: 'Duration', value: '5 months' },
      { label: 'Status', value: 'Completed 2025' },
    ],
  },
  {
    id: 'mak',
    number: '04',
    category: 'Interior Design',
    title: 'MAK Complex Interiors',
    location: 'Dindigul',
    year: '2024',
    area: '6,500 sq ft',
    image: '/assets/projects/mak.webp',
    description: [
      'Two floors of an existing complex had to keep working while they were rebuilt, so the fit-out was staged floor by floor over eleven weekends. The ground floor carries reception and client-facing rooms; the upper floor is open workspace with two enclosed cabins.',
      'Everything specified here had to survive commercial traffic. Vitrified floors, laminate on all touched surfaces, veneer reserved for the reception wall and the cabin doors. Signage and colour are the wayfinding: one accent runs the whole route from the door to the meeting room.',
    ],
    blurb:
      'A two-floor commercial fit-out staged over eleven weekends so the offices never stopped working while they were rebuilt.',
    services: ['Commercial fit-out', 'Furniture', 'Signage', 'Lighting'],
    details: [
      { label: 'Typology', value: 'Commercial office' },
      { label: 'Built area', value: '6,500 sq ft' },
      { label: 'Floors', value: 'Two' },
      { label: 'Duration', value: '7 months, phased' },
      { label: 'Status', value: 'Completed 2024' },
    ],
  },
  {
    id: 'saravanampatti',
    number: '05',
    category: '3D Visualization',
    title: 'Saravanampatti Villa',
    location: 'Coimbatore',
    year: '2023',
    area: '4,200 sq ft',
    image: '/assets/projects/saravanampatti.webp',
    description: [
      'The client had turned down two elevations on paper and could not picture the third. We modelled the whole villa from the working drawings and rendered it at three times of day, so the decision moved from reading a drawing to looking at the house.',
      'The set ran to fourteen stills and a short walkthrough: street elevation, entry court, living and dining, the stair, and the master suite. Two material choices changed as a direct result — the boundary cladding and the stair railing — both far cheaper to change in the model than on site.',
    ],
    blurb:
      'A villa modelled from the working drawings and rendered at three times of day, so the client could choose by looking rather than reading a plan.',
    services: ['3D modelling', 'Material study', 'Lighting study', 'Walkthrough'],
    details: [
      { label: 'Typology', value: 'Pre-construction visualization' },
      { label: 'Built area', value: '4,200 sq ft' },
      { label: 'Deliverables', value: '14 stills, 1 walkthrough' },
      { label: 'Duration', value: '6 weeks' },
      { label: 'Status', value: 'Delivered 2023' },
    ],
  },
  {
    id: 'peelamedu',
    number: '06',
    category: 'Interior Design',
    title: 'Peelamedu Apartment',
    location: 'Coimbatore',
    year: '2025',
    area: '1,150 sq ft',
    image: '/assets/projects/peelamedu.webp',
    description: [
      'Eleven hundred square feet for a family of four means nothing can be single-purpose. The dining bench lifts for storage, the corridor loses six inches to a full-height wardrobe run, and a blind stretch of passage becomes the pooja room behind folding shutters.',
      'The kitchen was the one place we spent properly: a full modular run with a tall unit, soft-close hardware and a countertop deep enough for two people to work at once. Everywhere else the money went into storage and light rather than finish.',
    ],
    blurb:
      'Eleven hundred square feet for a family of four, where the dining bench, the corridor and a blind passage are each made to do a second job.',
    services: ['Modular kitchen', 'Pooja room', 'Wardrobes', 'False ceiling'],
    details: [
      { label: 'Typology', value: 'Apartment fit-out' },
      { label: 'Carpet area', value: '1,150 sq ft' },
      { label: 'Configuration', value: '3 BHK' },
      { label: 'Duration', value: '4 months' },
      { label: 'Status', value: 'Completed 2025' },
    ],
  },
]
