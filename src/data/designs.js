/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DESIGN DATA
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every design is a flat list of `elements`. An element is one independently
 *  animatable node in the scene — its own opacity, its own scale, its own
 *  offset, its own place in the stagger. Nothing here is a picture of a room;
 *  there is no "before" or "after" image to cross-fade between.
 *
 *  element = {
 *    id        unique, stable
 *    category  'architecture' | 'materials' | 'furniture' | 'decor'
 *              → drives the stagger order (architecture first, decor last)
 *    motion    'grow' | 'rise' | 'surface' | 'drop'   (see motion/profiles.js)
 *    kind      'model' | 'finish' | 'rug' | 'beams' | 'coffers' | 'cove' | 'panel'
 *    …kind-specific placement
 *  }
 *
 *  Adding Design 04 = adding slugs to scripts/assets.manifest.mjs and one more
 *  object to this array. The transition engine needs no changes.
 */

const D = (deg) => (deg * Math.PI) / 180

/* ═══════════════════════════════════════════ 01 · MODERN WARMTH ═══════════ */
/*  Asymmetric and relaxed. Everything is pulled to the left and angled in
    toward the window; oak underfoot, beams overhead, cognac leather.        */

const modernWarmth = {
  id: 'design-01',
  label: 'DESIGN 01',
  title: 'Modern Warmth',
  line: 'Limewash, oak and exposed beams — a room that holds the late light.',
  palette: {
    walls: '#e6d9c6',
    floor: '#b07f4d',
    textiles: '#9d5230',
    accent: '#c3a06a',
    swatch: ['#e6d9c6', '#b07f4d', '#9d5230', '#5c4a38'],
  },
  grade: { exposure: 1.06, warmth: 1.06 },
  elements: [
    /* — architecture ————————————————————————————————————————————— */
    {
      id: 'd1-beams', kind: 'beams', category: 'architecture', motion: 'drop',
      texture: 'wood_dark', color: '#7d5f3f', count: 6, width: 0.18, depth: 0.18,
      from: -4.6, to: -0.5, roughness: 0.8,
    },
    {
      id: 'd1-drape-l', kind: 'panel', category: 'architecture', motion: 'rise',
      color: '#ded0b8', roughness: 0.96, size: [0.66, 2.66],
      position: [-2.62, 1.44, -4.9], rotation: [0, 0, 0],
    },
    {
      id: 'd1-drape-r', kind: 'panel', category: 'architecture', motion: 'rise',
      color: '#ded0b8', roughness: 0.96, size: [0.66, 2.66],
      position: [2.78, 1.44, -4.9], rotation: [0, 0, 0],
    },

    /* — materials ——————————————————————————————————————————————— */
    {
      id: 'd1-floor', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'floor', texture: 'floor_oak', repeat: [3.6, 4.4],
      color: '#c9954f', roughness: 0.5,
    },
    {
      id: 'd1-walls', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'walls', texture: 'wall_limewash', repeat: [3, 1.6],
      color: '#e9d9bd', roughness: 0.96,
    },
    {
      id: 'd1-ceiling', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'ceiling', texture: 'wall_limewash', repeat: [3, 3],
      color: '#f0e5d2', roughness: 0.96,
    },
    {
      id: 'd1-rug', kind: 'rug', category: 'materials', motion: 'surface',
      texture: 'rug_wool', size: [3.8, 2.9], position: [-0.5, -2.2],
      rotation: D(2), color: '#b58c62', repeat: [3.2, 2.4],
    },

    /* — furniture ———————————————————————————————————————————————— */
    {
      id: 'd1-sofa', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'sofa_chesterfield', height: 0.84, position: [-1.95, 0, -2.7], rotation: D(62),
      recolor: '#96603c', roughness: 0.45, recolorContrast: 1.45,
    },
    {
      id: 'd1-lounge', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'lounge_chair', height: 0.9, position: [1.62, 0, -1.4], rotation: D(-134),
    },
    {
      id: 'd1-table', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'table_lattice', height: 0.41, position: [-0.35, 0, -2.15], rotation: D(6),
      recolor: '#4c3826', recolorContrast: 1.3, roughness: 0.32, metalness: 0.3,
    },
    {
      id: 'd1-ottoman', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'ottoman', height: 0.4, position: [0.95, 0, -3.15], rotation: D(-24),
      recolor: '#6d452b', roughness: 0.5, recolorContrast: 1.35,
    },
    {
      /* Built in against the left wall — carcass depth 0.36 puts its back
         flush with the plaster at x = -3.5, so it reads as joinery that was
         always part of the room rather than a bookcase pushed up to it. */
      id: 'd1-library', kind: 'joinery', category: 'furniture', motion: 'rise',
      length: 2.3, height: 2.35, depth: 0.42, bays: 3, shelves: 4,
      position: [-3.29, 0, -3.72], rotation: D(90),
      texture: 'wood_dark', repeat: [3, 2], color: '#6d4b30', back: '#493123',
      roughness: 0.4, metalness: 0.05,
    },
    {
      id: 'd1-cupboard', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'cabinet_premium', height: 1.98, position: [3.04, 0, -3.65], rotation: D(-90),
      recolor: '#5d3a22', recolorMatch: '_(a|b)$', recolorContrast: 1.25,
      roughness: 0.24, metalness: 0.06,
    },

    /* — decor ———————————————————————————————————————————————————— */
    {
      id: 'd1-books-0573-0', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 0.573, -4.55], rotation: D(90),
    },
    {
      id: 'd1-books-0573-1', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 0.573, -3.85], rotation: D(90),
    },
    {
      id: 'd1-books-0573-2', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 0.573, -3.05], rotation: D(90),
    },
    {
      id: 'd1-books-1013-0', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.013, -4.6], rotation: D(90),
    },
    {
      id: 'd1-books-1013-1', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.013, -3.6], rotation: D(90),
    },
    {
      id: 'd1-books-1452-0', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.452, -4.5], rotation: D(90),
    },
    {
      id: 'd1-books-1452-1', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.452, -3.3], rotation: D(90),
    },
    {
      id: 'd1-books-1892-0', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.892, -4.3], rotation: D(90),
    },
    {
      id: 'd1-books-1892-1', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.28, position: [-3.26, 1.892, -3.5], rotation: D(90),
    },
    {
      id: 'd1-lib-clock', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'clock_mantel', height: 0.25, position: [-3.25, 1.892, -2.88], rotation: D(96),
    },
    {
      id: 'd1-lib-vase', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_ivory', height: 0.27, position: [-3.25, 1.013, -2.92], rotation: 0,
    },
    {
      id: 'd1-lib-bowl', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'bowl_amber', height: 0.13, position: [-3.25, 1.452, -2.8], rotation: D(70),
    },
    {
      id: 'd1-lib-frame', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_standing', height: 0.24, position: [-3.25, 0.573, -2.74], rotation: D(104),
    },
    {
      id: 'd1-plant', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'plant_tree', height: 1.28, position: [2.4, 0, -4.55], rotation: D(24),
    },
    {
      id: 'd1-pillows', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'pillows', height: 0.36, position: [-1.8, 0.48, -2.95], rotation: D(62),
    },
    {
      id: 'd1-vase', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_bottle', height: 0.3, position: [-0.08, 0.41, -2.26], rotation: 0,
    },
    {
      id: 'd1-bowl', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'bowl_wood', height: 0.15, position: [-0.6, 0.41, -2.08], rotation: D(-14),
    },
    {
      id: 'd1-frame-a', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_hanging', height: 0.66, position: [3.4, 1.92, -2.6], rotation: D(-90),
    },
    {
      id: 'd1-frame-b', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_hanging', height: 0.46, position: [3.4, 1.8, -1.75], rotation: D(-90),
    },
  ],
}

