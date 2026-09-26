/**
 * Menghitung Evapotranspirasi Acuan Potensial (ET0) menggunakan metode Hargreaves-Samani / NASA POWER Radiation.
 * 
 * @param tmin Suhu minimum harian (°C)
 * @param tmax Suhu maksimum harian (°C)
 * @param solarRadiationMJ Radiasi matahari permukaan harian (MJ/m²/hari dari ALLSKY_SFC_SW_DWN)
 * @returns ET0 dalam mm/hari
 */
export function calculateDailyET0(
  tmin: number,
  tmax: number,
  solarRadiationMJ: number
): number {
  const tmean = (tmax + tmin) / 2;
  const deltaT = Math.max(0.5, tmax - tmin);
  
  // Konversi radiasi matahari MJ/m²/hari ke satuan setara penguapan air (1 MJ/m²/hari ≈ 0.408 mm/hari)
  const radiationEquivalentMm = solarRadiationMJ * 0.408;

  // Formula Hargreaves-Samani terkalibrasi radiasi permukaan:
  // ET0 = 0.0023 * Ra * (Tmean + 17.8) * sqrt(DeltaT)
  const et0 = 0.0023 * radiationEquivalentMm * (tmean + 17.8) * Math.sqrt(deltaT);

  // Batas realistis untuk wilayah tropis Indonesia (biasanya 2.5 - 6.5 mm/hari)
  return Math.max(1.8, Math.min(7.5, Math.round(et0 * 10) / 10));
}

/**
 * Menghitung Kebutuhan Air Tanaman (ETc) untuk periode tertentu
 * ETc = ET0 * Kc
 */
export function calculateCropWaterRequirement(
  dailyET0: number,
  growthDurationDays: number,
  kcMid: number
): number {
  // Rata-rata tertimbang Kc selama siklus tanam (fase awal, vegetatif/mid, pematangan)
  // Kc_rataan ≈ 0.85 * kcMid
  const averageKc = kcMid * 0.88;
  const totalWaterMm = dailyET0 * growthDurationDays * averageKc;
  return Math.round(totalWaterMm);
}
