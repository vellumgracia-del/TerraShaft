import assert from 'node:assert';
import {
  formatNumber,
  formatMm,
  formatPercentage,
  formatKgPerHa,
  formatCoordinate,
  formatScore,
  getCropEmoji,
  getWaterStatusDetails,
  getStructuredSeason
} from '../formatters';
import { resolveTerraShaftProvenance } from '../../types/provenance';
import { generateDynamicAuditLog } from '../auditLogGenerator';
import { ClimateData } from '../../types/climate';
import { SoilData, Crop, Priorities } from '../../types/agronomy';
import initialCrops from '../../data/crops_library.json';
import { generateOptimizationPlans } from '../optimizationEngine';
import {
  getNasaPowerDisplayStatus,
  getNasaSmapDisplayStatus,
  getNasaPrecipitationDisplayStatus,
  getSoilGridsDisplayStatus,
  getOverallDisplayStatus,
  getActionSheetProvenanceDisplay
} from '../provenance';
import { getAppEnv } from '../env';

console.log('--- STARTING MILESTONE 2.3 PROVENANCE & DYNAMIC AUDIT UNIT TESTS ---');

// 1. PRECISION FORMATTERS TEST
console.log('1. Testing Precision Formatters & Float Sanitation...');
// Prevents 21.200000000000003 floating point artifact
assert.strictEqual(formatNumber(21.200000000000003, 1), '21.2');
assert.strictEqual(formatNumber(0.38000001, 2), '0.38');
assert.strictEqual(formatNumber(null), '0');
console.log('✓ formatNumber prevents floating point artifacts');

assert.strictEqual(formatMm(21.200000000000003), '21.2 mm');
assert.strictEqual(formatMm(100), '100.0 mm');
assert.strictEqual(formatMm(undefined), '0.0 mm');
console.log('✓ formatMm produces clean mm precision strings');

assert.strictEqual(formatPercentage(60.25, 1), '60.3%');
assert.strictEqual(formatPercentage(60, 0), '60%');
assert.strictEqual(formatKgPerHa(370), '+370 kg N/ha');
assert.strictEqual(formatKgPerHa(-50), '-50 kg N/ha');
console.log('✓ formatPercentage & formatKgPerHa format units correctly');

assert.strictEqual(formatCoordinate(-10.1772345), '-10.1772');
assert.strictEqual(formatCoordinate(123.607), '123.6070');
console.log('✓ formatCoordinate enforces 4 decimal places');

assert.strictEqual(formatScore(88.7), '89');
assert.strictEqual(formatScore(66.2), '66');
console.log('✓ formatScore rounds to integer');

// 2. CROP ICON EMOJI MAPPING
console.log('2. Testing Crop Icon Emoji Mapper...');
assert.strictEqual(getCropEmoji('flower'), '🌼');
assert.strictEqual(getCropEmoji('bean'), '🫘');
assert.strictEqual(getCropEmoji('corn'), '🌽');
assert.strictEqual(getCropEmoji('sprout'), '🌱');
assert.strictEqual(getCropEmoji('wheat'), '🌾');
assert.strictEqual(getCropEmoji('🌾'), '🌾');
assert.strictEqual(getCropEmoji(undefined), '🌱');
console.log('✓ getCropEmoji cleanly maps internal string ids to emojis');

// 3. WATER STATUS CATEGORIES
console.log('3. Testing Water Status Categories...');
const safe = getWaterStatusDetails(0);
assert.strictEqual(safe.label, 'Tidak ada defisit');

const light = getWaterStatusDetails(21.2);
assert.strictEqual(light.label, 'Defisit ringan');
assert.ok(light.subLabel.includes('21.2 mm'));

const moderate = getWaterStatusDetails(65);
assert.strictEqual(moderate.label, 'Defisit sedang');

const critical = getWaterStatusDetails(120);
assert.strictEqual(critical.label, 'Defisit kritis');
assert.strictEqual(critical.isCritical, true);
console.log('✓ getWaterStatusDetails classifies non-binary water deficits correctly');

// 4. STRUCTURED SEASONS
console.log('4. Testing Structured Season Labels...');
const s1 = getStructuredSeason(1, 'Hujan Utama (Rendeng)', 'Nov – Feb');
assert.strictEqual(s1.seasonNumber, 1);
assert.strictEqual(s1.seasonLabel, 'Musim 1');
assert.strictEqual(s1.seasonName, 'Hujan Utama (Rendeng)');
assert.strictEqual(s1.monthRange, 'Nov – Feb');

