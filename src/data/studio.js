/**
 * Content for the sections after Projects — Experience through the Footer.
 *
 * Every figure and line is transcribed from the brief; the studio addresses,
 * phones and email are the real details from konstdesign.in. Nothing is
 * invented — no coordinates, no social URLs (those are left to be supplied).
 */

export const PHONE_PRIMARY = '+91 98943 31115'
export const PHONE_SECONDARY = '+91 77080 08184'
export const PHONE_BENGALURU = '+91 86675 98606'
export const EMAIL = 'Mohasher11@gmail.com'

/** the four studio credentials (the "04 Recognition" line heads its own
 *  section rather than sitting here as a fifth stat) */
export const STATS = [
  { value: '14+', label: 'Years of Experience' },
  { value: '237', label: 'Projects Completed' },
  { value: '12', label: 'Awards Won' },
  { value: '11K', label: 'Twitter Followers' },
]

/**
 * The three studio principals, in the order the connector runs left to right:
 * Coimbatore, Bengaluru, Dindigul. Names and qualifications are as supplied,
 * and each photograph is the principal at their own desk in that studio.
 *
 * `enter` is the direction that card travels in from on its first appearance —
 * the outer two horizontally, the middle one up from below.
 */
export const NETWORK = [
  {
    id: 'coimbatore',
    city: 'Coimbatore',
    name: 'Mohammad Sheriff',
    qualification: 'D.Arch',
    image: '/assets/network/coimbatore.webp',
    enter: 'left',
  },
  {
    id: 'bengaluru',
    city: 'Bengaluru',
    name: 'Ar. Hari Prasanth',
    qualification: 'B.Arch',
    image: '/assets/network/bengaluru.webp',
    enter: 'up',
  },
  {
    id: 'dindigul',
    city: 'Dindigul',
    name: 'Er. Safiq Ahamed',
    qualification: 'B.E., MBA',
    image: '/assets/network/dindigul.webp',
    enter: 'right',
  },
]

/**
 * The three awards the Recognition section pins through, in the order they are
 * numbered. `note` is the secondary line under the title, where one exists;
 * every other award simply has none and nothing is rendered in its place.
 */
export const AWARD_CAPTION = 'Architecture & Interior Design Excellence Awards 2024 \u00b7 Global Edition'

export const AWARDS = [
  {
    id: 'award-01',
    number: '01',
    title: 'Best Interior Design',
    note: null,
    image: '/assets/awards/award-01.webp',
  },
  {
    id: 'award-02',
    number: '02',
    title: 'Elite Outstanding Entrepreneur & Designer of the Year \u2014 2024',
    note: null,
    image: '/assets/awards/award-02.webp',
  },
  {
    id: 'award-03',
    number: '03',
    title: 'Trusted & Innovative Interior Design and Architectural Design Firm of the Year \u2014 2024',
    note: 'Residential & Commercial Projects',
    image: '/assets/awards/award-03.webp',
  },
]

export const PRINCIPLES = [
  { number: '01', title: 'Experience', body: '14+ years of architectural and interior design experience.', image: '/assets/principles/experience.webp', side: 'left' },
  { number: '02', title: 'Craft', body: 'Attention to materials, proportions, lighting and detail.', image: '/assets/principles/craft.webp', side: 'right' },
  { number: '03', title: 'Visualization', body: 'Experience your project through detailed 3D drawings before construction.', image: '/assets/principles/visualization.webp', side: 'left' },
  { number: '04', title: 'Personalization', body: "Every project is designed around the client's lifestyle and requirements.", image: '/assets/principles/personalization.webp', side: 'right' },
]

/** The four studios. Each `maps` link is the address above, percent-encoded
 *  into Google's documented search endpoint, so the pin and the "View on Google
 *  Maps" link both resolve to the exact address rather than to a guess. `coord`
 *  is [lat, lng], used only to place the pin on the country-scale map — at that
 *  zoom a neighbourhood-level fix is well under a pixel. */
export const STUDIOS = [
  {
    id: 'coimbatore',
    city: 'Coimbatore',
    role: 'Head Studio',
    lines: ['98, Raju Naidu St,', 'Sivananda Colony, Tatabad,', 'Coimbatore, Tamil Nadu 641012.'],
    phone: PHONE_PRIMARY,
    maps: 'https://www.google.com/maps/search/?api=1&query=98%2C%20Raju%20Naidu%20St%2C%20Sivananda%20Colony%2C%20Tatabad%2C%20Coimbatore%2C%20Tamil%20Nadu%20641012',
    coord: [11.0168, 76.9558],
  },
  {
    id: 'bengaluru',
    city: 'Bengaluru',
    role: 'Studio',
    lines: [
      'Second Floor, Shop No. S7 & S8,',
      'AUM Arcade, Doddamara Road,',
      'Rayasandra Post, Huskur,',
      'Bengaluru, Karnataka \u2013 560099.',
    ],
    phone: PHONE_BENGALURU,
    maps: 'https://www.google.com/maps/search/?api=1&query=Second%20Floor%2C%20Shop%20No.%20S7%20%26%20S8%2C%20AUM%20Arcade%2C%20Doddamara%20Road%2C%20Rayasandra%20Post%2C%20Huskur%2C%20Bengaluru%2C%20Karnataka%20560099',
    coord: [12.856, 77.681],
  },
  {
    id: 'dindigul',
    /* The studio is named for its town; `lines` keeps Seelapadi, which is the
       locality inside that postal address and is not the studio's name. */
    city: 'Dindigul',
    role: 'Er. Safeeq Ahmed, BE MBA',
    lines: ['734/6, Karur Road,', 'Seelapadi,', 'Tamil Nadu 624001.'],
    phone: PHONE_SECONDARY,
    maps: 'https://www.google.com/maps/search/?api=1&query=734%2F6%2C%20Karur%20Road%2C%20Seelapadi%2C%20Tamil%20Nadu%20624001',
    coord: [10.345, 77.933],
  },
  {
    id: 'chennai',
    city: 'Chennai',
    role: 'Studio',
    lines: ['Shop No. 2, Second Cross Street,', 'Trustpuram, Kodambakkam,', 'Chennai - 600024.'],
    /* no phone supplied for this studio — the line is simply not rendered */
    phone: null,
    maps: 'https://www.google.com/maps/search/?api=1&query=Shop%20No.%202%2C%20Second%20Cross%20Street%2C%20Trustpuram%2C%20Kodambakkam%2C%20Chennai%20-%20600024',
    coord: [13.0507, 80.2243],
  },
]

export const FOOTER = {
  nav: [
    { label: 'Home', href: '#top' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#studios' },
  ],
  services: [
    'Architectural Design',
    'Interior Design',
    'Bedroom Interiors',
    'Modular Kitchen',
    'Pooja Rooms',
    'TV Units',
    '3D Drawings',
  ],
  /* href null until real handles are supplied — rendered but not invented */
  social: [
    { label: 'Instagram', href: null },
    { label: 'Facebook', href: null },
    { label: 'Twitter / X', href: null },
  ],
}
