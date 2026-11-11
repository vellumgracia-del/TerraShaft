import { NextResponse } from 'next/server';
import { ClimateData, MonthlyClimate } from '@/types/climate';
import { calculateDailyET0 } from '@/lib/evapotranspiration';

import { getAppEnv } from '@/lib/env';

// In-Memory Cache dengan batas maksimum entri untuk mencegah kebocoran memori (DoS/OOM)
const climateCache = new Map<string, { data: ClimateData; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Jam
const MAX_CACHE_SIZE = 500;

function setBoundedClimateCache(key: string, data: ClimateData, now: number) {
  if (climateCache.size >= MAX_CACHE_SIZE && !climateCache.has(key)) {
    for (const [k, v] of climateCache.entries()) {
      if (now - v.timestamp >= CACHE_TTL_MS) {
        climateCache.delete(k);
      }
    }
    if (climateCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = climateCache.keys().next().value;
      if (oldestKey !== undefined) {
        climateCache.delete(oldestKey);
      }
    }
  }
  climateCache.set(key, { data, timestamp: now });
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

  if (climateCache.has(cacheKey)) {
    const cached = climateCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }
  }

  try {
    // Ambil data 1 tahun penuh terakhir dari NASA POWER API
    const currentYear = new Date().getFullYear();
    const startYear = Math.min(currentYear - 1, 2025);
    const start = `${startYear}0101`;
    const end = `${startYear}1231`;

    const url = `${env.nasaPowerBaseUrl}/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,ALLSKY_SFC_SW_DWN,GWETROOT&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.nasaPowerTimeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 } // ISR Next.js
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`NASA POWER API HTTP ${response.status}`);
    }

    const json = await response.json();
    const params = json.properties?.parameter;

    if (!params || !params.PRECTOTCORR) {
      throw new Error('Format data parameter NASA POWER tidak valid');
    }

    // Agregasi harian menjadi 12 profil bulanan
    const monthlyRain = new Array(12).fill(0);
    const monthlyTmin = new Array(12).fill(0);
    const monthlyTmax = new Array(12).fill(0);
    const monthlyTmean = new Array(12).fill(0);
    const monthlyRad = new Array(12).fill(0);
    const monthlyGwet = new Array(12).fill(0);
    const daysInMonth = new Array(12).fill(0);

    const precEntries = Object.entries(params.PRECTOTCORR as Record<string, number>);
    let validPrecDays = 0;

    for (const [dateStr, precVal] of precEntries) {
      const monthIdx = parseInt(dateStr.substring(4, 6), 10) - 1;
      if (monthIdx < 0 || monthIdx > 11) continue;

      // Abaikan nilai fill NASA POWER (-999) agar tidak mendistorsi curah hujan menjadi 0
      if (typeof precVal !== 'number' || precVal < 0) continue;

      validPrecDays += 1;
      const rain = precVal;
      const tmin = params.T2M_MIN?.[dateStr] ?? 23;
      const tmax = params.T2M_MAX?.[dateStr] ?? 32;
      const tmean = params.T2M?.[dateStr] ?? 27;
      const rad = params.ALLSKY_SFC_SW_DWN?.[dateStr] ?? 18;
      const gwet = params.GWETROOT?.[dateStr] ?? 0.45;

      monthlyRain[monthIdx] += rain;
      monthlyTmin[monthIdx] += tmin >= -50 ? tmin : 23;
      monthlyTmax[monthIdx] += tmax >= -50 ? tmax : 32;
      monthlyTmean[monthIdx] += tmean >= -50 ? tmean : 27;
      monthlyRad[monthIdx] += rad >= 0 ? rad : 18;
      monthlyGwet[monthIdx] += gwet >= 0 ? gwet : 0.45;
      daysInMonth[monthIdx] += 1;
    }

    if (validPrecDays === 0 || (precEntries.length >= 100 && validPrecDays < precEntries.length * 0.5)) {
      throw new Error('Data observasi harian NASA POWER belum lengkap untuk periode ini (-999 fill)');
    }

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const monthlyData: MonthlyClimate[] = [];
    let annualRain = 0;
    let sumGwet = 0;
    let sumTemp = 0;

    for (let i = 0; i < 12; i++) {
      const days = Math.max(1, daysInMonth[i]);
      const avgTmin = Math.round((monthlyTmin[i] / days) * 10) / 10;
      const avgTmax = Math.round((monthlyTmax[i] / days) * 10) / 10;
      const avgTmean = Math.round((monthlyTmean[i] / days) * 10) / 10;
      const avgRad = Math.round((monthlyRad[i] / days) * 10) / 10;
      const rain = Math.round(monthlyRain[i]);
      const dailyET0 = calculateDailyET0(avgTmin, avgTmax, avgRad);
      const monthlyET0 = Math.round(dailyET0 * days);

      annualRain += rain;
      sumGwet += monthlyGwet[i] / days;
      sumTemp += avgTmean;

      monthlyData.push({
        month: i + 1,
        monthName: monthNames[i],
        rainfall_mm: rain,
        tmin_c: avgTmin,
        tmax_c: avgTmax,
        tmean_c: avgTmean,
        solar_radiation_mj: avgRad,
        et0_mm: monthlyET0
      });
    }

    const avgRootZoneMoisture = Math.round((sumGwet / 12) * 100) / 100;
    const avgTemp = Math.round((sumTemp / 12) * 10) / 10;

    let wetnessCat: 'Very Dry' | 'Deficit' | 'Adequate' | 'Saturated' = 'Adequate';
    if (avgRootZoneMoisture < 0.25) wetnessCat = 'Very Dry';
    else if (avgRootZoneMoisture < 0.45) wetnessCat = 'Deficit';
    else if (avgRootZoneMoisture > 0.85) wetnessCat = 'Saturated';

    const nowIso = new Date().toISOString();
    const climateResult: ClimateData = {
      annualRainfall_mm: annualRain,
      monthlyData,
      rootZoneSoilMoisture: avgRootZoneMoisture,
      soilWetnessCategory: wetnessCat,
      avgTemp_c: avgTemp,
      source: 'NASA_POWER_LIVE',
      lastUpdated: nowIso,
      fetchedAt: nowIso,
      cached: false,
      fallbackReason: null,
      observationPeriod: 'Historical 1-Year Baseline (NASA POWER Agroclimatology v2.0)'
    };

    setBoundedClimateCache(cacheKey, climateResult, now);
    return NextResponse.json(climateResult);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'NASA POWER API error / timeout';
    console.warn('NASA POWER API fetch error, using robust Indonesian agro-climate fallback:', error);
    // Fallback data terkalibrasi Nusa Tenggara / lahan kering Indonesia
    const fallback = generateFallbackClimate(lat, lon, errorMsg);
    return NextResponse.json(fallback);
  }
}

function generateFallbackClimate(
  lat: number,
  lon: number,
  fallbackReason: string | null = 'Koneksi NASA POWER tidak tersedia / timeout (failover model regional)'
): ClimateData {
  const isNorthernHemisphere = lat > 5.0;
  const isSubtropical = Math.abs(lat) > 20.0;
  const isSouthernDryzone = (lat < -7.0 && lon > 110.0) || isSubtropical;

  const southernDryRain = [210, 190, 140, 75, 30, 15, 10, 5, 8, 35, 110, 185];
  const southernHumidRain = [280, 260, 210, 130, 70, 45, 35, 25, 40, 95, 180, 245];
  const northernDryRain = [25, 30, 20, 15, 35, 110, 195, 180, 115, 40, 15, 20];

  const baseRain = isNorthernHemisphere
    ? northernDryRain
    : isSouthernDryzone
    ? southernDryRain
    : southernHumidRain;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const latTempOffset = isSubtropical ? -4.5 : 0;

  const monthlyData: MonthlyClimate[] = baseRain.map((rain, idx) => {
    const isDryMonth = rain < 50;
    const tmin = Math.round(((isDryMonth ? 21.5 : 24.0) + latTempOffset) * 10) / 10;
    const tmax = Math.round(((isDryMonth ? 33.5 : 31.0) + latTempOffset) * 10) / 10;
    const tmean = Math.round(((tmin + tmax) / 2) * 10) / 10;
    const rad = isDryMonth ? 21.5 : 17.5;
    const dailyET0 = calculateDailyET0(tmin, tmax, rad);
    return {
      month: idx + 1,
      monthName: monthNames[idx],
      rainfall_mm: rain,
      tmin_c: tmin,
      tmax_c: tmax,
      tmean_c: tmean,
      solar_radiation_mj: rad,
      et0_mm: Math.round(dailyET0 * 30)
    };
  });

  const totalRain = baseRain.reduce((a, b) => a + b, 0);
  const rootZone = isSouthernDryzone || isNorthernHemisphere ? 0.28 : 0.48;
  const avgTemp = Math.round((27.2 + latTempOffset) * 10) / 10;
  const nowIso = new Date().toISOString();

  return {
    annualRainfall_mm: totalRain,
    monthlyData,
    rootZoneSoilMoisture: rootZone,
    soilWetnessCategory: rootZone < 0.45 ? 'Deficit' : 'Adequate',
    avgTemp_c: avgTemp,
    source: 'FALLBACK_CLIMATOLOGY',
    lastUpdated: nowIso,
    fetchedAt: nowIso,
    cached: false,
    fallbackReason,
    observationPeriod: 'Regional Agroclimatic Normal Baseline (Nusa Tenggara)'
  };
}
