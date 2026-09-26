import { Crop, SoilData, RotationPlan, SeasonCropAllocation, Priorities } from '@/types/agronomy';
import { ClimateData } from '@/types/climate';
import { calculateCropWaterRequirement } from './evapotranspiration';

export interface SeasonDefinition {
  seasonIndex: number;
  seasonName: string;
  monthRange: string;
  startMonth: number; // 1-indexed
  endMonth: number;
  monthsCount: number;
  isDrySeason: boolean;
}

export const SEASONS: SeasonDefinition[] = [
  {
    seasonIndex: 1,
    seasonName: 'Musim 1 (Hujan Utama / Rendeng)',
    monthRange: 'Nov - Feb',
    startMonth: 11,
    endMonth: 2,
    monthsCount: 4,
    isDrySeason: false
  },
  {
    seasonIndex: 2,
    seasonName: 'Musim 2 (Pancaroba / Gadu 1)',
    monthRange: 'Mar - Mei',
    startMonth: 3,
    endMonth: 5,
    monthsCount: 3,
    isDrySeason: false
  },
  {
    seasonIndex: 3,
    seasonName: 'Musim 3 (Kemarau Awal / Gadu 2)',
    monthRange: 'Jun - Agu',
    startMonth: 6,
    endMonth: 8,
    monthsCount: 3,
    isDrySeason: true
  },
  {
    seasonIndex: 4,
    seasonName: 'Musim 4 (Puncak Kemarau / Cover)',
    monthRange: 'Sep - Okt',
    startMonth: 9,
    endMonth: 10,
    monthsCount: 2,
    isDrySeason: true
  }
];

// Helper untuk menghitung total curah hujan selama musim tertentu
export function getSeasonalRainfall(climate: ClimateData, season: SeasonDefinition): number {
  if (!climate.monthlyData || climate.monthlyData.length < 12) return 200;
  
  let rain = 0;
  if (season.startMonth <= season.endMonth) {
    for (let m = season.startMonth; m <= season.endMonth; m++) {
      rain += climate.monthlyData[m - 1]?.rainfall_mm || 0;
    }
  } else {
    // Crosses year boundary (misal: Nov - Feb: 11, 12, 1, 2)
    for (let m = season.startMonth; m <= 12; m++) {
      rain += climate.monthlyData[m - 1]?.rainfall_mm || 0;
    }
    for (let m = 1; m <= season.endMonth; m++) {
      rain += climate.monthlyData[m - 1]?.rainfall_mm || 0;
    }
  }
  return rain;
}

// Helper untuk rata-rata ET0 harian selama musim
export function getSeasonalAvgDailyET0(climate: ClimateData, season: SeasonDefinition): number {
  if (!climate.monthlyData || climate.monthlyData.length < 12) return 4.0;
  let totalET0 = 0;
  let count = 0;

  if (season.startMonth <= season.endMonth) {
    for (let m = season.startMonth; m <= season.endMonth; m++) {
      totalET0 += (climate.monthlyData[m - 1]?.et0_mm || 120) / 30;
      count++;
    }
  } else {
    for (let m = season.startMonth; m <= 12; m++) {
      totalET0 += (climate.monthlyData[m - 1]?.et0_mm || 120) / 30;
      count++;
    }
    for (let m = 1; m <= season.endMonth; m++) {
      totalET0 += (climate.monthlyData[m - 1]?.et0_mm || 120) / 30;
      count++;
    }
  }
  return count > 0 ? totalET0 / count : 4.0;
}

/**
 * Menghitung alokasi metrik per musim untuk suatu tanaman
 */
