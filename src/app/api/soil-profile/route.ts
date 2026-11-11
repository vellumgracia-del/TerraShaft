import { NextResponse } from 'next/server';
import { SoilData } from '@/types/agronomy';
import { calculateAWC, classifySoilTexture } from '@/lib/pedotransfer';

import { getAppEnv } from '@/lib/env';

const soilCache = new Map<string, { data: SoilData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Hari
const MAX_CACHE_SIZE = 500;

function setBoundedSoilCache(key: string, data: SoilData, now: number) {
  if (soilCache.size >= MAX_CACHE_SIZE && !soilCache.has(key)) {
    for (const [k, v] of soilCache.entries()) {
      if (now - v.timestamp >= CACHE_TTL_MS) {
        soilCache.delete(k);
      }
    }
    if (soilCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = soilCache.keys().next().value;
      if (oldestKey !== undefined) {
        soilCache.delete(oldestKey);
      }
    }
  }
  soilCache.set(key, { data, timestamp: now });
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

  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  if (soilCache.has(cacheKey)) {
    const cached = soilCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }
  }

  try {
    const queryParams = [
      `lat=${lat}`,
      `lon=${lon}`,
      'property=clay',
      'property=sand',
      'property=silt',
      'property=soc',
      'property=phh2o',
      'property=cec',
      'depth=0-5cm',
      'depth=5-15cm',
      'depth=15-30cm',
      'value=mean'
    ].join('&');
    const url = `${env.soilGridsBaseUrl}/properties/query?${queryParams}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.soilGridsTimeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 2592000 } // 30 hari
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ISRIC SoilGrids HTTP ${response.status}`);
    }

    const json = await response.json();
    const layers = json.properties?.layers;

    if (!layers || !Array.isArray(layers) || layers.length === 0) {
      throw new Error('Format respon ISRIC SoilGrids tidak sesuai');
    }

    // Helper untuk mengekstrak nilai mean 0-30cm (mendukung label langsung 0-30cm maupun rata-rata tertimbang 0-5, 5-15, 15-30cm)
    const extractMean = (propName: string, defaultValue: number): { value: number; hasRealValue: boolean } => {
      const layer = layers.find((l: { name: string }) => l.name === propName);
      const depths: Array<{ label: string; values?: { mean?: number | null } }> = layer?.depths ?? [];

      const direct = depths.find((d) => d.label === '0-30cm')?.values?.mean;
      if (typeof direct === 'number' && !isNaN(direct)) {
        return { value: direct, hasRealValue: true };
      }

      const depthWeights: Record<string, number> = {
        '0-5cm': 5,
        '5-15cm': 10,
        '15-30cm': 15
      };

      let weightedSum = 0;
      let totalWeight = 0;
      for (const d of depths) {
        const w = depthWeights[d.label];
        const val = d.values?.mean;
        if (w && typeof val === 'number' && !isNaN(val)) {
          weightedSum += val * w;
          totalWeight += w;
        }
      }

      if (totalWeight > 0) {
        return { value: weightedSum / totalWeight, hasRealValue: true };
      }

      return { value: defaultValue, hasRealValue: false };
    };

    // Konversi Satuan sesuai PRD:
    // clay, sand, silt: g/kg / 10 = %
    const clayRes = extractMean('clay', 280);
    const sandRes = extractMean('sand', 420);
    const siltRes = extractMean('silt', 300);
    const socRes = extractMean('soc', 120);     // dg/kg
    const phRes = extractMean('phh2o', 65);     // pH * 10
    const cecRes = extractMean('cec', 180);     // mmol(c)/kg

    if (!clayRes.hasRealValue && !sandRes.hasRealValue && !siltRes.hasRealValue) {
      throw new Error('Data observasi daratan ISRIC SoilGrids kosong untuk titik koordinat ini');
    }

    const clayRaw = clayRes.value;
    const sandRaw = sandRes.value;
    const siltRaw = siltRes.value;
    const socRaw = socRes.value;
    const phRaw = phRes.value;
    const cecRaw = cecRes.value;

    let clay = Math.round((clayRaw / 10) * 10) / 10;
    let sand = Math.round((sandRaw / 10) * 10) / 10;
    let silt = Math.round((siltRaw / 10) * 10) / 10;
    const soc = Math.round((socRaw / 100) * 100) / 100;
    const ph = Math.round((phRaw / 10) * 10) / 10;
    const cec = Math.round((cecRaw / 10) * 10) / 10;

    // Normalisasi persentase tekstur jika total != 100
    const textureSum = clay + sand + silt;
    if (textureSum > 0 && Math.abs(textureSum - 100) > 1) {
      clay = Math.round((clay / textureSum) * 100);
      sand = Math.round((sand / textureSum) * 100);
      silt = Math.max(0, 100 - clay - sand);
    }

    const awc = calculateAWC(sand, silt, clay, soc);
    const textureClass = classifySoilTexture(sand, silt, clay);
    const nowIso = new Date().toISOString();

    const soilResult: SoilData = {
      sand,
      clay,
      silt,
      soc,
      ph,
      cec,
      awc,
      textureClass,
      source: 'ISRIC_SOILGRIDS_LIVE',
      fetchedAt: nowIso,
      cached: false,
      fallbackReason: null,
      observationPeriod: 'Standard Depth Layer 0-30cm (ISRIC SoilGrids v2.0)'
    };

    setBoundedSoilCache(cacheKey, soilResult, now);
    return NextResponse.json(soilResult);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'ISRIC SoilGrids API timeout / network failure';
    console.warn('ISRIC SoilGrids fetch failed, using calibrated regional soil fallback:', error);
    const fallback = generateFallbackSoil(lat, lon, errorMsg);
    return NextResponse.json(fallback);
  }
}

function generateFallbackSoil(
  lat: number,
  lon: number,
  fallbackReason: string | null = 'Koneksi ISRIC SoilGrids tidak tersedia / timeout (failover model regional)'
): SoilData {
  // Karakteristik tanah terkalibrasi regional berdasarkan zona lintang & geografi
  const absLat = Math.abs(lat);
  const isEasternIslands = lat < -8.0 && lat > -15.0 && lon > 115.0 && lon < 135.0;
  const isSubtropicalDryland = absLat >= 20.0; // California, Punjab, Murray-Darling, Sahel utara

  const sand = isSubtropicalDryland ? 44.0 : isEasternIslands ? 36.0 : 38.0;
  const silt = isSubtropicalDryland ? 32.0 : isEasternIslands ? 30.0 : 32.0;
  const clay = isSubtropicalDryland ? 24.0 : isEasternIslands ? 34.0 : 30.0;
  const soc = isSubtropicalDryland ? 0.95 : isEasternIslands ? 1.05 : 1.15;
  const ph = isSubtropicalDryland ? 7.1 : isEasternIslands ? 6.7 : 6.4;
  const cec = isSubtropicalDryland ? 17.5 : isEasternIslands ? 21.0 : 19.5;
  const awc = calculateAWC(sand, silt, clay, soc);
  const textureClass = classifySoilTexture(sand, silt, clay);
  const nowIso = new Date().toISOString();

  return {
    sand,
    clay,
    silt,
    soc,
    ph,
    cec,
    awc,
    textureClass,
    source: 'REGIONAL_FALLBACK',
    fetchedAt: nowIso,
    cached: false,
    fallbackReason,
    observationPeriod: 'Regional Tropical Soil Profile Estimate (Depth 0-30cm)'
  };
}