const s2 = getStructuredSeason(2);
assert.strictEqual(s2.seasonLabel, 'Musim 2');
assert.strictEqual(s2.monthRange, 'Mar – Mei');
console.log('✓ getStructuredSeason provides structured season labels');

const mockMonthlyData = [
  { month: 1, monthName: 'Jan', rainfall_mm: 310, tmin_c: 24, tmax_c: 31, tmean_c: 27.5, solar_radiation_mj: 17, et0_mm: 125 },
  { month: 2, monthName: 'Feb', rainfall_mm: 270, tmin_c: 24, tmax_c: 31, tmean_c: 27.5, solar_radiation_mj: 18, et0_mm: 120 },
  { month: 3, monthName: 'Mar', rainfall_mm: 190, tmin_c: 23, tmax_c: 32, tmean_c: 27.5, solar_radiation_mj: 19, et0_mm: 135 },
  { month: 4, monthName: 'Apr', rainfall_mm: 80, tmin_c: 22, tmax_c: 32, tmean_c: 27.0, solar_radiation_mj: 20, et0_mm: 140 },
  { month: 5, monthName: 'Mei', rainfall_mm: 30, tmin_c: 21, tmax_c: 32, tmean_c: 26.5, solar_radiation_mj: 20, et0_mm: 145 },
  { month: 6, monthName: 'Jun', rainfall_mm: 15, tmin_c: 20, tmax_c: 31, tmean_c: 25.5, solar_radiation_mj: 19, et0_mm: 140 },
  { month: 7, monthName: 'Jul', rainfall_mm: 5, tmin_c: 19, tmax_c: 31, tmean_c: 25.0, solar_radiation_mj: 20, et0_mm: 150 },
  { month: 8, monthName: 'Agu', rainfall_mm: 5, tmin_c: 19, tmax_c: 32, tmean_c: 25.5, solar_radiation_mj: 22, et0_mm: 165 },
  { month: 9, monthName: 'Sep', rainfall_mm: 12, tmin_c: 20, tmax_c: 33, tmean_c: 26.5, solar_radiation_mj: 24, et0_mm: 180 },
  { month: 10, monthName: 'Okt', rainfall_mm: 35, tmin_c: 22, tmax_c: 34, tmean_c: 28.0, solar_radiation_mj: 23, et0_mm: 175 },
  { month: 11, monthName: 'Nov', rainfall_mm: 110, tmin_c: 24, tmax_c: 33, tmean_c: 28.5, solar_radiation_mj: 20, et0_mm: 145 },
  { month: 12, monthName: 'Des', rainfall_mm: 240, tmin_c: 24, tmax_c: 32, tmean_c: 28.0, solar_radiation_mj: 18, et0_mm: 130 }
];

// 5. PROVENANCE RESOLVER TEST
console.log('5. Testing Provenance Resolution (Live vs Fallback vs Demo)...');
const dummyClimateLive: ClimateData = {
  annualRainfall_mm: 780,
  monthlyData: mockMonthlyData,
  rootZoneSoilMoisture: 0.42,
  soilWetnessCategory: 'Adequate',
  avgTemp_c: 27.0,
  source: 'NASA_POWER_LIVE',
  lastUpdated: new Date().toISOString(),
  fetchedAt: '2026-10-01T12:00:00Z',
  cached: false,
  fallbackReason: null,
  observationPeriod: '2025-01-01 to 2025-12-31'
};

const dummySoilLive: SoilData = {
  sand: 35,
  clay: 25,
  silt: 40,
  soc: 1.8,
  ph: 6.5,
  cec: 22,
  awc: 45,
  textureClass: 'Lempung (Loam)',
  source: 'ISRIC_SOILGRIDS_LIVE',
  cached: false,
  fallbackReason: null,
  fetchedAt: '2026-10-01T12:00:00Z',
  observationPeriod: '0-30cm'
};

const provLive = resolveTerraShaftProvenance(dummyClimateLive, dummySoilLive, false);
assert.strictEqual(provLive.nasaPower.mode, 'live');
assert.strictEqual(provLive.isricSoilGrids.mode, 'live');
assert.strictEqual(provLive.overallMode, 'live');
assert.strictEqual(provLive.headerBadge.text, 'NASA POWER & SOILGRIDS API OK');
console.log('✓ Pure LIVE mode correctly detected as API OK (not claiming real-time field observation)');