export function evaluateSeasonCrop(
  crop: Crop,
  season: SeasonDefinition,
  climate: ClimateData,
  soil: SoilData,
  prevCrop: Crop | null
): SeasonCropAllocation {
  const avgDailyET0 = getSeasonalAvgDailyET0(climate, season);
  const waterDemand = calculateCropWaterRequirement(avgDailyET0, crop.growth_duration_days, crop.kc_mid);
  const expectedRain = getSeasonalRainfall(climate, season);

  // Defisit air: max(0, WaterDemand - (Rain + AWC))
  const waterDeficit = Math.max(0, waterDemand - (expectedRain + soil.awc));

  // Neraca nitrogen: Fiksasi N - Kebutuhan N
  const nitrogenDelta = crop.nitrogen_fixation_kg_ha - crop.nitrogen_demand_kg_ha;

  // Efek baterai per musim:
  let batteryDelta = 0;
  if (crop.category === 'Legume' || crop.category === 'Cover Crop') {
    batteryDelta = 15;
  } else if (crop.category === 'Cereal' && prevCrop && prevCrop.category === 'Cereal') {
    batteryDelta = -20; // Monokultur sereal berturut-turut tanpa jeda
  } else if (crop.category === 'Cereal') {
    batteryDelta = -5;
  }

  let statusBadge: 'positive' | 'warning' | 'cash' = 'positive';
  if (crop.economic_profit_index >= 75) {
    statusBadge = 'cash';
  } else if (waterDeficit > 80 || (season.isDrySeason && crop.drought_tolerance === 'Moderate')) {
    statusBadge = 'warning';
  }

  let notes = '';
  if (crop.category === 'Cover Crop') {
    notes = `Memperbaiki struktur tanah, menambah biomassa dan +${crop.nitrogen_fixation_kg_ha} kg N alami.`;
  } else if (crop.category === 'Legume') {
    notes = `Bintil akar aktif menambat nitrogen (+${nitrogenDelta > 0 ? '+' : ''}${nitrogenDelta} kg N net). Memutus siklus hama.`;
  } else if (crop.drought_tolerance === 'Very High') {
    notes = `Akar tembus lapisan padas (${crop.root_depth_cm} cm). Sangat tangguh menghadapi kekeringan.`;
  } else {
    notes = `Komoditas pangan utama dengan indeks profit tinggi (${crop.economic_profit_index}/100).`;
  }

  return {
    seasonIndex: season.seasonIndex,
    seasonName: season.seasonName,
    monthRange: season.monthRange,
    crop,
    waterDemand_mm: waterDemand,
    expectedRain_mm: expectedRain,
    waterDeficit_mm: waterDeficit,
    nitrogenDelta_kg_ha: nitrogenDelta,
    batteryDelta_pct: batteryDelta,
    notes,
    statusBadge
  };
}

export interface EvaluatedSequence {
  crops: Crop[];
  seasons: SeasonCropAllocation[];
  initialBatteryScore: number;
  soilBatteryScore: number;
  waterSavingsPct: number;
  netNitrogenDelta: number;
  projectedProfitIndex: number;
  compositeScore: number;
  totalDeficit: number;
  totalWaterDemand: number;
  hasDeepRootCoverCrop: boolean;
  hasHighNLegume: boolean;
  hasModerateDroughtInDrySeason: boolean;
  maxDrySeasonDeficit: number;
  hasConsecutiveDoubleCereal: boolean;
  hasTripleMonoculture: boolean;
}

/**
 * Evaluasi satu kombinasi 4 tanaman secara menyeluruh
 */
