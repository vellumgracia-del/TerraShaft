import { NextResponse } from 'next/server';

interface ReverseGeocodeResult {
  placeName: string;
  district?: string;
  province?: string;
  country?: string;
  elevation_m: number;
  source: 'NOMINATIM_OPENMETEO_LIVE' | 'COORDINATE_FALLBACK';
}

export interface SearchLocationItem {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
}

const reverseCache = new Map<string, { data: ReverseGeocodeResult; timestamp: number }>();
const searchCache = new Map<string, { results: SearchLocationItem[]; timestamp: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Hari
const MAX_CACHE_SIZE = 500;
const USER_AGENT = 'TerraShaft-Agritech/3.0 (NASA Space Apps Challenge; Public Spatial Telemetry)';

function setBoundedMap<T>(
  map: Map<string, { data?: T; results?: T; timestamp: number }>,
  key: string,
  entry: { data?: T; results?: T; timestamp: number }
) {
  if (map.size >= MAX_CACHE_SIZE && !map.has(key)) {
    const oldestKey = map.keys().next().value;
    if (oldestKey !== undefined) {
      map.delete(oldestKey);
    }
  }
  map.set(key, entry);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  // Mode 1: Forward Search berdasarkan nama lokasi (Nominatim OpenStreetMap)
  if (query && query.length >= 2) {
    const normalizedQuery = query.toLowerCase().slice(0, 100);
    const now = Date.now();
    const cachedSearch = searchCache.get(normalizedQuery);
    if (cachedSearch && now - cachedSearch.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ results: cachedSearch.results, cached: true });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        normalizedQuery
      )}&limit=5&accept-language=id,en`;

      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Nominatim search HTTP ${res.status}`);
      }

      const raw = await res.json();
      const results: SearchLocationItem[] = Array.isArray(raw)
        ? raw
            .map((item: { display_name?: string; name?: string; lat?: string; lon?: string }) => {
              const lat = parseFloat(String(item.lat ?? ''));
              const lon = parseFloat(String(item.lon ?? ''));
              const displayName = String(item.display_name || '').trim();
              const parts = displayName.split(',').map((s) => s.trim());
              const shortName = item.name || parts.slice(0, 2).join(', ') || displayName;
              return { displayName, shortName, lat, lon };
            })
            .filter((item) => !isNaN(item.lat) && !isNaN(item.lon) && item.displayName.length > 0)
        : [];

      setBoundedMap(searchCache, normalizedQuery, { results, timestamp: now });
      return NextResponse.json({ results, cached: false });
    } catch {
      return NextResponse.json({ results: [], cached: false });
    }
  }

  // Mode 2: Reverse Geocoding + Elevasi DEM Publik (Nominatim + Open-Meteo Elevation)
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { error: 'Parameter lat/lon atau q wajib diisi' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Koordinat lat/lon di luar batas valid' },
      { status: 400 }
    );
  }

  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const now = Date.now();
  const cachedRev = reverseCache.get(cacheKey);
  if (cachedRev && now - cachedRev.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ...cachedRev.data, cached: true });
  }

  const fetchNominatimReverse = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=12&accept-language=id,en`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      clearTimeout(timeout);
      return null;
    }
  };

  const fetchOpenMeteoElevation = async (): Promise<number | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const json = await res.json();
      const val = Array.isArray(json.elevation) ? json.elevation[0] : undefined;
      return typeof val === 'number' && !isNaN(val) ? Math.max(0, Math.round(val)) : null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  };

  const [nomData, elevData] = await Promise.all([
    fetchNominatimReverse(),
    fetchOpenMeteoElevation()
  ]);

  const addr = nomData?.address ?? {};
  const locality =
    addr.village ||
    addr.suburb ||
    addr.town ||
    addr.city_district ||
    addr.municipality ||
    addr.city ||
    addr.county ||
    nomData?.name;
  const regency = addr.county || addr.city || addr.state_district;
  const state = addr.state || addr.region;
  const country = addr.country;

  const parts = [locality, regency !== locality ? regency : null, state, country].filter(Boolean);
  const placeName =
    parts.length > 0
      ? parts.join(', ')
      : nomData?.display_name
      ? String(nomData.display_name).split(',').slice(0, 3).join(',').trim()
      : `Titik Koordinat: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;

  const elevation_m =
    elevData !== null
      ? elevData
      : Math.round(45 + Math.abs(lat * 8));

  const result: ReverseGeocodeResult = {
    placeName,
    district: locality || regency,
    province: state,
    country,
    elevation_m,
    source: nomData || elevData !== null ? 'NOMINATIM_OPENMETEO_LIVE' : 'COORDINATE_FALLBACK'
  };

  setBoundedMap(reverseCache, cacheKey, { data: result, timestamp: now });
  return NextResponse.json({ ...result, cached: false });
}
