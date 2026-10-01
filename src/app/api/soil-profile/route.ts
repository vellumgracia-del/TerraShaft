import { NextResponse } from 'next/server';
import { SoilData } from '@/types/agronomy';
import { calculateAWC, classifySoilTexture } from '@/lib/pedotransfer';

const soilCache = new Map<string, { data: SoilData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Hari

export async function GET(request: Request) {
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
    const properties = 'clay,sand,silt,soc,phh2o,cec';
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lat=${lat}&lon=${lon}&property=${properties}&depth=0-30cm&value=mean`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

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

    if (!layers || !Array.isArray(layers)) {
      throw new Error('Format respon ISRIC SoilGrids tidak sesuai');
    }

    // Helper untuk mengekstrak nilai mean 0-30cm
    const extractMean = (propName: string, defaultValue: number): number => {
      const layer = layers.find((l: { name: string }) => l.name === propName);
      const depthData = layer?.depths?.find((d: { label: string }) => d.label === '0-30cm');
      const val = depthData?.values?.mean;
      return typeof val === 'number' ? val : defaultValue;
    };

    // Konversi Satuan sesuai PRD:
    // clay, sand, silt: g/kg / 10 = %
    const clayRaw = extractMean('clay', 280);
    const sandRaw = extractMean('sand', 420);
    const siltRaw = extractMean('silt', 300);
    const socRaw = extractMean('soc', 120);     // dg/kg
    const phRaw = extractMean('phh2o', 65);     // pH * 10
    const cecRaw = extractMean('cec', 180);     // mmol(c)/kg

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

    soilCache.set(cacheKey, { data: soilResult, timestamp: now });
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
  // Karakteristik tanah terkalibrasi regional (Nusa Tenggara / Karst / Aluvial / Lahan Kering Tropis)
  const isEasternIslands = lat < -8.0 && lon > 115.0; // NTT / NTB / Kawasan Timur
  const sand = isEasternIslands ? 36.0 : 38.0;
  const silt = isEasternIslands ? 30.0 : 32.0;
  const clay = isEasternIslands ? 34.0 : 30.0;
  const soc = isEasternIslands ? 1.05 : 1.15; // C-Organik lahan semi-arid
  const ph = isEasternIslands ? 6.7 : 6.4;
  const cec = isEasternIslands ? 21.0 : 19.5;
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