export function evaluateCropSequence(
  sequence: Crop[],
  climate: ClimateData,
  soil: SoilData,
  priorities: Priorities
): EvaluatedSequence {
  // Base soil battery: 40 + (20 * SOC%)
  const initialBattery = Math.min(100, Math.max(15, Math.round(40 + (20 * soil.soc))));
  let runningBattery = initialBattery;

  const seasonsAllocations: SeasonCropAllocation[] = [];
  let totalDeficit = 0;
  let totalWaterDemand = 0;
  let totalNitrogenDelta = 0;
  let totalProfit = 0;
  let maxDrySeasonDeficit = 0;
  let hasModerateDroughtInDrySeason = false;
  let hasDeepRootCoverCrop = false;
  let hasHighNLegume = false;
  let hasConsecutiveDoubleCereal = false;
  let hasTripleMonoculture = false;

  for (let i = 0; i < 4; i++) {
    const seasonDef = SEASONS[i];
    const crop = sequence[i];
    const prevCrop = i > 0 ? sequence[i - 1] : null;

    if (crop.category === 'Cover Crop' || (crop.root_depth_cm >= 80 && crop.soil_carbon_input === 'Very High')) {
      hasDeepRootCoverCrop = true;
    }
    if (crop.category === 'Legume' && crop.nitrogen_fixation_kg_ha >= 40) {
      hasHighNLegume = true;
    }

    if (seasonDef.isDrySeason) {
      if (crop.drought_tolerance === 'Moderate' || crop.drought_tolerance === 'Low') {
        hasModerateDroughtInDrySeason = true;
      }
    }

    if (prevCrop && crop.category === 'Cereal' && prevCrop.category === 'Cereal') {
      hasConsecutiveDoubleCereal = true;
    }

    if (i >= 2 && crop.id === sequence[i - 1].id && crop.id === sequence[i - 2].id) {
      hasTripleMonoculture = true;
    }

    const alloc = evaluateSeasonCrop(crop, seasonDef, climate, soil, prevCrop);
    seasonsAllocations.push(alloc);

    runningBattery = Math.min(100, Math.max(10, runningBattery + alloc.batteryDelta_pct));
    totalDeficit += alloc.waterDeficit_mm;
    totalWaterDemand += alloc.waterDemand_mm;
    totalNitrogenDelta += alloc.nitrogenDelta_kg_ha;
    totalProfit += crop.economic_profit_index;

    if (seasonDef.isDrySeason && alloc.waterDeficit_mm > maxDrySeasonDeficit) {
      maxDrySeasonDeficit = alloc.waterDeficit_mm;
    }
  }

  const finalBattery = Math.round(runningBattery);
  const avgProfit = Math.round(totalProfit / 4);

  // Estimasi penghematan air dibanding baseline monokultur (450mm x 4 = 1800mm)
  const baselineWaterDemand = 1800;
  const waterSavingsPct = Math.max(5, Math.min(60, Math.round(((baselineWaterDemand - totalWaterDemand) / baselineWaterDemand) * 100)));

  // Skor Komposit
  const totalWeight = (priorities.profitWeight + priorities.waterWeight + priorities.soilWeight) || 100;
  const wP = priorities.profitWeight / totalWeight;
  const wW = priorities.waterWeight / totalWeight;
  const wS = priorities.soilWeight / totalWeight;

  const waterScore = Math.max(0, 100 - (totalDeficit / 2.5));
  const composite = Math.round((wP * avgProfit) + (wW * waterScore) + (wS * finalBattery));

  return {
    crops: sequence,
    seasons: seasonsAllocations,
    initialBatteryScore: initialBattery,
    soilBatteryScore: finalBattery,
    waterSavingsPct,
    netNitrogenDelta: totalNitrogenDelta,
    projectedProfitIndex: avgProfit,
    compositeScore: composite,
    totalDeficit,
    totalWaterDemand,
    hasDeepRootCoverCrop,
    hasHighNLegume,
    hasModerateDroughtInDrySeason,
    maxDrySeasonDeficit,
    hasConsecutiveDoubleCereal,
    hasTripleMonoculture
  };
}

/**
 * Generator Kombinasi 4 Musim (Kombinatorial Permutasi)
 * Menghasilkan hingga N^4 kombinasi (misal 6^4 = 1296) dan mengevaluasi semuanya.
 */
