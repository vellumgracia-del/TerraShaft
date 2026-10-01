/**
 * Menghitung Available Water Capacity (AWC) menggunakan fungsi transfer pedologis (pedotransfer).
 * Satuan input:
 * - sand: persentase (0 - 100%)
 * - silt: persentase (0 - 100%)
 * - clay: persentase (0 - 100%)
 * - soc: Soil Organic Carbon persentase (misal: 0.8% - 3.5%)
 * 
 * Formula PRD:
 * AWC = 0.15 * Sand% + 0.35 * Silt% + 0.40 * Clay% + (1.2 * SOC%)
 * Output dalam satuan mm air per 30cm jeluk perakaran.
 */
export function calculateAWC(sand: number, silt: number, clay: number, soc: number): number {
  const awc = (0.15 * sand) + (0.35 * silt) + (0.40 * clay) + (1.2 * soc);
  return Math.max(15, Math.round(awc * 10) / 10);
}

/**
 * Menentukan klasifikasi tekstur tanah berdasarkan segitiga tekstur USDA
 */
export function classifySoilTexture(sand: number, silt: number, clay: number): string {
  if (sand + clay + silt === 0) return 'Lempung (Loam)';

  // Normalisasi jika jumlah total berbeda dari 100 karena rounding
  const total = sand + silt + clay;
  const s = (sand / total) * 100;
  const si = (silt / total) * 100;
  const c = (clay / total) * 100;

  if (c >= 40) {
    if (s >= 45) return 'Liat Berpasir (Sandy Clay)';
    if (si >= 40) return 'Liat Berdebu (Silty Clay)';
    return 'Liat (Clay)';
  } else if (c >= 27 && c < 40) {
    if (s >= 45) return 'Lempung Liat Berpasir (Sandy Clay Loam)';
    if (s <= 20) return 'Lempung Liat Berdebu (Silty Clay Loam)';
    return 'Lempung Berliat (Clay Loam)';
  } else if (c >= 7 && c < 27) {
    if (si >= 50) return 'Lempung Berdebu (Silt Loam)';
    if (s >= 52) return 'Lempung Berpasir (Sandy Loam)';
    return 'Lempung (Loam)';
  } else {
    // c < 7
    if (si >= 80) return 'Debu (Silt)';
    if (s >= 85) return 'Pasir (Sand)';
    if (s >= 70) return 'Pasir Berlempung (Loamy Sand)';
    return 'Lempung Berpasir (Sandy Loam)';
  }
}

/**
 * Estimasi Bulk Density (Kerapatan Lindak) tanah (g/cm3).
 * Tanah padat > 1.45 g/cm3 mengindikasikan adanya padas olah yang butuh akar penembus dalam (sorgum/crotalaria).
 */
export function estimateBulkDensity(soc: number): number {
  // Nilai tipikal: 1.6 - (0.12 * SOC%)
  const bd = 1.6 - (0.12 * soc);
  return Math.max(1.05, Math.min(1.7, Math.round(bd * 100) / 100));
}

/**
 * Estimasi persentase retensi air awal berdasarkan tekstur dan kelembapan SMAP (0 - 1.0)
 */
export function estimateCurrentMoistureReserve(awc: number, rootZoneSoilMoisture: number): number {
  // rootZoneSoilMoisture (0.0 - 1.0)
  return Math.round(awc * Math.max(0.1, Math.min(1.0, rootZoneSoilMoisture)));
}
