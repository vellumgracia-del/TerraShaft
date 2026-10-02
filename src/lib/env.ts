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
  nasaPowerTimeoutMs: number;
  soilGridsTimeoutMs: number;
  isricSoilGridsTimeoutMs: number;
  appName: string;
  defaultLocation: string;
}

const DEFAULT_NASA_POWER_BASE = 'https://power.larc.nasa.gov/api';
const DEFAULT_SOILGRIDS_BASE = 'https://rest.isric.org/soilgrids/v2.0';
const DEFAULT_TIMEOUT_MS = 8000;

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

  const parseTimeout = (raw: string | undefined, defaultVal: number): number => {
    if (!raw) return defaultVal;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 1000 || parsed > 60000 ? defaultVal : parsed;
  };

  const nasaPowerTimeoutMs = parseTimeout(process.env.NASA_POWER_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const soilGridsTimeoutMs = parseTimeout(process.env.ISRIC_SOILGRIDS_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'TerraShaft';
  const defaultLocation = process.env.NEXT_PUBLIC_DEFAULT_LOCATION || 'Kupang Timur';

  return {
    dataMode,
    enableDemoPreview,
    nasaPowerBaseUrl,
    soilGridsBaseUrl,
    isricSoilGridsBaseUrl: soilGridsBaseUrl,
    nasaPowerTimeoutMs,
    soilGridsTimeoutMs,
    isricSoilGridsTimeoutMs: soilGridsTimeoutMs,
    appName,
    defaultLocation
  };
}
