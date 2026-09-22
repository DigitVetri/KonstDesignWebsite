/**
 * Poly Haven CC0 asset manifest.
 *
 * Every asset here is public domain (CC0) — https://polyhaven.com/license
 * `npm run assets` downloads + optimises them into public/assets/.
 *
 * Adding a Design 04 means adding slugs here and an entry in src/data/designs.js.
 * The animation system never needs to change.
 */

/** key -> polyhaven model slug. Downloaded as glTF 1k, optimised to .glb */
export const MODELS = {
  // --- Design 01 · Modern Warmth -------------------------------------------
  sofa_chesterfield: 'sofa_02',
  lounge_chair: 'mid_century_lounge_chair',
  table_slab: 'modern_coffee_table_01',
  cabinet_premium: 'vintage_cabinet_01',
  ottoman: 'Ottoman_01',
  plant_tree: 'potted_plant_01',
  pillows: 'throw_pillows_01',
  vase_bottle: 'ceramic_vase_01',
  bowl_wood: 'wooden_bowl_01',
  books_row: 'book_encyclopedia_set_01',
  table_industrial: 'industrial_coffee_table',
  frame_hanging: 'hanging_picture_frame_01',

  // --- Design 02 · Contemporary Minimal ------------------------------------
  sofa_daybed: 'chinese_sofa',
  chair_modern: 'modern_arm_chair_01',
  table_marble_round: 'coffee_table_round_01',
  side_table_tall: 'side_table_tall_01',
  credenza_modern: 'chinese_commode',
  side_table_low: 'side_table_01',
  plant_leafy: 'potted_plant_02',
  plant_succulent: 'potted_plant_04',
  bust_marble: 'marble_bust_01',
  pendant_cone: 'modern_ceiling_lamp_01',
  vase_cylinder: 'ceramic_vase_03',
  desk_office: 'metal_office_desk',
  desk_chair: 'dining_chair_02',
  desk_lamp: 'desk_lamp_arm_01',
  stationery: 'stationery_supplies',
  notebook: 'binder_notebook',

  // --- Design 03 · Luxury Neutral ------------------------------------------
  sofa_classic: 'sofa_03',
  armchair_wing: 'ArmChair_01',
  table_lattice: 'modern_coffee_table_02',
  sideboard_brass: 'modern_wooden_cabinet',
  mirror_ornate: 'ornate_mirror_01',
  chandelier: 'Chandelier_01',
  vase_brass_a: 'brass_vase_01',
  vase_brass_b: 'brass_vase_03',
  candleholders: 'brass_candleholders',
  tea_set: 'tea_set_01',
  frame_fancy: 'fancy_picture_frame_01',
  console_walnut: 'chinese_console_table',
  bowl_amber: 'wooden_bowl_02',
  vase_ivory: 'ceramic_vase_02',
  frame_standing: 'standing_picture_frame_02',
  clock_mantel: 'mantel_clock_01',
}

/**
 * key -> { slug, maps }. Maps we pull: diff (albedo), nor_gl (normal),
 * arm (AO/Roughness/Metalness packed into R/G/B — one file, three channels).
 */
export const TEXTURES = {
  // base shell (empty room)
  floor_base: { slug: 'laminate_floor_02' },
  wall_base: { slug: 'beige_wall_001' },
  ceiling_base: { slug: 'plastered_wall' },
  // design finishes
  floor_oak: { slug: 'oak_wood_planks' },
  floor_concrete: { slug: 'large_floor_tiles_02' },
  floor_herringbone: { slug: 'herringbone_parquet' },
  wall_limewash: { slug: 'plastered_wall' },
  wall_coolplaster: { slug: 'plastered_wall_04' },
  wall_taupe: { slug: 'painted_plaster_wall' },
  wood_dark: { slug: 'dark_wood' },
  rug_wool: { slug: 'poly_wool_herringbone' },
}

/**
 * key -> polyhaven hdri slug. LIGHTING ONLY.
 *
 * Deliberately separate from the window view below: an enclosed, leafy HDRI
 * would wash the whole interior green, so the room keeps its warm late-
 * afternoon light and the garden is supplied as a photograph instead.
 */
export const HDRIS = {
  golden: 'belfast_sunset',
}

/**
 * The view through the glass — `npm run backdrop` crops this slug's
 * full-resolution tonemapped JPG down to the slice the window frames.
 */
export const BACKDROP = {
  slug: 'suburban_garden',
  yaw: 0.5,
  pitch: 0.46,
  fov: 0.2,
}
