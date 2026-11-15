/**
 * TerraShaft Precision Formatters & Agronomic Utilities
 * Ensures consistent scientific representation, uncertainty labeling, and numerical precision.
 */

export interface WaterStatusInfo {
  status: 'Tidak ada defisit' | 'Defisit ringan' | 'Defisit sedang' | 'Defisit kritis';
  label: string;
  description: string;
  subLabel: string;
  isCritical: boolean;
  colorClass: string;
  badgeClass: string;
}

export interface StructuredSeasonInfo {
  seasonIndex: number;
  seasonNumber: number;
  seasonLabel: string;
  seasonName: string;
  monthRange: string;
  formalPeriod: string;
}

// Map internal icon identifiers to friendly visual emoji
export const CROP_ICON_MAP: Record<string, string> = {
  wheat: '🌾',
  corn: '🌽',
  bean: '🫘',
  sprout: '🌱',
  plant: '🌿',
  flower: '🌼',
  root: '🍠',
  leaf: '🥬',
  grain: '🌾'
};

export function getCropEmoji(iconStr?: string): string {
  if (!iconStr) return '🌱';
  const clean = iconStr.trim().toLowerCase();
  return CROP_ICON_MAP[clean] || iconStr;
}

export function formatNumber(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Number(value).toFixed(decimals);
}

export function formatMm(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0.0 mm';
  return `${Number(value).toFixed(decimals)} mm`;
}

