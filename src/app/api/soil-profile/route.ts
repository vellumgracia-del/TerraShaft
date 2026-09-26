import { NextResponse } from 'next/server';
import { SoilData } from '@/types/agronomy';
import { calculateAWC, classifySoilTexture } from '@/lib/pedotransfer';

const soilCache = new Map<string, { data: SoilData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Hari

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat') || '-10.1542';
  const lonStr = searchParams.get('lon') || '123.8210';

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

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

    const soilResult: SoilData = {
      sand,
      clay,
      silt,
      soc,
      ph,
      cec,
      awc,
      textureClass
    };

    soilCache.set(cacheKey, { data: soilResult, timestamp: now });
    return NextResponse.json(soilResult);
  } catch (error) {
    console.warn('ISRIC SoilGrids fetch failed, using calibrated regional soil fallback:', error);
    const fallback = generateFallbackSoil(lat, lon);
    return NextResponse.json(fallback);
  }
}

function generateFallbackSoil(lat: number, lon: number): SoilData {
  // Karakteristik tanah lahan kering umum (Lempung Liat Berpasir / Alfisol / Vertisol)
  const sand = 38.0;
  const silt = 32.0;
  const clay = 30.0;
  const soc = 1.15; // C-Organik sedang-rendah
  const ph = 6.4;
  const cec = 19.5;
  const awc = calculateAWC(sand, silt, clay, soc);
  const textureClass = classifySoilTexture(sand, silt, clay);

  return {
    sand,
    clay,
    silt,
    soc,
    ph,
    cec,
    awc,
    textureClass
  };
}
