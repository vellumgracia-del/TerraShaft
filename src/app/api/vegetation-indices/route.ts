import { NextResponse } from 'next/server';
import { getAppEnv } from '@/lib/env';
import {
  buildCompositeVegetation,
  computeLandsatNdvi,
  computeSentinel2Ndvi,
  scaleModisIndex
} from '@/lib/vegetation';
import {
  LandsatObservation,
  ModisObservation,
  Sentinel2Observation,
  VegetationData
} from '@/types/vegetation';

const vegetationCache = new Map<string, { data: VegetationData; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

function setBoundedVegetationCache(key: string, data: VegetationData, now: number) {
  if (vegetationCache.size >= MAX_CACHE_SIZE && !vegetationCache.has(key)) {
    for (const [k, v] of vegetationCache.entries()) {
      if (now - v.timestamp >= CACHE_TTL_MS) {
        vegetationCache.delete(k);
      }
    }
    if (vegetationCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = vegetationCache.keys().next().value;
      if (oldestKey !== undefined) {
        vegetationCache.delete(oldestKey);
      }
    }
  }
  vegetationCache.set(key, { data, timestamp: now });
}

interface StacFeature {
  id: string;
  properties?: {
    datetime?: string;
    'start_datetime'?: string;
    'eo:cloud_cover'?: number;
    platform?: string;
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function queryLatestStacItem(
  stacUrl: string,
  body: Record<string, unknown>,
  timeoutMs: number
): Promise<StacFeature | null> {
  const res = await fetchWithTimeout(
    `${stacUrl}/search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    timeoutMs
  );
  if (!res.ok) return null;
  const json = await res.json();
  return Array.isArray(json.features) && json.features.length > 0 ? json.features[0] : null;
}

async function queryPointValues(
  dataUrl: string,
  lon: number,
  lat: number,
  collection: string,
  itemId: string,
  assets: string[],
  timeoutMs: number
): Promise<number[] | null> {
  const params = new URLSearchParams({ collection, item: itemId });
  for (const asset of assets) {
    params.append('assets', asset);
  }
  const url = `${dataUrl}/item/point/${lon},${lat}?${params.toString()}`;
  const res = await fetchWithTimeout(url, { method: 'GET' }, timeoutMs);
  if (!res.ok) return null;
  const json = await res.json();
  return Array.isArray(json.values) ? json.values : null;
}

async function fetchSentinel2(
  stacUrl: string,
  dataUrl: string,
  lat: number,
  lon: number,
  timeoutMs: number
): Promise<Sentinel2Observation> {
  const empty: Sentinel2Observation = {
    available: false,
    sceneId: null,
    acquisitionDate: null,
    cloudCoverPct: null,
    ndvi: null,
    redReflectance: null,
    nirReflectance: null,
    resolutionMeters: 10
  };
  try {
    const item = await queryLatestStacItem(
      stacUrl,
      {
        collections: ['sentinel-2-l2a'],
        intersects: { type: 'Point', coordinates: [lon, lat] },
        limit: 1,
        query: { 'eo:cloud_cover': { lt: 35 } }
      },
      timeoutMs
    );
    if (!item) return empty;
    const values = await queryPointValues(
      dataUrl,
      lon,
      lat,
      'sentinel-2-l2a',
      item.id,
      ['B04', 'B08'],
      timeoutMs
    );
    if (!values || values.length < 2) return empty;
    const [b04, b08] = values;
    const ndvi = computeSentinel2Ndvi(b04, b08);
    if (ndvi === null) return empty;
    return {
      available: true,
      sceneId: item.id,
      acquisitionDate: item.properties?.datetime ?? null,
      cloudCoverPct:
        typeof item.properties?.['eo:cloud_cover'] === 'number'
          ? Math.round(item.properties['eo:cloud_cover'] * 10) / 10
          : null,
      ndvi,
      redReflectance: Math.round(b04),
      nirReflectance: Math.round(b08),
      resolutionMeters: 10
    };
  } catch {
    return empty;
  }
}

async function fetchLandsat(
  stacUrl: string,
  dataUrl: string,
  lat: number,
  lon: number,
  timeoutMs: number
): Promise<LandsatObservation> {
  const empty: LandsatObservation = {
    available: false,
    sceneId: null,
    platform: null,
    acquisitionDate: null,
    cloudCoverPct: null,
    ndvi: null,
    redReflectance: null,
    nirReflectance: null,
    resolutionMeters: 30
  };
  try {
    const item = await queryLatestStacItem(
      stacUrl,
      {
        collections: ['landsat-c2-l2'],
        intersects: { type: 'Point', coordinates: [lon, lat] },
        limit: 1,
        query: {
          'eo:cloud_cover': { lt: 35 },
          platform: { in: ['landsat-8', 'landsat-9'] }
        }
      },
      timeoutMs
    );
    if (!item) return empty;
    const values = await queryPointValues(
      dataUrl,
      lon,
      lat,
      'landsat-c2-l2',
      item.id,
      ['red', 'nir08'],
      timeoutMs
    );
    if (!values || values.length < 2) return empty;
    const [redDn, nirDn] = values;
    const ndvi = computeLandsatNdvi(redDn, nirDn);
    if (ndvi === null) return empty;
    return {
      available: true,
      sceneId: item.id,
      platform: item.properties?.platform ?? null,
      acquisitionDate: item.properties?.datetime ?? null,
      cloudCoverPct:
        typeof item.properties?.['eo:cloud_cover'] === 'number'
          ? Math.round(item.properties['eo:cloud_cover'] * 10) / 10
          : null,
      ndvi,
      redReflectance: Math.round((redDn * 0.0000275 - 0.2) * 10000) / 10000,
      nirReflectance: Math.round((nirDn * 0.0000275 - 0.2) * 10000) / 10000,
      resolutionMeters: 30
    };
  } catch {
    return empty;
  }
}

async function fetchModis(
  stacUrl: string,
  dataUrl: string,
  lat: number,
  lon: number,
  timeoutMs: number
): Promise<ModisObservation> {
  const empty: ModisObservation = {
    available: false,
    sceneId: null,
    acquisitionDate: null,
    ndvi: null,
    evi: null,
    resolutionMeters: 250
  };
  try {
    const item = await queryLatestStacItem(
      stacUrl,
      {
        collections: ['modis-13Q1-061'],
        intersects: { type: 'Point', coordinates: [lon, lat] },
        limit: 1
      },
      timeoutMs
    );
    if (!item) return empty;
    const values = await queryPointValues(
      dataUrl,
      lon,
      lat,
      'modis-13Q1-061',
      item.id,
      ['250m_16_days_NDVI', '250m_16_days_EVI'],
      timeoutMs
    );
    if (!values || values.length < 2) return empty;
    const ndvi = scaleModisIndex(values[0]);
    const evi = scaleModisIndex(values[1]);
    if (ndvi === null) return empty;
    return {
      available: true,
      sceneId: item.id,
      acquisitionDate: item.properties?.['start_datetime'] ?? item.properties?.datetime ?? null,
      ndvi,
      evi,
      resolutionMeters: 250
    };
  } catch {
    return empty;
  }
}

export async function GET(request: Request) {
  const env = getAppEnv();
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (latStr === null || lonStr === null || latStr.trim() === '' || lonStr.trim() === '') {
    return NextResponse.json(
      { error: 'Parameter koordinat tidak lengkap: lat dan lon wajib diisi' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Koordinat latitude (-90 hingga 90) atau longitude (-180 hingga 180) tidak valid' },
      { status: 400 }
    );
  }

  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const now = Date.now();

  if (vegetationCache.has(cacheKey)) {
    const cached = vegetationCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }
  }

  const [sentinel2, landsat, modis] = await Promise.all([
    fetchSentinel2(
      env.planetaryComputerStacUrl,
      env.planetaryComputerDataUrl,
      lat,
      lon,
      env.earthObservationTimeoutMs
    ),
    fetchLandsat(
      env.planetaryComputerStacUrl,
      env.planetaryComputerDataUrl,
      lat,
      lon,
      env.earthObservationTimeoutMs
    ),
    fetchModis(
      env.planetaryComputerStacUrl,
      env.planetaryComputerDataUrl,
      lat,
      lon,
      env.earthObservationTimeoutMs
    )
  ]);

  const result = buildCompositeVegetation(sentinel2, landsat, modis, new Date().toISOString());
  if (result.source === 'PLANETARY_COMPUTER_LIVE') {
    setBoundedVegetationCache(cacheKey, result, now);
  }

  return NextResponse.json({ ...result, cached: false });
}