export function generateAllSequencePermutations(
  cropsLibrary: Crop[],
  climate: ClimateData,
  soil: SoilData,
  priorities: Priorities
): EvaluatedSequence[] {
  // Batasi kandidat maksimal 7 komoditas teratas jika pustaka sangat besar untuk menjaga eksekusi < 10ms
  const crops = cropsLibrary.length > 8 ? cropsLibrary.slice(0, 8) : cropsLibrary;
  const n = crops.length;
  const results: EvaluatedSequence[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        for (let l = 0; l < n; l++) {
          const seq = [crops[i], crops[j], crops[k], crops[l]];
          results.push(evaluateCropSequence(seq, climate, soil, priorities));
        }
      }
    }
  }

  return results;
}

/**
 * Mengubah EvaluatedSequence terpilih menjadi RotationPlan formal
 */
function toRotationPlan(
  evaluated: EvaluatedSequence,
  pathwayId: 'A' | 'B' | 'C',
  title: string,
  subtitle: string,
  description: string,
  badges: string[]
): RotationPlan {
  return {
    pathwayId,
    title,
    subtitle,
    description,
    seasons: evaluated.seasons,
    soilBatteryScore: evaluated.soilBatteryScore,
    initialBatteryScore: evaluated.initialBatteryScore,
    waterSavingsPct: evaluated.waterSavingsPct,
    netNitrogenDelta: evaluated.netNitrogenDelta,
    projectedProfitIndex: evaluated.projectedProfitIndex,
    compositeScore: evaluated.compositeScore,
    recommendationBadges: badges
  };
}

/**
 * Optimization Engine Utama: Menghasilkan 3 Rekomendasi Skenario Optimal (Pathway A, B, C)
 * Menggunakan pencarian kombinatorial multi-objektif dari 1296 permutasi.
 */
