import {
  LandsatObservation,
  ModisObservation,
  Sentinel2Observation,
  VegetationCoverClass,
  VegetationData
} from '@/types/vegetation';

export function classifyVegetationCover(ndvi: number): VegetationCoverClass {
  if (ndvi < 0.2) return 'Bare / Fallow';
  if (ndvi < 0.4) return 'Sparse / Stressed';
  if (ndvi < 0.6) return 'Moderate Canopy';
  return 'Dense Vegetation';
}

export function roundNdvi(val: number): number {
  const clamped = Math.max(-1, Math.min(1, val));
  return Math.round(clamped * 1000) / 1000;
}

/**
 * Sentinel-2 L2A: NDVI = (B08 - B04) / (B08 + B04)
 * Offset -1000 in processing baseline >=04.00 cancels out or is negligible for ratio,
 * standard normalized ratio directly on positive DN reflectance values.
 */
export function computeSentinel2Ndvi(b04Red: number, b08Nir: number): number | null {
  if (!Number.isFinite(b04Red) || !Number.isFinite(b08Nir)) return null;
  if (b04Red <= 0 && b08Nir <= 0) return null;
  const denom = b08Nir + b04Red;
  if (denom <= 0) return null;
  return roundNdvi((b08Nir - b04Red) / denom);
}

/**
 * Landsat Collection 2 Level-2 Surface Reflectance scale factor:
 * reflectance = DN * 0.0000275 - 0.2
 */
export function computeLandsatNdvi(redDn: number, nirDn: number): number | null {
  if (!Number.isFinite(redDn) || !Number.isFinite(nirDn)) return null;
  if (redDn <= 0 || nirDn <= 0) return null;
  const red = redDn * 0.0000275 - 0.2;
  const nir = nirDn * 0.0000275 - 0.2;
  const denom = nir + red;
  if (denom <= 0) return null;
  return roundNdvi((nir - red) / denom);
}

/**
 * MODIS MOD13Q1 / MYD13Q1 v061 scale factor: 0.0001 (valid range -2000..10000)
 */
export function scaleModisIndex(rawDn: number): number | null {
  if (!Number.isFinite(rawDn) || rawDn < -2000 || rawDn > 10000) return null;
  return roundNdvi(rawDn * 0.0001);
}

export function buildCompositeVegetation(
  sentinel2: Sentinel2Observation,
  landsat: LandsatObservation,
  modis: ModisObservation,
  fetchedAt: string
): VegetationData {
  let compositeNdvi = 0.32;
  let primarySensor: VegetationData['primarySensor'] = 'Fallback';

  if (sentinel2.available && sentinel2.ndvi !== null) {
    compositeNdvi = sentinel2.ndvi;
    primarySensor = 'Sentinel-2';
  } else if (landsat.available && landsat.ndvi !== null) {
    compositeNdvi = landsat.ndvi;
    primarySensor = 'Landsat';
  } else if (modis.available && modis.ndvi !== null) {
    compositeNdvi = modis.ndvi;
    primarySensor = 'MODIS';
  }

  const anyLive = sentinel2.available || landsat.available || modis.available;

  return {
    source: anyLive ? 'PLANETARY_COMPUTER_LIVE' : 'FALLBACK_VEGETATION',
    compositeNdvi,
    primarySensor,
    coverClass: classifyVegetationCover(compositeNdvi),
    sentinel2,
    landsat,
    modis,
    fetchedAt
  };
}
