import assert from 'node:assert';
import { calculateAWC, classifySoilTexture, estimateBulkDensity } from '@/lib/pedotransfer';
import { calculateDailyET0, calculateCropWaterRequirement } from '@/lib/evapotranspiration';
import {
  generateAllSequencePermutations,
  generateOptimizationPlans,
  SEASONS
} from '@/lib/optimizationEngine';
import initialCrops from '@/data/crops_library.json';
import { Crop, SoilData, Priorities } from '@/types/agronomy';
import { ClimateData, MonthlyClimate } from '@/types/climate';

console.log('--- STARTING AGRONOMY & OPTIMIZATION ENGINE UNIT TESTS ---');

// 1. TEST PEDOTRANSFER & SOIL PHYSICS
console.log('Testing Pedotransfer functions...');
const testSoil: SoilData = {
  sand: 38.0,
  silt: 32.0,
  clay: 30.0,
  soc: 1.15,
  ph: 6.4,
  cec: 19.5,
  awc: 0,
  textureClass: ''
};

const awc = calculateAWC(testSoil.sand, testSoil.silt, testSoil.clay, testSoil.soc);
// Formula: 0.15*38 + 0.35*32 + 0.40*30 + 1.2*1.15 = 5.7 + 11.2 + 12 + 1.38 = 30.28 -> 30.3
assert.strictEqual(awc, 30.3, `AWC should be 30.3 mm, received ${awc}`);
console.log('✓ calculateAWC formula matches PRD specification');

const texture1 = classifySoilTexture(70, 15, 15);
assert.strictEqual(texture1, 'Lempung Berpasir (Sandy Loam)');

const texture2 = classifySoilTexture(20, 20, 60);
assert.strictEqual(texture2, 'Liat (Clay)');

const texture3 = classifySoilTexture(38, 32, 30);
assert.strictEqual(texture3, 'Lempung Berliat (Clay Loam)');

const texture4 = classifySoilTexture(52, 18, 30);
assert.strictEqual(texture4, 'Lempung Liat Berpasir (Sandy Clay Loam)');
console.log('✓ classifySoilTexture correctly categorizes USDA soil textures');

const bd = estimateBulkDensity(1.15);
assert.ok(bd >= 1.0 && bd <= 1.7, 'Bulk density should be within realistic soil range');
console.log('✓ estimateBulkDensity outputs realistic density value');


// 2. TEST EVAPOTRANSPIRATION & WATER REQUIREMENT
console.log('Testing Evapotranspiration...');
const et0 = calculateDailyET0(22, 32, 18.5); // Tmin 22, Tmax 32, Solar Rad 18.5 MJ
assert.ok(et0 >= 2.5 && et0 <= 6.5, `ET0 should be realistic tropical value, got ${et0}`);

const waterDemandCorn = calculateCropWaterRequirement(4.2, 100, 1.2); // Jagung 100 hari, Kc 1.2
assert.ok(waterDemandCorn >= 380 && waterDemandCorn <= 500, `Corn water demand should be ~440mm, got ${waterDemandCorn}`);
console.log('✓ calculateDailyET0 & calculateCropWaterRequirement functional');


// 3. TEST COMBINATORIAL OPTIMIZATION & PERMUTATION GENERATOR
console.log('Testing Combinatorial Engine & 4-Season Permutations...');

// Mock 12-month climate data (Kupang Timur pattern: dry Jul-Oct)
const mockMonthlyData: MonthlyClimate[] = [
  { month: 1, monthName: 'Jan', rainfall_mm: 310, tmin_c: 24, tmax_c: 31, tmean_c: 27.5, solar_radiation_mj: 17, et0_mm: 125 },
  { month: 2, monthName: 'Feb', rainfall_mm: 280, tmin_c: 24, tmax_c: 31, tmean_c: 27.5, solar_radiation_mj: 17, et0_mm: 120 },
  { month: 3, monthName: 'Mar', rainfall_mm: 180, tmin_c: 23, tmax_c: 32, tmean_c: 27.5, solar_radiation_mj: 18, et0_mm: 130 },
  { month: 4, monthName: 'Apr', rainfall_mm: 85, tmin_c: 22, tmax_c: 32, tmean_c: 27.0, solar_radiation_mj: 19, et0_mm: 135 },
  { month: 5, monthName: 'Mei', rainfall_mm: 40, tmin_c: 21, tmax_c: 32, tmean_c: 26.5, solar_radiation_mj: 19, et0_mm: 135 },
  { month: 6, monthName: 'Jun', rainfall_mm: 20, tmin_c: 20, tmax_c: 31, tmean_c: 25.5, solar_radiation_mj: 18, et0_mm: 130 },
  { month: 7, monthName: 'Jul', rainfall_mm: 10, tmin_c: 19, tmax_c: 31, tmean_c: 25.0, solar_radiation_mj: 19, et0_mm: 135 },
  { month: 8, monthName: 'Agu', rainfall_mm: 5, tmin_c: 19, tmax_c: 32, tmean_c: 25.5, solar_radiation_mj: 21, et0_mm: 145 },
  { month: 9, monthName: 'Sep', rainfall_mm: 12, tmin_c: 21, tmax_c: 33, tmean_c: 27.0, solar_radiation_mj: 22, et0_mm: 155 },
  { month: 10, monthName: 'Okt', rainfall_mm: 35, tmin_c: 23, tmax_c: 34, tmean_c: 28.5, solar_radiation_mj: 22, et0_mm: 160 },
  { month: 11, monthName: 'Nov', rainfall_mm: 110, tmin_c: 24, tmax_c: 33, tmean_c: 28.5, solar_radiation_mj: 20, et0_mm: 145 },
  { month: 12, monthName: 'Des', rainfall_mm: 240, tmin_c: 24, tmax_c: 32, tmean_c: 28.0, solar_radiation_mj: 18, et0_mm: 130 }
];