export function formatPercentage(value: number | undefined | null, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatKgPerHa(value: number | undefined | null, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '0 kg N/ha';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${Number(value).toFixed(decimals)} kg N/ha`;
}

export function formatCoordinate(lat: number, lon?: number): string {
  if (lon !== undefined) {
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
  }
  return lat.toFixed(4);
}

export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null || isNaN(score)) return '0';
  return Math.round(score).toString();
}

/**
 * Classifies seasonal water deficit according to agronomic thresholds
 * Deficit 0mm = Tidak ada defisit
 * Deficit 1-40mm = Defisit ringan (terkompensasi AWC)
 * Deficit 41-100mm = Defisit sedang (butuh irigasi hemat / mulsa)
 * Deficit >100mm = Defisit kritis (ambang stres kekeringan berat)
 */
export function getWaterStatusDetails(
  deficitMm: number,
  locale: 'en' | 'id' = 'id'
): WaterStatusInfo {
  const isEn = locale === 'en';
  if (deficitMm <= 0.05) {
    const s = 'Tidak ada defisit' as const;
    return {
      status: s,
      label: isEn ? 'No deficit' : s,
      description: isEn
        ? 'Precipitation meets crop water demand'
        : 'Presipitasi mencukupi kebutuhan air tanaman',
      subLabel: isEn ? 'No water deficit' : 'Tidak ada defisit air',
      isCritical: false,
      colorClass: 'text-[#00C2CC]',
      badgeClass: 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
    };
  }
  if (deficitMm <= 40) {
    const s = 'Defisit ringan' as const;
    return {
      status: s,
      label: isEn ? 'Mild deficit' : s,
      description: isEn
        ? `${formatMm(deficitMm)} deficit buffered by soil AWC`
        : `Defisit ${formatMm(deficitMm)} masih dalam batas cadangan air tanah`,
      subLabel: isEn ? `Mild deficit · ${formatMm(deficitMm)}` : `Defisit ringan · ${formatMm(deficitMm)}`,
      isCritical: false,
      colorClass: 'text-[#00C2CC]',
      badgeClass: 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
    };
  }
  if (deficitMm <= 100) {
    const s = 'Defisit sedang' as const;
    return {
      status: s,
      label: isEn ? 'Moderate deficit' : s,
      description: isEn
        ? `${formatMm(deficitMm)} deficit approaching crop tolerance threshold`
        : `Defisit ${formatMm(deficitMm)} mendekati ambang toleransi tanaman`,
      subLabel: isEn
        ? `Moderate deficit · ${formatMm(deficitMm)}`
        : `Defisit sedang · ${formatMm(deficitMm)}`,
      isCritical: false,
      colorClass: 'text-[#C1C7CD]',
      badgeClass: 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A]'
    };
  }
  const s = 'Defisit kritis' as const;
  return {
    status: s,
    label: isEn ? 'Critical deficit' : s,
    description: isEn
      ? `${formatMm(deficitMm)} deficit exceeds 100 mm critical stress threshold`
      : `Defisit ${formatMm(deficitMm)} melampaui ambang kritis 100 mm`,
    subLabel: isEn ? `Critical deficit · ${formatMm(deficitMm)}` : `Defisit kritis · ${formatMm(deficitMm)}`,
    isCritical: true,
    colorClass: 'text-[#F87171]',
    badgeClass: 'bg-[#2D1B1E] text-[#F87171] border-[#7F1D1D]/40'
  };
}

export function getStructuredSeason(
  seasonIndex: number,
  rawName?: string,
  rawRange?: string,
  locale: 'en' | 'id' = 'id'
): StructuredSeasonInfo {
  const isEn = locale === 'en';
  switch (seasonIndex) {
    case 1: {
      const range = rawRange || 'Nov – Feb';
      const defaultName = isEn ? 'Primary Wet Season' : 'Hujan Utama (Rendeng)';
      return {
        seasonIndex: 1,
        seasonNumber: 1,
        seasonLabel: isEn ? 'Season 1' : 'Musim 1',
        seasonName: isEn ? translateSeasonNameEn(rawName) || defaultName : rawName || defaultName,
        monthRange: range,
        formalPeriod: isEn ? `Season 1: ${range}` : `Musim 1: ${range} (Rendeng)`
      };
    }
    case 2: {
      const range = rawRange || (isEn ? 'Mar – May' : 'Mar – Mei');
      const defaultName = isEn ? 'Early Transition' : 'Peralihan Awal (Gadu 1)';
      return {
        seasonIndex: 2,
        seasonNumber: 2,
        seasonLabel: isEn ? 'Season 2' : 'Musim 2',
        seasonName: isEn ? translateSeasonNameEn(rawName) || defaultName : rawName || defaultName,
        monthRange: range,
        formalPeriod: isEn ? `Season 2: ${range}` : `Musim 2: ${range} (Gadu 1)`
      };
    }
    case 3: {
      const range = rawRange || (isEn ? 'Jun – Aug' : 'Jun – Agu');
      const defaultName = isEn ? 'Early Dry Season' : 'Kemarau Awal (Gadu 2)';
      return {
        seasonIndex: 3,
        seasonNumber: 3,
        seasonLabel: isEn ? 'Season 3' : 'Musim 3',
        seasonName: isEn ? translateSeasonNameEn(rawName) || defaultName : rawName || defaultName,
        monthRange: range,
        formalPeriod: isEn ? `Season 3: ${range}` : `Musim 3: ${range} (Kemarau Awal)`
      };
    }
    case 4:
    default: {
      const range = rawRange || (isEn ? 'Sep – Oct' : 'Sep – Okt');
      const defaultName = isEn ? 'Peak Dry / Cover Window' : 'Puncak Kemarau (Bera / Cover Crop)';
      return {
        seasonIndex: 4,
        seasonNumber: 4,
        seasonLabel: isEn ? 'Season 4' : 'Musim 4',
        seasonName: isEn ? translateSeasonNameEn(rawName) || defaultName : rawName || defaultName,
        monthRange: range,
        formalPeriod: isEn ? `Season 4: ${range}` : `Musim 4: ${range} (Puncak Kemarau)`
      };
    }
  }
}

function translateSeasonNameEn(rawName?: string): string | undefined {
  if (!rawName) return undefined;
  if (rawName.includes('Hujan Utama')) return 'Primary Wet Season';
  if (rawName.includes('Peralihan Awal')) return 'Early Transition';
  if (rawName.includes('Kemarau Awal')) return 'Early Dry Season';
  if (rawName.includes('Puncak Kemarau')) return 'Peak Dry / Cover Window';
  return rawName;
}