/* ═══════════════════════════════════════ 02 · CONTEMPORARY MINIMAL ════════ */
/*  Mirrored and pushed to the perimeter, with a wide empty centre. Cool
    plaster, large-format stone underfoot, one cone of light overhead.       */

const contemporaryMinimal = {
  id: 'design-02',
  label: 'DESIGN 02',
  title: 'Contemporary Minimal',
  line: 'Cool plaster, a single slot of light, and a great deal of nothing.',
  palette: {
    walls: '#edecea',
    floor: '#9b9b97',
    textiles: '#7f8480',
    accent: '#3c3f3d',
    swatch: ['#edecea', '#9b9b97', '#7f8480', '#3c3f3d'],
  },
  grade: { exposure: 1.0, warmth: 0.78 },
  elements: [
    /* — architecture ————————————————————————————————————————————— */
    {
      id: 'd2-cove', kind: 'cove', category: 'architecture', motion: 'surface',
      color: '#fff2dd', width: 0.15, from: -4.7, to: -0.4, x: 0, intensity: 2.4,
    },
    {
      id: 'd2-pendant', kind: 'model', category: 'architecture', motion: 'drop',
      asset: 'pendant_cone', height: 0.62, position: [0.1, 0, -2.3], rotation: 0,
      anchor: 'ceiling', drop: 0.62,
      emitLight: { color: '#ffe3b8', intensity: 14, distance: 7, position: [0, -0.42, 0] },
    },

    /* — materials ——————————————————————————————————————————————— */
    {
      id: 'd2-floor', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'floor', texture: 'floor_concrete', repeat: [2.4, 2.9],
      color: '#bdbcb7', roughness: 0.3, metalness: 0.05,
    },
    {
      id: 'd2-walls', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'walls', texture: 'wall_coolplaster', repeat: [2.6, 1.4],
      color: '#eeeeeb', roughness: 0.92,
    },
    {
      id: 'd2-ceiling', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'ceiling', texture: 'wall_coolplaster', repeat: [2.6, 2.6],
      color: '#f7f6f3', roughness: 0.94,
    },

    {
      id: 'd2-rug', kind: 'rug', category: 'materials', motion: 'surface',
      texture: 'rug_wool', size: [3.7, 2.9], position: [0.1, -2.45], rotation: 0,
      color: '#cbc8c1', repeat: [3.1, 2.4], roughness: 0.96,
    },

    /* — furniture ———————————————————————————————————————————————— */
    {
      /* squared off against d2-chair-b, with d2-table held on the centre line
         between the two of them */
      id: 'd2-chair', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'chair_modern', height: 0.8, position: [-1.15, 0, -2.35], rotation: D(86),
    },
    {
      id: 'd2-table', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'table_marble_round', height: 0.4, position: [0.1, 0, -2.35], rotation: 0,
    },
    {
      id: 'd2-credenza', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'credenza_modern', height: 0.74, position: [-3.11, 0, -2.55], rotation: D(90),
      recolor: '#2c2e31', recolorContrast: 1.3, roughness: 0.28, metalness: 0.18,
    },
    {
      id: 'd2-tv', kind: 'tv', category: 'furniture', motion: 'rise',
      size: [1.66, 0.95], position: [-3.41, 1.62, -2.55], rotation: [0, D(90), 0],
    },
    {
      id: 'd2-chair-b', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'chair_modern', height: 0.8, position: [1.35, 0, -2.35], rotation: D(-86),
    },
    /* — the study, in the space the daybed used to hold —————————————— */
    {
      id: 'd2-desk', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'desk_office', height: 0.75, position: [2.4, 0, -4.5], rotation: 0,
      recolor: '#33363a', recolorContrast: 1.25, roughness: 0.34, metalness: 0.22,
    },
    {
      id: 'd2-desk-chair', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'desk_chair', height: 0.92, position: [2.72, 0, -3.86], rotation: D(196),
    },
    {
      id: 'd2-store', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'side_table_low', height: 0.52, position: [2.96, 0, -2.5], rotation: D(-90),
      recolor: '#3a3c3e', recolorContrast: 1.2, roughness: 0.34,
    },
    {
      id: 'd2-side-low', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'side_table_low', height: 0.52, position: [-2.42, 0, -1.05], rotation: D(14),
      recolor: '#3a3c3e', recolorContrast: 1.2, roughness: 0.34,
    },

    /* — decor ———————————————————————————————————————————————————— */
    {
      /* screen hinged toward the wall so it faces the chair, not the camera */
      id: 'd2-laptop', kind: 'laptop', category: 'decor', motion: 'grow',
      width: 0.34, tilt: 1.95, position: [2.02, 0.75, -4.5], rotation: D(8),
    },
    {
      id: 'd2-notebook', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'notebook', height: 0.055, position: [2.46, 0.75, -4.33], rotation: D(28),
    },
    {
      id: 'd2-stationery', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'stationery', height: 0.14, position: [3.0, 0.75, -4.42], rotation: 0,
    },
    {
      id: 'd2-desk-lamp', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'desk_lamp', height: 0.44, position: [3.02, 0.75, -4.76], rotation: D(24),
    },
    {
      id: 'd2-desk-books', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'books_row', height: 0.2, position: [1.72, 0.75, -4.74], rotation: 0,
    },
    {
      id: 'd2-succulent', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'plant_succulent', height: 0.34, position: [0.36, 0.4, -2.46], rotation: 0,
    },
    {
      id: 'd2-bust', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'bust_marble', height: 0.38, position: [2.96, 0.52, -2.5], rotation: D(-160),
    },
    {
      id: 'd2-vase', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_cylinder', height: 0.3, position: [-3.09, 0.74, -3.2], rotation: 0,
      recolor: '#d6d8d2', roughness: 0.35,
    },
    {
      id: 'd2-soundbar', kind: 'panel', category: 'decor', motion: 'surface',
      color: '#303236', roughness: 0.7, size: [1.2, 0.088],
      position: [-3.3, 0.83, -2.55], rotation: [0, D(90), 0], frame: '#1d1e20',
    },
    {
      id: 'd2-plant', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'plant_leafy', height: 0.96, position: [-2.48, 0, -4.58], rotation: D(24),
      recolor: '#4a4c4f', recolorMatch: '_pot$', recolorContrast: 1.2, roughness: 0.55,
    },
  ],
}

