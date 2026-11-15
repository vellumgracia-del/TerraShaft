/**
 * TerraShaft Multispectral Vegetation Telemetry Types
 * Covers live satellite observations from ESA Copernicus Sentinel-2,
 * NASA/USGS Landsat Collection 2 L2, and NASA MODIS/VIIRS (MOD13Q1/MYD13Q1).
 */

export type VegetationCoverClass =
  | 'Bare / Fallow'
  | 'Sparse / Stressed'
  | 'Moderate Canopy'
  | 'Dense Vegetation';

export interface Sentinel2Observation {
  available: boolean;
  sceneId: string | null;
  acquisitionDate: string | null;
  cloudCoverPct: number | null;
  ndvi: number | null;
  redReflectance: number | null;
  nirReflectance: number | null;
  resolutionMeters: 10;
}

export interface LandsatObservation {
  available: boolean;
  sceneId: string | null;
  platform: string | null;
  acquisitionDate: string | null;
  cloudCoverPct: number | null;
  ndvi: number | null;
  redReflectance: number | null;
  nirReflectance: number | null;
  resolutionMeters: 30;
}

export interface ModisObservation {
  available: boolean;
  sceneId: string | null;
  acquisitionDate: string | null;
  ndvi: number | null;
  evi: number | null;
  resolutionMeters: 250;
}

export interface VegetationData {
  source: 'PLANETARY_COMPUTER_LIVE' | 'FALLBACK_VEGETATION';
  cached?: boolean;
  compositeNdvi: number;
  primarySensor: 'Sentinel-2' | 'Landsat' | 'MODIS' | 'Fallback';
  coverClass: VegetationCoverClass;
  sentinel2: Sentinel2Observation;
  landsat: LandsatObservation;
  modis: ModisObservation;
  fetchedAt: string;
}