// Partial Fallback
const dummySoilFallback: SoilData = {
  ...dummySoilLive,
  source: 'REGIONAL_FALLBACK',
  cached: false,
  fallbackReason: 'ISRIC SoilGrids endpoint returned HTTP 500'
};
const provPartial = resolveTerraShaftProvenance(dummyClimateLive, dummySoilFallback, false);
assert.strictEqual(provPartial.nasaPower.mode, 'live');
assert.strictEqual(provPartial.isricSoilGrids.mode, 'fallback');
assert.notStrictEqual(provPartial.overallMode, 'live');
assert.strictEqual(provPartial.headerBadge.text, 'NASA POWER API · SOILGRIDS FALLBACK');
console.log('✓ Partial fallback correctly reported as NASA POWER API · SOILGRIDS FALLBACK');

// Demo Mode
const dummyClimateDemo: ClimateData = {
  ...dummyClimateLive,
  source: 'DEMO_SIMULATION'
};
const provDemo = resolveTerraShaftProvenance(dummyClimateDemo, dummySoilFallback, false);
assert.strictEqual(provDemo.overallMode, 'demo');
assert.strictEqual(provDemo.headerBadge.text, 'DEMO DATA · BUKAN OBSERVASI LIVE');
console.log('✓ Demo mode explicitly acknowledged in provenance badge');

// 6. SHARED SOURCE-STATUS PRESENTATION MODEL TESTS (MILESTONE 2.3)
console.log('6. Testing Shared Source-Status Presentation Resolvers...');

// 6.1 NASA POWER Display Status
const nasaLiveDisplay = getNasaPowerDisplayStatus(provPartial);
assert.strictEqual(nasaLiveDisplay.isFieldObservation, false, 'NASA POWER must NOT claim field observation');
assert.strictEqual(nasaLiveDisplay.isOfficialApiResponse, true);
assert.strictEqual(nasaLiveDisplay.shortLabel, 'NASA POWER · API OK');
assert.ok(nasaLiveDisplay.detailText.includes('bukan sensor in-situ real-time'), 'NASA detail must state not in-situ');

// 6.2 SMAP GWETROOT Display Status
const smapLiveDisplay = getNasaSmapDisplayStatus(provPartial);
assert.strictEqual(smapLiveDisplay.shortLabel, 'SMAP L4 (Model)');
assert.ok(smapLiveDisplay.longLabel.includes('Model-assimilated'), 'SMAP must be described as model-assimilated');
assert.ok(smapLiveDisplay.detailText.includes('bukan pembacaan sensor in-situ'), 'SMAP must clarify not in-situ');

const smapFallbackDisplay = getNasaSmapDisplayStatus(provDemo);
assert.strictEqual(smapFallbackDisplay.shortLabel, 'Model demo estimate');

// 6.3 NASA Precipitation Display Status (No Direct GPM Overclaim)
const precipDisplay = getNasaPrecipitationDisplayStatus(provPartial);
assert.strictEqual(precipDisplay.shortLabel, 'Presipitasi NASA POWER');
assert.ok(!precipDisplay.shortLabel.includes('GPM IMERG'), 'Must NOT claim direct GPM IMERG');
assert.ok(precipDisplay.longLabel.includes('via NASA POWER'), 'Precipitation must specify via NASA POWER');

// 6.4 SoilGrids Display Status
const soilFallbackDisplay = getSoilGridsDisplayStatus(provPartial);
assert.strictEqual(soilFallbackDisplay.shortLabel, 'SoilGrids · Fallback');
assert.strictEqual(soilFallbackDisplay.longLabel, 'ISRIC SoilGrids · Regional fallback');
assert.ok(soilFallbackDisplay.detailText.includes('bukan observasi grid SoilGrids live'), 'Must explain regional fallback');

// 6.5 Overall Display Status
const overallPartialDisplay = getOverallDisplayStatus(provPartial);
assert.strictEqual(overallPartialDisplay.shortLabel, 'NASA API OK · Soil fallback');
assert.strictEqual(overallPartialDisplay.longLabel, 'NASA POWER API · SOILGRIDS FALLBACK');
assert.strictEqual(overallPartialDisplay.tone, 'warning');