/* ═══════════════════════════════════════════ 03 · LUXURY NEUTRAL ═════════ */
/*  Held on the centre line: a pair of wing chairs facing each other across a
    centred table, a brass chandelier above, walnut herringbone below.       */

const luxuryNeutral = {
  id: 'design-03',
  label: 'DESIGN 03',
  title: 'Luxury Neutral',
  line: 'Coffered ceiling, walnut herringbone, brass — symmetry held at dusk.',
  palette: {
    walls: '#7d7263',
    floor: '#4a3524',
    textiles: '#e5dccc',
    accent: '#c9a253',
    swatch: ['#7d7263', '#4a3524', '#e5dccc', '#c9a253'],
  },
  grade: { exposure: 0.97, warmth: 1.16 },
  elements: [
    /* — architecture ————————————————————————————————————————————— */
    {
      id: 'd3-coffers', kind: 'coffers', category: 'architecture', motion: 'drop',
      cols: 3, rows: 3, from: -4.6, to: -0.4, color: '#eae2d2', trim: '#d3c4a7',
      beam: 0.16, depth: 0.17, roughness: 0.8,
    },
    {
      id: 'd3-chandelier', kind: 'model', category: 'architecture', motion: 'drop',
      asset: 'chandelier', height: 0.86, position: [0, 0, -2.3], rotation: 0,
      anchor: 'ceiling', drop: 0.5,
      emitLight: { color: '#ffd9a0', intensity: 16, distance: 8, position: [0, -0.3, 0] },
    },
    {
      id: 'd3-drape-l', kind: 'panel', category: 'architecture', motion: 'rise',
      color: '#c8bba1', roughness: 0.94, size: [0.82, 2.78],
      position: [-2.9, 1.42, -4.9], rotation: [0, 0, 0],
    },
    {
      id: 'd3-drape-r', kind: 'panel', category: 'architecture', motion: 'rise',
      color: '#c8bba1', roughness: 0.94, size: [0.82, 2.78],
      position: [2.9, 1.42, -4.9], rotation: [0, 0, 0],
    },

    /* — materials ——————————————————————————————————————————————— */
    {
      id: 'd3-floor', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'floor', texture: 'floor_herringbone', repeat: [2.4, 3.0],
      color: '#7a5233', roughness: 0.32, metalness: 0.02,
    },
    {
      id: 'd3-walls', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'walls', texture: 'wall_taupe', repeat: [2.4, 1.3],
      color: '#8d8272', roughness: 0.9,
    },
    {
      id: 'd3-ceiling', kind: 'finish', category: 'materials', motion: 'surface',
      surface: 'ceiling', texture: 'wall_taupe', repeat: [2.4, 2.4],
      color: '#f1e9da', roughness: 0.9,
    },
    {
      id: 'd3-rug', kind: 'rug', category: 'materials', motion: 'surface',
      texture: 'rug_wool', size: [4.8, 3.6], position: [0, -2.5], rotation: 0,
      color: '#efe3c9', repeat: [5.2, 3.8], roughness: 0.98,
    },

    /* — furniture ———————————————————————————————————————————————— */
    {
      id: 'd3-sofa', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'sofa_classic', height: 0.84, position: [0, 0, -3.95], rotation: 0,
      recolor: '#ded2b7', roughness: 0.88, recolorContrast: 1.5,
    },
    {
      id: 'd3-chair-l', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'armchair_wing', height: 0.98, position: [-1.98, 0, -2.05], rotation: D(80),
      recolor: '#c9b58e', roughness: 0.84, recolorContrast: 1.4,
    },
    {
      id: 'd3-chair-r', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'armchair_wing', height: 0.98, position: [1.98, 0, -2.05], rotation: D(-80),
      recolor: '#c9b58e', roughness: 0.84, recolorContrast: 1.4,
    },
    {
      id: 'd3-table', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'table_lattice', height: 0.42, position: [0, 0, -2.15], rotation: 0,
      recolor: '#9b7c50', recolorContrast: 1.55, roughness: 0.38, metalness: 0.2,
    },
    {
      id: 'd3-sideboard', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'sideboard_brass', height: 0.88, position: [-3.05, 0, -3.7], rotation: D(90),
    },
    {
      /* sits directly under d3-frame-a, so the wall reads as one composition */
      id: 'd3-console', kind: 'model', category: 'furniture', motion: 'rise',
      asset: 'console_walnut', height: 0.82, position: [3.04, 0, -3.4], rotation: D(-90),
    },
    {
      id: 'd3-ottoman', kind: 'model', category: 'furniture', motion: 'grow',
      asset: 'ottoman', height: 0.4, position: [-1.08, 0, -3.3], rotation: D(16),
      recolor: '#cdbc9c', recolorContrast: 1.35, roughness: 0.8,
    },

    /* — decor ———————————————————————————————————————————————————— */
    {
      id: 'd3-clock', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'clock_mantel', height: 0.26, position: [3.02, 0.82, -3.76], rotation: D(-96),
    },
    {
      id: 'd3-vase-ivory', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_ivory', height: 0.3, position: [3.02, 0.82, -3.04], rotation: 0,
    },
    {
      id: 'd3-bowl', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'bowl_amber', height: 0.14, position: [0.02, 0.42, -2.34], rotation: D(38),
    },
    {
      id: 'd3-frame-standing', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_standing', height: 0.26, position: [-3.02, 0.88, -3.7], rotation: D(84),
    },
    {
      id: 'd3-plant', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'plant_tree', height: 1.34, position: [2.52, 0, -4.58], rotation: D(-18),
    },
    {
      id: 'd3-mirror', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'mirror_ornate', height: 1.08, position: [-3.4, 1.82, -3.7], rotation: D(90),
    },
    {
      id: 'd3-vase-a', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_brass_a', height: 0.32, position: [-3.02, 0.88, -4.05], rotation: 0,
    },
    {
      id: 'd3-vase-b', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'vase_brass_b', height: 0.24, position: [-3.02, 0.88, -3.35], rotation: 0,
    },
    {
      id: 'd3-candles', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'candleholders', height: 0.3, position: [0.34, 0.42, -2.15], rotation: D(20),
    },
    {
      id: 'd3-tea', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'tea_set', height: 0.17, position: [-0.3, 0.42, -2.1], rotation: D(-24),
    },
    {
      id: 'd3-frame-a', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_fancy', height: 0.8, position: [3.4, 1.84, -3.4], rotation: D(-90),
    },
    {
      id: 'd3-frame-b', kind: 'model', category: 'decor', motion: 'grow',
      asset: 'frame_fancy', height: 0.58, position: [3.4, 1.78, -2.2], rotation: D(-90),
    },
  ],
}

export const DESIGNS = [modernWarmth, contemporaryMinimal, luxuryNeutral]

/** The bare shell everything is staged into. Always present, never animated out. */
export const EMPTY_ROOM = {
  id: 'empty',
  label: 'EMPTY',
  title: 'The Room',
  line: 'Seven metres, north light, nothing in it yet.',
  palette: { swatch: ['#cfc6b8', '#a49786', '#6f665b', '#3a352f'] },
  grade: { exposure: 1.0, warmth: 0.95 },
  elements: [],
}

export const STATES = [EMPTY_ROOM, ...DESIGNS]

/** index into STATES  ( -1 is never used; empty room is index 0 ) */
export const EMPTY_INDEX = 0
export const FIRST_DESIGN_INDEX = 1
export const LAST_INDEX = STATES.length - 1