export function generateOptimizationPlans(
  cropsLibrary: Crop[],
  climate: ClimateData,
  soil: SoilData,
  priorities: Priorities
): Record<'A' | 'B' | 'C', RotationPlan> {
  const allPermutations = generateAllSequencePermutations(cropsLibrary, climate, soil, priorities);

  // -------------------------------------------------------------
  // PATHWAY A: Max Soil Regeneration
  // Syarat PRD: Wajib menyisipkan minimal satu Cover Crop berakar dalam
  // dan minimal satu Legume pengikat N tinggi.
  // Optimasi: Memaksimalkan kenaikan Baterai Tanah, Net Nitrogen, dan diversitas biomasa.
  // -------------------------------------------------------------
  const candidatesA = allPermutations.filter(
    p => p.hasDeepRootCoverCrop && p.hasHighNLegume && !p.hasTripleMonoculture
  );

  const poolA = candidatesA.length > 0 ? candidatesA : allPermutations;
  const bestA = poolA.slice().sort((a, b) => {
    // Skor prioritas pemulihan tanah: bobot tinggi pada battery delta & nitrogen delta
    const scoreA = (a.soilBatteryScore * 2.0) + (a.netNitrogenDelta * 0.4) + (a.compositeScore * 0.4) - (a.hasConsecutiveDoubleCereal ? 25 : 0);
    const scoreB = (b.soilBatteryScore * 2.0) + (b.netNitrogenDelta * 0.4) + (b.compositeScore * 0.4) - (b.hasConsecutiveDoubleCereal ? 25 : 0);
    return scoreB - scoreA;
  })[0] || allPermutations[0];

  const batteryGainA = bestA.soilBatteryScore - bestA.initialBatteryScore;
  const badgesA = [
    `Baterai Tanah ${batteryGainA >= 0 ? '+' : ''}${batteryGainA}%`,
    `Fiksasi N Kumulatif: ${bestA.netNitrogenDelta > 0 ? '+' : ''}${bestA.netNitrogenDelta} kg/ha`,
    'Pemecah Lapisan Padas & Biomasa'
  ];

  const pathwayA = toRotationPlan(
    bestA,
    'A',
    'Pathway A: Pemulihan Total Tanah',
    'Max Soil Regeneration & Bio-Battery Recharge',
    'Dirancang untuk meregenerasi bahan organik tanah (SOC), menambah pasokan nitrogen alami bebas pupuk kimia sintetis, dan memutus siklus hama melalui rotasi legum serta penutup tanah berakar dalam.',
    badgesA
  );

  // -------------------------------------------------------------
  // PATHWAY B: Drought Resilience
  // Syarat PRD: Tidak boleh ada tanaman moderate drought tolerance di musim kering (Jun-Okt).
  // Optimasi: Meminimalkan defisit air, memaksimalkan ketahanan El-Nino dan penghematan air.
  // -------------------------------------------------------------
  const candidatesB = allPermutations.filter(
    p => !p.hasModerateDroughtInDrySeason && !p.hasTripleMonoculture
  );

  const poolB = candidatesB.length > 0 ? candidatesB : allPermutations;

  const bestB = poolB.slice().sort((a, b) => {
    // Skor ketahanan kekeringan: minimalkan total defisit & maksimalkan penghematan air
    const scoreA = (a.waterSavingsPct * 2.5) + (100 - a.totalDeficit / 3.0) + (a.compositeScore * 0.3);
    const scoreB = (b.waterSavingsPct * 2.5) + (100 - b.totalDeficit / 3.0) + (b.compositeScore * 0.3);
    return scoreB - scoreA;
  })[0] || allPermutations[0];

  const badgesB = [
    `Hemat Air ${bestB.waterSavingsPct}%`,
    'Tahan Kemarau Ekstrem (El-Nino)',
    bestB.totalDeficit < 180 ? 'Defisit Sangat Rendah' : 'Aman Batas SMAP'
  ];

  const pathwayB = toRotationPlan(
    bestB,
    'B',
    'Pathway B: Benteng Anti Kemarau',
    'Drought Resilience & Water-Saving Guard',
    'Dirancang khusus untuk meminimalkan risiko gagal panen akibat kelangkaan air tanah. Menempatkan tanaman tahan kering berakar dalam pada puncak kemarau dan menghemat cadangan air perakaran.',
    badgesB
  );

  // -------------------------------------------------------------
  // PATHWAY C: Cash-Flow Optimized
  // Syarat PRD: Memaksimalkan nilai economic_profit_index tertinggi yang masih
  // lolos batas toleransi air tanah dan menjaga kesehatan dasar tanah.
  // Optimasi: Memaksimalkan arus kas kuartalan dengan profit index tertinggi.
  // -------------------------------------------------------------
  const candidatesC = allPermutations.filter(
    p => p.soilBatteryScore >= 30 && !p.hasTripleMonoculture
  );

  const poolC = candidatesC.length > 0 ? candidatesC : allPermutations;
  const bestC = poolC.slice().sort((a, b) => {
    // Prioritas utama: projectedProfitIndex tertinggi
    const scoreA = (a.projectedProfitIndex * 4.0) + (a.compositeScore * 0.5) - (a.totalDeficit * 0.05);
    const scoreB = (b.projectedProfitIndex * 4.0) + (b.compositeScore * 0.5) - (b.totalDeficit * 0.05);
    return scoreB - scoreA;
  })[0] || allPermutations[0];

  const badgesC = [
    `Indeks Profit ${bestC.projectedProfitIndex}/100`,
    'Pendapatan Kas Kuartalan Tinggi',
    'Permintaan Pasar Tinggi'
  ];

  const pathwayC = toRotationPlan(
    bestC,
    'C',
    'Pathway C: Arus Kas Maksimal',
    'Cash-Flow Optimized & Market Yield',
    'Fokus mengoptimalkan hasil panen dan pendapatan tunai petani dengan komoditas bernilai jual tinggi yang diselingi legum berharga pasar stabil tanpa merusak ambang batas biofisik tanah.',
    badgesC
  );

  return {
    A: pathwayA,
    B: pathwayB,
    C: pathwayC
  };
}
