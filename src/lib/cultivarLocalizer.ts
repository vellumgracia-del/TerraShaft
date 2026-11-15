import cropSpeciesRaw from '@/data/crop_species.json';
import cultivarsRegistryRaw from '@/data/cultivars_registry.json';
import { Crop } from '@/types/agronomy';
import {
  AgroecologicalProfile,
  CropSpeciesEntity,
  CultivarEntity,
  ResolvedCultivarRecommendation,
} from '@/types/cultivar';

export const CROP_SPECIES_LIBRARY: CropSpeciesEntity[] = cropSpeciesRaw as CropSpeciesEntity[];
export const CULTIVAR_REGISTRY: CultivarEntity[] = cultivarsRegistryRaw as CultivarEntity[];

function matchesTexture(soilTexture: string, preferredTextures: string[]): boolean {
  const lower = soilTexture.toLowerCase();
  return preferredTextures.some(pref => lower.includes(pref.toLowerCase()));
}

function buildArchetypeFallbackCultivar(
  species: CropSpeciesEntity,
  aez: AgroecologicalProfile
): CultivarEntity {
  return {
    cultivar_id: `archetype_${species.species_id}`,
    species_id: species.species_id,
    crop_type: species.crop_type,
    cultivar_name: species.archetype_label_en,
    local_common_name: species.common_name_en,
    local_common_name_id: species.common_name_id,
    scientific_name: species.scientific_name,
    breeding_program: 'Species Phenotype Baseline (FAO-56 / Global Agronomy)',
    maturity_group: species.maturity_group_default,
    growth_duration_days: species.growth_duration_days,
    drought_tolerance: species.drought_tolerance,
    heat_tolerance: species.heat_tolerance,
    flood_tolerance: species.flood_tolerance,
    salinity_tolerance: species.salinity_tolerance,
    soil_requirements: species.soil_requirements,
    photoperiod_sensitivity: species.photoperiod_sensitivity,
    temperature_range_c: species.temperature_range_c,
    rainfall_requirement_mm: species.rainfall_requirement_mm,
    water_requirement_mm: species.water_requirement_mm,
    root_depth_cm: species.root_depth_cm,
    disease_pest_resistance: species.disease_pest_resistance,
    nitrogen_requirement_kg_ha: species.nitrogen_requirement_kg_ha,
    nitrogen_fixation_kg_ha: species.nitrogen_fixation_kg_ha,
    market_use: species.market_use,
    country_or_region_of_release: [],
    allowed_agroecological_zones: [aez.agroecological_zone],
    registration_status: 'Phenotype Archetype (Unverified Local Registry)',
    evidence_source:
      'FAO-56 Crop Evapotranspiration & Global Phenotype Baseline — Verify National Seed Registry',
    evidence_date: 'Baseline Reference',
    availability_status: 'Archetype Fallback — Verify Local Seed Registry',
    confidence_score: 0.48,
    agronomic_notes_en: `${species.species_notes_en} No verified cultivar is registered in the local TerraShaft catalog for ${aez.country} (${aez.agroecological_zone}). Consult local agricultural extension or national seed catalogs before purchasing seed.`,
    agronomic_notes_id: `${species.species_notes_id} Belum ada kultivar terverifikasi di registri lokal TerraShaft untuk wilayah ${aez.country} (${aez.agroecological_zone}). Verifikasi katalog benih resmi atau PPL setempat sebelum memilih varietas.`,
  };
}

/**
 * Resolves a regionally verified cultivar ONLY after matching the location's country/macro-region
 * and agroecological conditions. Never injects Indonesian or foreign varieties into unverified countries.
 */
