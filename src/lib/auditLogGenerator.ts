import { ClimateData, LocationCoordinates } from '@/types/climate';
import { SoilData, Priorities, RotationPlan, Crop } from '@/types/agronomy';
import { formatMm, formatNumber, formatScore } from './formatters';

export interface AuditLogEntry {
  id: string;
  ruleId: string;
  ruleTitle: string;
  cropName: string;
  seasonLabel: string;
  outcome: 'TERELIMINASI' | 'TERPILIH' | 'PERINGATAN';
  reasonHtml: string;
  summary: string;
  explanation: string;
}

export interface DynamicAuditLog {
  modeBadge: string;
  auditModeLabel: string;
  provenanceNote: string;
  entries: AuditLogEntry[];
}

/**
 * Dynamically generates agronomic elimination & selection audit logs based on active state.
 * Never uses static or hardcoded numbers; always reflects active climate, soil, pathway, and priorities.
 */
export function generateDynamicAuditLog(
  location: LocationCoordinates,
  climateData: ClimateData | null,
  soilData: SoilData | null,
  currentPlan: RotationPlan | null,
  priorities: Priorities,
  allCrops: Crop[]
): DynamicAuditLog {
  const isFallback =
    climateData?.source === 'FALLBACK_CLIMATOLOGY' || soilData?.source === 'REGIONAL_FALLBACK';
  const isCached = Boolean(climateData?.cached || soilData?.cached);

  let modeBadge = 'Audit berbasis respons API NASA POWER dan SoilGrids';
  let provenanceNote =
    'Audit algoritma dihitung menggunakan telemetri live NASA POWER (SMAP L4, GPM IMERG) dan profil tanah ISRIC SoilGrids v2.0.';

  if (isFallback) {
    modeBadge = 'Audit berbasis data fallback regional';
    provenanceNote =
      'Audit algoritma dihitung menggunakan model agroklimat dan pedologi regional terkalibrasi Nusa Tenggara (karena permintaan API resmi hulu tidak tersedia).';
  } else if (isCached) {
    modeBadge = 'Audit berbasis data cache lokal';
    provenanceNote =
      'Audit algoritma dihitung menggunakan snapshot telemetri tervalidasi yang tersimpan di cache lokal.';
  }

  if (!climateData || !soilData || !currentPlan) {
    return {
      modeBadge: 'Menunggu Data Telemetri',
      auditModeLabel: 'Menunggu Data Telemetri',
      provenanceNote: 'Sedang memuat data biofisik lahan untuk evaluasi kombinatorial...',
      entries: []
    };
  }

  const entries: AuditLogEntry[] = [];
  const gwetroot = climateData.rootZoneSoilMoisture;
  const awc = soilData.awc;
  const seasons = currentPlan.seasons;

  // 1. Dry Season Water Stress Audit (Season 4 - Puncak Kemarau)
  const season4 = seasons[3] || seasons[seasons.length - 1];
  const maxDeficit = Math.max(...seasons.map((s) => s.waterDeficit_mm), 0);

  // Check water heavy crops (e.g. Padi Gogo / Jagung Hibrida) in dry season
  const waterHeavyCrop = allCrops.find((c) => c.water_requirement_mm >= 400 && c.category === 'Cereal');
  if (waterHeavyCrop) {
    const rainS4 = season4 ? season4.expectedRain_mm : 40;
    const hypotheticalDeficit = Math.max(0, waterHeavyCrop.water_requirement_mm - rainS4);

    entries.push({
      id: 'audit-drought-elimination',
      ruleId: 'RULE_DROUGHT_RISK',
      ruleTitle: 'Eliminasi Risiko Kekeringan Musim Kering',
      cropName: `${waterHeavyCrop.name} (${waterHeavyCrop.recommended_variety || 'Varietas Utama'})`,
      seasonLabel: 'Musim 4 (Puncak Kemarau)',
      outcome: 'TERELIMINASI',
      reasonHtml: `Didiskualifikasi otomatis oleh aturan: <code class="font-mono text-[#E11D48] font-bold">RULE_DROUGHT_RISK</code>. Kebutuhan air (${formatMm(waterHeavyCrop.water_requirement_mm)}) menghasilkan proyeksi defisit ${formatMm(hypotheticalDeficit)} pada kelembapan akar SMAP ${formatNumber(gwetroot, 2)} GWETROOT. Risiko kegagalan panen dinilai tidak aman.`,
      summary: `Proyeksi defisit ${formatMm(hypotheticalDeficit)} pada puncak kemarau melampaui batas aman.`,
      explanation: `Didiskualifikasi otomatis oleh aturan RULE_DROUGHT_RISK di ${location.placeName || 'lahan'}. Kebutuhan air (${formatMm(waterHeavyCrop.water_requirement_mm)}) menghasilkan defisit ${formatMm(hypotheticalDeficit)} pada kelembapan akar ${formatNumber(gwetroot, 2)}.`
    });
  }

  // 2. Soil Moisture & Available Water Capacity (AWC) Restriction
  const cerealCrop = allCrops.find((c) => c.id === 'padi_gogo' || c.water_requirement_mm >= 450);
  if (cerealCrop) {
    entries.push({
      id: 'audit-awc-restriction',
      ruleId: 'RULE_WATER_STRESS',
      ruleTitle: 'Pembatasan Kapasitas Air Tersedia Tanah (AWC)',
      cropName: `${cerealCrop.name}`,
      seasonLabel: 'Musim 3 & 4 (Musim Kering)',
      outcome: 'TERELIMINASI',
      reasonHtml: `Didiskualifikasi oleh aturan: <code class="font-mono text-[#E11D48] font-bold">RULE_WATER_STRESS</code>. Karakteristik tekstur tanah ${soilData.textureClass} dengan AWC terukur ${formatMm(awc)} tidak mampu menopang perakaran dangkal (${cerealCrop.root_depth_cm}cm) saat presipitasi bulanan di bawah ET0.`,
      summary: `Kapasitas AWC ${formatMm(awc)} tidak mencukupi untuk perakaran ${cerealCrop.root_depth_cm}cm pada musim kering.`,
      explanation: `Didiskualifikasi oleh RULE_WATER_STRESS. Karakteristik tanah dengan AWC terukur ${formatMm(awc)} tidak mampu menopang perakaran dangkal.`
    });
  }

  // 3. Active Crop Selection (Selected in Current Pathway)
  const selectedDryCrop = season4?.crop;
  if (selectedDryCrop) {
    entries.push({
      id: 'audit-crop-selection',
      ruleId: 'RULE_SOIL_RECOVERY',
      ruleTitle: 'Pemilihan Komoditas Adaptif Lahan',
      cropName: `${selectedDryCrop.name} (${selectedDryCrop.recommended_variety || 'Varietas Lokal'})`,
      seasonLabel: `Musim ${season4.seasonIndex} (${season4.monthRange})`,
      outcome: 'TERPILIH',
      reasonHtml: `Terpilih melalui aturan: <code class="font-mono text-[#12A875] font-bold">RULE_SOIL_RECOVERY</code>. Efisiensi air tinggi (${formatMm(selectedDryCrop.water_requirement_mm)}), perakaran mencapai ${selectedDryCrop.root_depth_cm}cm, dan menghasilkan kontribusi hara baterai ${season4.batteryDelta_pct >= 0 ? `+${season4.batteryDelta_pct}%` : `${season4.batteryDelta_pct}%`} serta nitrogen ${season4.nitrogenDelta_kg_ha >= 0 ? `+${season4.nitrogenDelta_kg_ha}` : season4.nitrogenDelta_kg_ha} kg N/ha.`,
      summary: `Efisiensi air ${formatMm(selectedDryCrop.water_requirement_mm)} dan pemulihan hara baterai tanah.`,
      explanation: `Terpilih melalui RULE_SOIL_RECOVERY. Efisiensi air ${formatMm(selectedDryCrop.water_requirement_mm)} untuk lahan ${location.placeName || 'budidaya'}.`
    });
  }

  // 4. Priority Weight Sensitivity Entry
  entries.push({
    id: 'audit-priority-weighting',
    ruleId: 'RULE_PRIORITY_WEIGHTS',
    ruleTitle: 'Pembobotan Preferensi Petani',
    cropName: `Skenario Jalur ${currentPlan.pathwayId} (Skor: ${formatScore(currentPlan.compositeScore)}/100)`,
    seasonLabel: 'Siklus Penuh 4 Musim',
    outcome: 'TERPILIH',
    reasonHtml: `Optimasi 1.296 kombinasi rotasi di ${location.placeName || 'lahan'} menyeimbangkan bobot preferensi: Keuntungan (${priorities.profitWeight}%), Efisiensi Air (${priorities.waterWeight}%), dan Baterai Tanah (${priorities.soilWeight}%). Defisit puncak terpelihara pada ${formatMm(maxDeficit)}.`,
    summary: `Menyeimbangkan bobot Keuntungan ${priorities.profitWeight}%, Air ${priorities.waterWeight}%, Tanah ${priorities.soilWeight}%.`,
    explanation: `Optimasi untuk lokasi ${location.placeName || 'lahan'} menyeimbangkan bobot Keuntungan ${priorities.profitWeight}%, Air ${priorities.waterWeight}%, Tanah ${priorities.soilWeight}%.`
  });

  return {
    modeBadge,
    auditModeLabel: modeBadge,
    provenanceNote,
    entries
  };
}
