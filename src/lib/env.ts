/**
 * TerraShaft Environment Configuration & Validation Module
 * Secure, safe, and typed configuration with zero secret leakage.
 */

export interface AppEnvConfig {
  dataMode: 'api' | 'demo';
  enableDemoPreview: boolean;
  nasaPowerBaseUrl: string;
  soilGridsBaseUrl: string;
  isricSoilGridsBaseUrl: string;
  planetaryComputerStacUrl: string;
  planetaryComputerDataUrl: string;
  nasaPowerTimeoutMs: number;
  soilGridsTimeoutMs: number;
  isricSoilGridsTimeoutMs: number;
  earthObservationTimeoutMs: number;
  appName: string;
  defaultLocation: string;
  geminiApiKey: string;
  deepseekApiKey: string;
  deepseekModel: string;
}

const DEFAULT_NASA_POWER_BASE = 'https://power.larc.nasa.gov/api';
const DEFAULT_SOILGRIDS_BASE = 'https://rest.isric.org/soilgrids/v2.0';
const DEFAULT_PC_STAC_BASE = 'https://planetarycomputer.microsoft.com/api/stac/v1';
const DEFAULT_PC_DATA_BASE = 'https://planetarycomputer.microsoft.com/api/data/v1';
const DEFAULT_TIMEOUT_MS = 15000;

export function getAppEnv(): AppEnvConfig {
  const rawMode = process.env.NEXT_PUBLIC_DATA_MODE?.trim().toLowerCase();
  const dataMode: 'api' | 'demo' = rawMode === 'demo' ? 'demo' : 'api';

  const enableDemoPreview = process.env.NEXT_PUBLIC_ENABLE_DEMO_PREVIEW === 'true';

  const nasaPowerBaseUrl = (
    process.env.NASA_POWER_API_BASE_URL || DEFAULT_NASA_POWER_BASE
  ).replace(/\/+$/, '');

  const soilGridsBaseUrl = (
    process.env.ISRIC_SOILGRIDS_API_BASE_URL || DEFAULT_SOILGRIDS_BASE
  ).replace(/\/+$/, '');

  const planetaryComputerStacUrl = (
    process.env.PLANETARY_COMPUTER_STAC_URL || DEFAULT_PC_STAC_BASE
  ).replace(/\/+$/, '');

  const planetaryComputerDataUrl = (
    process.env.PLANETARY_COMPUTER_DATA_URL || DEFAULT_PC_DATA_BASE
  ).replace(/\/+$/, '');

  const parseTimeout = (raw: string | undefined, defaultVal: number): number => {
    if (!raw) return defaultVal;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1000 || parsed > 60000 ? defaultVal : parsed;
  };

  const nasaPowerTimeoutMs = parseTimeout(process.env.NASA_POWER_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const soilGridsTimeoutMs = parseTimeout(process.env.ISRIC_SOILGRIDS_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const earthObservationTimeoutMs = parseTimeout(
    process.env.EARTH_OBSERVATION_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS
  );

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'TerraShaft';
  const defaultLocation = process.env.NEXT_PUBLIC_DEFAULT_LOCATION || 'Kupang Timur';

  return {
    dataMode,
    enableDemoPreview,
    nasaPowerBaseUrl,
    soilGridsBaseUrl,
    isricSoilGridsBaseUrl: soilGridsBaseUrl,
    planetaryComputerStacUrl,
    planetaryComputerDataUrl,
    nasaPowerTimeoutMs,
    soilGridsTimeoutMs,
    isricSoilGridsTimeoutMs: soilGridsTimeoutMs,
    earthObservationTimeoutMs,
    appName,
    defaultLocation,
    geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY?.trim() || '',
    deepseekModel: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-flash'
  };
}
