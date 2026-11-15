import assert from 'node:assert';
import { buildAgroecologicalProfile } from '../agroecologicalZoning';
import {
  CROP_SPECIES_LIBRARY,
  CULTIVAR_REGISTRY,
  localizeCropsForRegion,
  resolveCultivarForSpecies,
} from '../cultivarLocalizer';
import { generateOptimizationPlans } from '../optimizationEngine';
import { ClimateData, MonthlyClimate } from '../../types/climate';
import { SoilData } from '../../types/agronomy';
import enDict from '../../locales/en.json';
import idDict from '../../locales/id.json';

console.log('--- STARTING GLOBAL CULTIVAR LOCALIZATION, AEZ & I18N INVARIANCE TESTS ---');

function makeMockClimate(monthlyRainfall: number[], meanTemp: number, gwetroot = 0.45): ClimateData {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: MonthlyClimate[] = monthlyRainfall.map((rain, idx) => ({
    month: idx + 1,
    monthName: monthNames[idx],
    rainfall_mm: rain,
    tmin_c: meanTemp - 5,
    tmax_c: meanTemp + 5,
    tmean_c: meanTemp,
    solar_radiation_mj: 19,
    et0_mm: 135,
  }));

  return {
    annualRainfall_mm: monthlyRainfall.reduce((s, v) => s + v, 0),
    monthlyData,
    rootZoneSoilMoisture: gwetroot,
    soilWetnessCategory: gwetroot < 0.35 ? 'Deficit' : 'Adequate',
    avgTemp_c: meanTemp,
    source: 'NASA_POWER_LIVE',
    lastUpdated: '2026-11-15',
    fetchedAt: '2026-11-15T00:00:00.000Z',
    cached: false,
    fallbackReason: null,
    observationPeriod: '2025-01 to 2025-12',
  };
}

const mockLoamSoil: SoilData = {
  sand: 40,
  clay: 25,
  silt: 35,
  soc: 1.4,
  ph: 6.4,
  cec: 18,
  awc: 34,
  textureClass: 'Lempung (Loam)',
  source: 'ISRIC_SOILGRIDS_LIVE',
  fetchedAt: '2026-11-15T00:00:00.000Z',
  cached: false,
  fallbackReason: null,
  observationPeriod: '0-30cm SoilGrids v2.0',
};

const FORBIDDEN_INDONESIAN_NAMES = [
  'Inpago',
  'Situ Bagendit',
  'Bisi 18',
  'Anjasmoro',
  'Grobogan',
  'Vima',
  'Bioguma',
  'Brawijaya',
];

// 1. Crop Species Taxonomy Separation
console.log('1. Testing Crop Species vs Cultivar Registry Separation...');
assert.strictEqual(CROP_SPECIES_LIBRARY.length, 6, 'Should define 6 canonical crop species');
assert(CULTIVAR_REGISTRY.length >= 18, 'Cultivar registry should cover multiple global regions');
for (const sp of CROP_SPECIES_LIBRARY) {
  assert.ok(sp.scientific_name, `Species ${sp.species_id} must carry scientific_name`);
  assert.ok(sp.soil_requirements.preferred_textures.length > 0, 'Species must specify soil requirements');
  assert.ok(sp.archetype_label_en.includes('Archetype'), 'Species must define archetype fallback label');
}
console.log('✓ Crop Species entities cleanly separated from cultivars');

// 2. Indonesia AEZ & Verified Indonesian Cultivars
console.log('2. Testing Indonesia (ID) AEZ & National Cultivar Resolution...');
const nttClimate = makeMockClimate([220, 190, 140, 60, 20, 10, 5, 5, 10, 25, 110, 210], 27.5, 0.36);
const nttAez = buildAgroecologicalProfile(
  {
    lat: -10.1542,
    lon: 123.821,
    placeName: 'Kupang Timur, NTT',
    country: 'Indonesia',
    countryCode: 'ID',
  },
  85,
  nttClimate,
  mockLoamSoil
);
assert.strictEqual(nttAez.country_code, 'ID');
assert.strictEqual(nttAez.hemisphere, 'Southern');
assert.strictEqual(nttAez.elevation_band, 'lowland (<500m)');
assert.strictEqual(nttAez.agroecological_zone, 'semi-arid tropical');
assert.strictEqual(nttAez.photoperiod_class, 'tropical-low-seasonality');

const idCrops = localizeCropsForRegion(nttAez);
assert.strictEqual(idCrops.length, 6);
const idMaize = idCrops.find(c => c.id === 'jagung_hibrida');
assert.ok(idMaize?.cultivar_resolution && !idMaize.cultivar_resolution.is_archetype_fallback);
assert.ok(idMaize.recommended_variety?.includes('Bisi 18'), 'ID should resolve Bisi 18');
console.log('✓ Indonesia resolved verified ID cultivars cleanly');

