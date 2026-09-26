import { NextResponse } from 'next/server';
import { ClimateData, MonthlyClimate } from '@/types/climate';
import { calculateDailyET0 } from '@/lib/evapotranspiration';

// In-Memory Cache untuk menghindari repetitive calls
const climateCache = new Map<string, { data: ClimateData; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Jam

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat') || '-10.1542'; // Default: Kupang Timur, NTT
  const lonStr = searchParams.get('lon') || '123.8210';

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  if (climateCache.has(cacheKey)) {
    const cached = climateCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.data, cached: true });
    }
  }

  try {
    // Ambil data 1 tahun terakhir dari NASA POWER API
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1;
    const start = `${startYear}0101`;
    const end = `${startYear}1231`;

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,ALLSKY_SFC_SW_DWN,GWETROOT&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

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

    for (const [dateStr, precVal] of precEntries) {
      const monthIdx = parseInt(dateStr.substring(4, 6), 10) - 1;
      if (monthIdx < 0 || monthIdx > 11) continue;

      const rain = precVal >= 0 ? precVal : 0;
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

    const climateResult: ClimateData = {
      annualRainfall_mm: annualRain,
      monthlyData,
      rootZoneSoilMoisture: avgRootZoneMoisture,
      soilWetnessCategory: wetnessCat,
      avgTemp_c: avgTemp,
      source: 'NASA_POWER_LIVE',
      lastUpdated: new Date().toISOString()
    };

    climateCache.set(cacheKey, { data: climateResult, timestamp: now });
    return NextResponse.json(climateResult);
  } catch (error) {
    console.warn('NASA POWER API fetch error, using robust Indonesian agro-climate fallback:', error);
    // Fallback data terkalibrasi Nusa Tenggara / lahan kering Indonesia
    const fallback = generateFallbackClimate(lat, lon);
    return NextResponse.json(fallback);
  }
}

function generateFallbackClimate(lat: number, lon: number): ClimateData {
  // Kalibrasi realistis: NTT / Jawa Timur bagian selatan memiliki curah hujan 800 - 1400 mm
  const isSouthernDryzone = lat < -8.0;
  const baseRain = isSouthernDryzone
    ? [210, 190, 140, 75, 30, 15, 10, 5, 8, 35, 110, 185]
    : [280, 260, 210, 130, 70, 45, 35, 25, 40, 95, 180, 245];

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthlyData: MonthlyClimate[] = baseRain.map((rain, idx) => {
    const isDryMonth = idx >= 5 && idx <= 8;
    const tmin = isDryMonth ? 21.5 : 24.0;
    const tmax = isDryMonth ? 33.5 : 31.0;
    const tmean = (tmin + tmax) / 2;
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
  const rootZone = isSouthernDryzone ? 0.28 : 0.48;

  return {
    annualRainfall_mm: totalRain,
    monthlyData,
    rootZoneSoilMoisture: rootZone,
    soilWetnessCategory: isSouthernDryzone ? 'Deficit' : 'Adequate',
    avgTemp_c: 27.2,
    source: 'FALLBACK_CLIMATOLOGY',
    lastUpdated: new Date().toISOString()
  };
}