const mockClimate: ClimateData = {
  annualRainfall_mm: 1327,
  monthlyData: mockMonthlyData,
  rootZoneSoilMoisture: 0.38,
  soilWetnessCategory: 'Deficit',
  avgTemp_c: 27.0,
  source: 'NASA_POWER_LIVE',
  lastUpdated: new Date().toISOString()
};

testSoil.awc = 30.3;

const testPriorities: Priorities = {
  profitWeight: 40,
  waterWeight: 35,
  soilWeight: 25
};

const crops = initialCrops as Crop[];
assert.strictEqual(crops.length, 6, 'Library should contain 6 standard crops');

// Check permutation count: 6^4 = 1296
const permutations = generateAllSequencePermutations(crops, mockClimate, testSoil, testPriorities);
assert.strictEqual(permutations.length, 1296, `Permutation count should be exactly 1296, got ${permutations.length}`);
console.log('✓ Permutation generator evaluated all 1296 combinations (6^4)');


// 4. TEST SOIL BATTERY DYNAMICS & NITROGEN DELTA
console.log('Testing Soil Battery and Nitrogen calculations...');
const initialBattery = Math.min(100, Math.max(15, Math.round(40 + (20 * testSoil.soc))));
// 40 + 20*1.15 = 63
assert.strictEqual(initialBattery, 63, `Initial battery should be 63%, got ${initialBattery}%`);

// Find a pure legume/cover crop sequence
const crotalaria = crops.find(c => c.id === 'crotalaria')!;
const kedelai = crops.find(c => c.id === 'kedelai')!;
const jagung = crops.find(c => c.id === 'jagung_hibrida')!;

const allGreenSeq = permutations.find(p => p.crops.every(c => c.category === 'Cover Crop' || c.category === 'Legume'))!;
assert.ok(allGreenSeq.soilBatteryScore > initialBattery, 'All-green rotation must recharge soil battery');
assert.ok(allGreenSeq.netNitrogenDelta > 0, 'All-green rotation must have high positive nitrogen delta');
console.log(`✓ Soil Battery Recharged: ${initialBattery}% -> ${allGreenSeq.soilBatteryScore}%, Net N: +${allGreenSeq.netNitrogenDelta} kg/ha`);

// Consecutive cereals monokultur penalty test
const monocultureCorn = permutations.find(p => p.crops.every(c => c.id === 'jagung_hibrida'))!;
assert.ok(monocultureCorn.soilBatteryScore < initialBattery, 'Continuous corn monoculture must deplete soil battery');
assert.ok(monocultureCorn.netNitrogenDelta < 0, 'Corn monoculture must have negative nitrogen balance');
console.log(`✓ Monoculture Depletion: ${initialBattery}% -> ${monocultureCorn.soilBatteryScore}%, Net N: ${monocultureCorn.netNitrogenDelta} kg/ha`);


// 5. TEST GENERATE OPTIMIZATION PLANS (PATHWAYS A, B, C)
console.log('Testing generateOptimizationPlans outputs...');
const plans = generateOptimizationPlans(crops, mockClimate, testSoil, testPriorities);

// Pathway A Checks
assert.ok(plans.A, 'Pathway A must exist');
assert.strictEqual(plans.A.pathwayId, 'A');
const cropsInA = plans.A.seasons.map(s => s.crop);
const hasCoverA = cropsInA.some(c => c.category === 'Cover Crop' || c.root_depth_cm >= 80);
const hasLegumeA = cropsInA.some(c => c.category === 'Legume');
assert.ok(hasCoverA, 'Pathway A must contain deep-rooted cover crop');
assert.ok(hasLegumeA, 'Pathway A must contain nitrogen-fixing legume');
assert.ok(plans.A.soilBatteryScore >= plans.A.initialBatteryScore, 'Pathway A must not degrade soil battery');
console.log(`✓ Pathway A (Max Soil) verified: Battery ${plans.A.initialBatteryScore}% -> ${plans.A.soilBatteryScore}%, N: +${plans.A.netNitrogenDelta} kg/ha`);

// Pathway B Checks
assert.ok(plans.B, 'Pathway B must exist');
assert.strictEqual(plans.B.pathwayId, 'B');
const drySeasonCropsB = [plans.B.seasons[2].crop, plans.B.seasons[3].crop];
const hasModerateInDrySeason = drySeasonCropsB.some(c => c.drought_tolerance === 'Moderate');
assert.strictEqual(hasModerateInDrySeason, false, 'Pathway B must NOT have Moderate drought tolerance crops in dry seasons (Jun-Okt)');
assert.ok(plans.B.waterSavingsPct >= 20, `Pathway B water savings should be >= 20%, got ${plans.B.waterSavingsPct}%`);
console.log(`✓ Pathway B (Drought Resilience) verified: Water Savings ${plans.B.waterSavingsPct}%, Dry Season Crops: [${drySeasonCropsB.map(c => c.name).join(', ')}]`);

// Pathway C Checks
assert.ok(plans.C, 'Pathway C must exist');
assert.strictEqual(plans.C.pathwayId, 'C');
assert.ok(plans.C.projectedProfitIndex >= 65, `Pathway C profit index should be high, got ${plans.C.projectedProfitIndex}`);
assert.ok(plans.C.soilBatteryScore >= 35, 'Pathway C must maintain safe minimum soil battery');
console.log(`✓ Pathway C (Cash Flow) verified: Profit Index ${plans.C.projectedProfitIndex}/100, Battery ${plans.C.soilBatteryScore}%`);

console.log('--- ALL AGRONOMY & SPRINT 2 UNIT TESTS PASSED SUCCESSFULLY! ---');
