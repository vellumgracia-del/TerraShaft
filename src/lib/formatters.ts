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
export function getWaterStatusDetails(deficitMm: number): WaterStatusInfo {
  if (deficitMm <= 0.05) {
    const s = 'Tidak ada defisit' as const;
    return {
      status: s,
      label: s,
      description: 'Presipitasi mencukupi kebutuhan air tanaman',
      subLabel: 'Tidak ada defisit air',
      isCritical: false,
      colorClass: 'text-[#12A875]',
      badgeClass: 'bg-[#E7F5EE] text-[#12A875] border-[#A7F3D0]'
    };
  }
  if (deficitMm <= 40) {
    const s = 'Defisit ringan' as const;
    return {
      status: s,
      label: s,
      description: `Defisit ${formatMm(deficitMm)} masih dalam batas cadangan air tanah`,
      subLabel: `Defisit ringan · ${formatMm(deficitMm)}`,
      isCritical: false,
      colorClass: 'text-[#0284C7]',
      badgeClass: 'bg-[#EAF5F4] text-[#0284C7] border-[#BAE6FD]'
    };
  }
  if (deficitMm <= 100) {
    const s = 'Defisit sedang' as const;
    return {
      status: s,
      label: s,
      description: `Defisit ${formatMm(deficitMm)} mendekati ambang toleransi tanaman`,
      subLabel: `Defisit sedang · ${formatMm(deficitMm)}`,
      isCritical: false,
      colorClass: 'text-[#D97706]',
      badgeClass: 'bg-[#FFF4D8] text-[#D97706] border-[#FDE68A]'
    };
  }
  const s = 'Defisit kritis' as const;
  return {
    status: s,
    label: s,
    description: `Defisit ${formatMm(deficitMm)} melampaui ambang kritis 100 mm`,
    subLabel: `Defisit kritis · ${formatMm(deficitMm)}`,
    isCritical: true,
    colorClass: 'text-[#E11D48]',
    badgeClass: 'bg-[#FDEAEA] text-[#E11D48] border-[#FECDD3]'
  };
}

export function getStructuredSeason(
  seasonIndex: number,
  rawName?: string,
  rawRange?: string
): StructuredSeasonInfo {
  switch (seasonIndex) {
    case 1:
      return {
        seasonIndex: 1,
        seasonNumber: 1,
        seasonLabel: 'Musim 1',
        seasonName: rawName || 'Hujan Utama (Rendeng)',
        monthRange: rawRange || 'Nov – Feb',
        formalPeriod: 'Musim 1: Nov – Feb (Rendeng)'
      };
    case 2:
      return {
        seasonIndex: 2,
        seasonNumber: 2,
        seasonLabel: 'Musim 2',
        seasonName: rawName || 'Peralihan Awal (Gadu 1)',
        monthRange: rawRange || 'Mar – Mei',
        formalPeriod: 'Musim 2: Mar – Mei (Gadu 1)'
      };
    case 3:
      return {
        seasonIndex: 3,
        seasonNumber: 3,
        seasonLabel: 'Musim 3',
        seasonName: rawName || 'Kemarau Awal (Gadu 2)',
        monthRange: rawRange || 'Jun – Agu',
        formalPeriod: 'Musim 3: Jun – Agu (Kemarau Awal)'
      };
    case 4:
    default:
      return {
        seasonIndex: 4,
        seasonNumber: 4,
        seasonLabel: 'Musim 4',
        seasonName: rawName || 'Puncak Kemarau (Bera / Cover Crop)',
        monthRange: rawRange || 'Sep – Okt',
        formalPeriod: 'Musim 4: Sep – Okt (Puncak Kemarau)'
      };
  }
}