// 6.6 Action Sheet Provenance Synchronization
const actionSheetDisplay = getActionSheetProvenanceDisplay(provPartial);
assert.ok(actionSheetDisplay.compactSourceBlock.nasa.includes('NASA POWER: API OK'));
assert.ok(actionSheetDisplay.compactSourceBlock.soil.includes('ISRIC SoilGrids: fallback regional'));
assert.ok(actionSheetDisplay.scientificNote.includes('baseline agroklimatologi historis'));
assert.ok(actionSheetDisplay.scientificNote.includes('fallback regional'));
console.log('✓ Shared source-status presentation model verified across all sources & Action Sheet');

// 7. ENVIRONMENT CONFIGURATION TESTS (MILESTONE 2.3)
console.log('7. Testing Secure Environment Configuration & Validation...');
const defaultEnv = getAppEnv();
assert.ok(defaultEnv.dataMode === 'api' || defaultEnv.dataMode === 'demo');
assert.ok(defaultEnv.nasaPowerTimeoutMs >= 2000 && defaultEnv.nasaPowerTimeoutMs <= 30000);
assert.ok(defaultEnv.isricSoilGridsTimeoutMs >= 2000 && defaultEnv.isricSoilGridsTimeoutMs <= 30000);
assert.ok(defaultEnv.nasaPowerBaseUrl.startsWith('https://'));
assert.ok(defaultEnv.isricSoilGridsBaseUrl.startsWith('https://'));
console.log('✓ Environment validation applies safe bounds and defaults');

// 8. DYNAMIC AUDIT LOG SYNCHRONIZATION
console.log('8. Testing Dynamic Audit Log Generation & Anti-Stale Values...');
const dummyCrops = initialCrops as unknown as Crop[];

const testClimate: ClimateData = {
  monthlyData: mockMonthlyData,
  annualRainfall_mm: 1375,
  rootZoneSoilMoisture: 0.72,
  soilWetnessCategory: 'Adequate',
  avgTemp_c: 27.0,
  source: 'NASA_POWER_LIVE',
  lastUpdated: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  cached: false,
  fallbackReason: null,
  observationPeriod: 'Historical 1-Year Baseline'
};

const testSoil: SoilData = {
  sand: 20,
  clay: 45,
  silt: 35,
  soc: 2.1,
  ph: 6.2,
  cec: 28,
  awc: 42.5,
  textureClass: 'Lempung Liat (Clay Loam)',
  source: 'ISRIC_SOILGRIDS_LIVE',
  fetchedAt: new Date().toISOString(),
  cached: false,
  fallbackReason: null,
  observationPeriod: '0-30cm'
};

const testPriorities: Priorities = {
  profitWeight: 40,
  waterWeight: 30,
  soilWeight: 30
};

const plans = generateOptimizationPlans(dummyCrops, testClimate, testSoil, testPriorities);
const planA = plans.A;

const auditLog = generateDynamicAuditLog(
  { lat: -8.5, lon: 115.2, placeName: 'Gianyar, Bali' },
  testClimate,
  testSoil,
  planA,
  testPriorities,
  dummyCrops
);

assert.ok(auditLog.entries.length >= 4, 'Audit entries must be populated');
assert.ok(auditLog.auditModeLabel.includes('respons API NASA POWER dan SoilGrids'));

const allExplanations = auditLog.entries.map((e) => e.explanation).join(' ');

// Check for old stale values:
assert.ok(!allExplanations.includes('GWETROOT 0.18'), 'Must NOT contain stale GWETROOT 0.18');
assert.ok(!allExplanations.includes('Peak deficit 142mm'), 'Must NOT contain stale deficit 142mm');
assert.ok(!allExplanations.includes('AWC 60mm'), 'Must NOT contain stale AWC 60mm');

// Check for current live values:
assert.ok(allExplanations.includes('0.72'), 'Must contain active GWETROOT 0.72');
assert.ok(allExplanations.includes('42.5 mm'), 'Must contain active AWC 42.5 mm');
assert.ok(allExplanations.includes('Gianyar, Bali'), 'Must contain active place name');

console.log('✓ Audit log dynamically synchronized with active state without stale hardcoded values');
console.log('--- ALL MILESTONE 2.3 TESTS PASSED SUCCESSFULLY! ---');