export function resolveCultivarForSpecies(
  species: CropSpeciesEntity,
  aez: AgroecologicalProfile
): ResolvedCultivarRecommendation {
  // Step 1: Strict geopolitical / release-territory gate (never global by default)
  const regionCandidates = CULTIVAR_REGISTRY.filter(c => {
    if (c.species_id !== species.species_id) return false;
    const countryMatch =
      aez.country_code !== 'GLOBAL' && c.country_or_region_of_release.includes(aez.country_code);
    const macroMatch =
      aez.macro_region !== 'GLOBAL_UNMAPPED' &&
      c.country_or_region_of_release.includes(aez.macro_region);
    return countryMatch || macroMatch;
  });

  // Step 2: Agroecological zone + climate envelope gate
  const climateEligible = regionCandidates.filter(c => {
    const aezMatches = c.allowed_agroecological_zones.includes(aez.agroecological_zone);
    const meanTemp = aez.temperature_range_c.annual_mean_c;
    const tempInBounds =
      meanTemp >= c.temperature_range_c.min_c - 3 &&
      meanTemp <= c.temperature_range_c.max_c + 3;
    return aezMatches && tempInBounds;
  });

  if (climateEligible.length === 0) {
    const fallbackCultivar = buildArchetypeFallbackCultivar(species, aez);
    const hasRegionButAezMismatch = regionCandidates.length > 0;

    const fallbackReason = hasRegionButAezMismatch
      ? `Regional cultivars exist for ${aez.country_code}, but none match the ${aez.agroecological_zone} zone (${aez.temperature_range_c.annual_mean_c}°C mean temp). Falling back to species phenotype archetype.`
      : `No verified cultivar release record in the local registry for ${species.common_name_en} in ${aez.country} (${aez.country_code}/${aez.macro_region}). Falling back safely to species phenotype archetype.`;

    const phWithinRange =
      aez.soil_ph >= species.soil_requirements.ph_min &&
      aez.soil_ph <= species.soil_requirements.ph_max;

    const reasonsEn = [
      `Species match: ${species.scientific_name} evaluated for ${aez.agroecological_zone} (${aez.annual_rainfall_mm} mm/yr).`,
      phWithinRange
        ? `Soil pH ${aez.soil_ph.toFixed(1)} sits within species tolerance (${species.soil_requirements.ph_min}-${species.soil_requirements.ph_max}).`
        : `Soil pH ${aez.soil_ph.toFixed(1)} is outside optimal range (${species.soil_requirements.ph_min}-${species.soil_requirements.ph_max}); lime or acid-tolerant local varieties recommended.`,
      `Photoperiod regime: ${aez.photoperiod_class} (${aez.hemisphere} Hemisphere, ${aez.elevation_band}).`,
    ];

    const reasonsId = [
      `Kesesuaian spesies: ${species.scientific_name} dievaluasi pada zona ${aez.agroecological_zone} (${aez.annual_rainfall_mm} mm/thn).`,
      phWithinRange
        ? `pH tanah ${aez.soil_ph.toFixed(1)} berada dalam rentang toleransi spesies (${species.soil_requirements.ph_min}-${species.soil_requirements.ph_max}).`
        : `pH tanah ${aez.soil_ph.toFixed(1)} di luar rentang optimal (${species.soil_requirements.ph_min}-${species.soil_requirements.ph_max}); perlu ameliorasi atau kultivar toleran lokal.`,
      `Fotoperiod: ${aez.photoperiod_class} (Belahan ${aez.hemisphere === 'Northern' ? 'Utara' : 'Selatan'}, ${aez.elevation_band}).`,
    ];

    return {
      species,
      cultivar: fallbackCultivar,
      is_archetype_fallback: true,
      fallback_reason: fallbackReason,
      suitability_reasons_en: reasonsEn,
      suitability_reasons_id: reasonsId,
      assumptions_en:
        'Using species-level FAO-56 Kc, rooting depth, and nutrient stoichiometry archetype. Local seed availability, maturity days, and yield potential must be confirmed with regional extension officers.',
      assumptions_id:
        'Menggunakan arketipe tingkat spesies (Kc FAO-56, kedalaman akar, dan kebutuhan hara). Ketersediaan benih resmi dan umur panen spesifik harus dikonfirmasi dengan penyuluh/katalog benih setempat.',
      confidence_score: phWithinRange ? 0.52 : 0.42,
    };
  }

  // Step 3: Score eligible regional cultivars by exact country match, soil pH/texture/AWC fit, and evidence confidence
  const scored = climateEligible
    .map(c => {
      let score = c.confidence_score * 50;
      const exactCountry = c.country_or_region_of_release.includes(aez.country_code);
      if (exactCountry) score += 25;

      const phOk =
        aez.soil_ph >= c.soil_requirements.ph_min &&
        aez.soil_ph <= c.soil_requirements.ph_max;
      const phMarginal =
        aez.soil_ph >= c.soil_requirements.ph_min - 0.5 &&
        aez.soil_ph <= c.soil_requirements.ph_max + 0.5;
      if (phOk) score += 12;
      else if (phMarginal) score += 5;
      else score -= 8;

      if (matchesTexture(aez.soil_texture, c.soil_requirements.preferred_textures)) {
        score += 8;
      }
      if (aez.soil_awc_mm >= c.soil_requirements.min_awc_mm) {
        score += 5;
      }
      return { cultivar: c, score, exactCountry, phOk };
    })
    .sort((a, b) => b.score - a.score);

  const winner = scored[0].cultivar;
  const phOk = scored[0].phOk;
  const textureOk = matchesTexture(aez.soil_texture, winner.soil_requirements.preferred_textures);
  const awcOk = aez.soil_awc_mm >= winner.soil_requirements.min_awc_mm;

  const adjustedConfidence = Number(
    Math.min(
      0.96,
      Math.max(
        0.55,
        winner.confidence_score -
          (scored[0].exactCountry ? 0 : 0.08) -
          (phOk ? 0 : 0.07) -
          (awcOk ? 0 : 0.05)
      )
    ).toFixed(2)
  );

  const reasonsEn = [
    `Verified release match for ${aez.country} (${aez.country_code}): ${winner.cultivar_name} (${winner.breeding_program}).`,
    `Agroecological compatibility: ${aez.agroecological_zone} (${aez.elevation_band}, GDD ~${aez.growing_degree_days_annual}°C·d).`,
    phOk
      ? `Soil pH ${aez.soil_ph.toFixed(1)} matches cultivar optimum (${winner.soil_requirements.ph_min}-${winner.soil_requirements.ph_max}).`
      : `Soil pH ${aez.soil_ph.toFixed(1)} is marginal for cultivar optimum (${winner.soil_requirements.ph_min}-${winner.soil_requirements.ph_max}).`,
    textureOk && awcOk
      ? `SoilGrids texture (${aez.soil_texture}) and AWC (${aez.soil_awc_mm} mm) meet cultivar root-zone requirements.`
      : `Check root-zone moisture management: current AWC is ${aez.soil_awc_mm} mm (target >= ${winner.soil_requirements.min_awc_mm} mm).`,
  ];

  const reasonsId = [
    `Kecocokan rilis resmi untuk ${aez.country} (${aez.country_code}): ${winner.cultivar_name} (${winner.breeding_program}).`,
    `Kesesuaian agroekologi: zona ${aez.agroecological_zone} (${aez.elevation_band}, GDD ~${aez.growing_degree_days_annual}°C·hari).`,
    phOk
      ? `pH tanah ${aez.soil_ph.toFixed(1)} sesuai dengan rentang optimal kultivar (${winner.soil_requirements.ph_min}-${winner.soil_requirements.ph_max}).`
      : `pH tanah ${aez.soil_ph.toFixed(1)} berada di batas marginal kultivar (${winner.soil_requirements.ph_min}-${winner.soil_requirements.ph_max}).`,
    textureOk && awcOk
      ? `Tekstur SoilGrids (${aez.soil_texture}) dan AWC (${aez.soil_awc_mm} mm) memenuhi kebutuhan zona akar kultivar.`
      : `Perlu pengawasan lengas tanah: AWC saat ini ${aez.soil_awc_mm} mm (target >= ${winner.soil_requirements.min_awc_mm} mm).`,
  ];

  return {
    species,
    cultivar: winner,
    is_archetype_fallback: false,
    fallback_reason: null,
    suitability_reasons_en: reasonsEn,
    suitability_reasons_id: reasonsId,
    assumptions_en: `Evidence source: ${winner.evidence_source} (${winner.evidence_date}). Local agro-dealer stock and microclimate suitability should still be verified at sub-district level.`,
    assumptions_id: `Sumber bukti: ${winner.evidence_source} (${winner.evidence_date}). Ketersediaan benih di kios tani dan kesesuaian iklim mikro desa tetap perlu diverifikasi.`,
    confidence_score: adjustedConfidence,
  };
}