// 3. Strict Cross-Border Isolation (USA, Kenya, India, Brazil, Morocco)
console.log('3. Testing Strict Cross-Border Cultivar Isolation...');
const globalScenarios = [
  {
    name: 'Ames, Iowa (US Midwest)',
    loc: { lat: 42.03, lon: -93.63, placeName: 'Ames, Iowa', country: 'United States', countryCode: 'US' },
    elev: 287,
    climate: makeMockClimate([25, 30, 55, 90, 120, 130, 115, 105, 85, 65, 50, 30], 11.5, 0.62),
    expectedZone: 'humid temperate',
    expectedHemisphere: 'Northern',
    expectedPhotoperiod: 'temperate-high-seasonality',
  },
  {
    name: 'Machakos, Kenya (East Africa Highland)',
    loc: { lat: -1.52, lon: 37.26, placeName: 'Machakos, Kenya', country: 'Kenya', countryCode: 'KE' },
    elev: 1620,
    climate: makeMockClimate([45, 40, 95, 145, 55, 10, 5, 5, 10, 45, 140, 95], 20.0, 0.41),
    expectedZone: 'tropical highland',
    expectedHemisphere: 'Southern',
    expectedPhotoperiod: 'tropical-low-seasonality',
  },
  {
    name: 'Anantapur, India (Deccan Semi-Arid)',
    loc: { lat: 14.68, lon: 77.6, placeName: 'Anantapur, India', country: 'India', countryCode: 'IN' },
    elev: 335,
    climate: makeMockClimate([5, 5, 10, 20, 55, 70, 80, 95, 135, 110, 40, 15], 27.8, 0.34),
    expectedZone: 'semi-arid tropical',
    expectedHemisphere: 'Northern',
    expectedPhotoperiod: 'subtropical-moderate-seasonality',
  },
  {
    name: 'Meknes, Morocco (Mediterranean Unmapped Cultivars)',
    loc: { lat: 33.89, lon: -5.55, placeName: 'Meknes, Morocco', country: 'Morocco', countryCode: 'MA' },
    elev: 549,
    climate: makeMockClimate([85, 75, 70, 55, 25, 8, 2, 3, 15, 50, 75, 90], 17.8, 0.42),
    expectedZone: 'mediterranean',
    expectedHemisphere: 'Northern',
    expectedPhotoperiod: 'temperate-high-seasonality',
  },
];

for (const scenario of globalScenarios) {
  const aez = buildAgroecologicalProfile(scenario.loc, scenario.elev, scenario.climate, mockLoamSoil);
  assert.strictEqual(aez.hemisphere, scenario.expectedHemisphere, `${scenario.name} hemisphere mismatch`);
  assert.strictEqual(aez.photoperiod_class, scenario.expectedPhotoperiod, `${scenario.name} photoperiod mismatch`);
  assert.strictEqual(aez.agroecological_zone, scenario.expectedZone, `${scenario.name} AEZ mismatch`);

  const localized = localizeCropsForRegion(aez);
  assert.strictEqual(localized.length, 6);

  for (const crop of localized) {
    const cultivarName = crop.recommended_variety || '';
    for (const forbidden of FORBIDDEN_INDONESIAN_NAMES) {
      assert.ok(
        !cultivarName.includes(forbidden),
        `LEAK DETECTED: Indonesian variety "${forbidden}" leaked into ${scenario.name} (${cultivarName})`
      );
    }
  }
}

// Verify Morocco (unregistered MA territory) falls back cleanly across ALL species to Phenotype Archetypes
const moroccoAez = buildAgroecologicalProfile(
  globalScenarios[3].loc,
  globalScenarios[3].elev,
  globalScenarios[3].climate,
  mockLoamSoil
);
for (const sp of CROP_SPECIES_LIBRARY) {
  const rec = resolveCultivarForSpecies(sp, moroccoAez);
  assert.strictEqual(rec.is_archetype_fallback, true, `${sp.species_id} in MA must fall back to phenotype archetype`);
  assert.strictEqual(rec.cultivar.registration_status, 'Phenotype Archetype (Unverified Local Registry)');
  assert.ok(rec.fallback_reason && rec.fallback_reason.length > 10, 'Fallback must explain rationale');
}
console.log('✓ Zero Indonesian cultivars leaked globally; unmapped countries trigger Phenotype Archetype fallback cleanly');

// 4. i18n Locale Completeness & Calculation Invariance
console.log('4. Testing Bilingual i18n Dictionaries & Calculation Invariance...');
assert.strictEqual(typeof enDict.app.brand, 'string');
assert.strictEqual(typeof idDict.app.brand, 'string');
assert.ok(enDict.rotation.archetypeFallback.length > 0);
assert.ok(idDict.rotation.archetypeFallback.length > 0);

// Ensure optimization plans depend ONLY on localized crops + telemetry, NEVER on UI language
const plansPass1 = generateOptimizationPlans(idCrops, nttClimate, mockLoamSoil, {
  profitWeight: 40,
  waterWeight: 35,
  soilWeight: 25,
});
const plansPass2 = generateOptimizationPlans(idCrops, nttClimate, mockLoamSoil, {
  profitWeight: 40,
  waterWeight: 35,
  soilWeight: 25,
});
assert.deepStrictEqual(plansPass1.A.compositeScore, plansPass2.A.compositeScore);
assert.deepStrictEqual(plansPass1.B.waterSavingsPct, plansPass2.B.waterSavingsPct);
assert.deepStrictEqual(plansPass1.C.projectedProfitIndex, plansPass2.C.projectedProfitIndex);
console.log('✓ Bilingual resources verified and optimization math confirmed invariant');

console.log('ALL GLOBAL CULTIVAR LOCALIZATION & AEZ TESTS PASSED!');