/**
 * Generates the localized Crop[] array consumed by the 4-season optimization engine,
 * keeping numerical stability while replacing cultivar identity, registration metadata,
 * and regional agronomic parameters based on the active AgroecologicalProfile.
 */
export function localizeCropsForRegion(
  aez: AgroecologicalProfile,
  customCrops: Crop[] = []
): Crop[] {
  const localizedSpeciesCrops: Crop[] = CROP_SPECIES_LIBRARY.map(species => {
    const resolution = resolveCultivarForSpecies(species, aez);
    const activeCultivar = resolution.cultivar;

    return {
      id: species.legacy_crop_id,
      species_id: species.species_id,
      scientific_name: species.scientific_name,
      name: species.common_name_id,
      name_en: species.common_name_en,
      category: species.crop_type,
      growth_duration_days: activeCultivar.growth_duration_days,
      water_requirement_mm: activeCultivar.water_requirement_mm,
      kc_mid: species.kc_mid,
      root_depth_cm: activeCultivar.root_depth_cm,
      nitrogen_fixation_kg_ha: activeCultivar.nitrogen_fixation_kg_ha,
      nitrogen_demand_kg_ha: activeCultivar.nitrogen_requirement_kg_ha,
      soil_carbon_input: species.soil_carbon_input,
      economic_profit_index: species.economic_profit_index,
      drought_tolerance: activeCultivar.drought_tolerance,
      break_pest_cycle: species.break_pest_cycle,
      icon: species.icon,
      recommended_variety: activeCultivar.cultivar_name,
      local_notes: activeCultivar.agronomic_notes_id,
      local_notes_en: activeCultivar.agronomic_notes_en,
      is_custom: false,
      cultivar_resolution: resolution,
    };
  });

  return [...localizedSpeciesCrops, ...customCrops];
}
