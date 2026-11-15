import { ClimateData, LocationCoordinates } from '@/types/climate';
import { SoilData } from '@/types/agronomy';
import {
  AgroecologicalProfile,
  AgroecologicalZoneType,
  PhotoperiodClass,
} from '@/types/cultivar';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  indonesia: 'ID',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  canada: 'CA',
  mexico: 'MX',
  kenya: 'KE',
  tanzania: 'TZ',
  uganda: 'UG',
  ethiopia: 'ET',
  rwanda: 'RW',
  nigeria: 'NG',
  ghana: 'GH',
  senegal: 'SN',
  india: 'IN',
  bangladesh: 'BD',
  nepal: 'NP',
  pakistan: 'PK',
  brazil: 'BR',
  brasil: 'BR',
  argentina: 'AR',
  colombia: 'CO',
  peru: 'PE',
  australia: 'AU',
  thailand: 'TH',
  vietnam: 'VN',
  philippines: 'PH',
  malaysia: 'MY',
  spain: 'ES',
  italy: 'IT',
  france: 'FR',
  germany: 'DE',
  'united kingdom': 'GB',
  japan: 'JP',
  china: 'CN',
};

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  ID: 'Indonesia',
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  KE: 'Kenya',
  TZ: 'Tanzania',
  UG: 'Uganda',
  ET: 'Ethiopia',
  RW: 'Rwanda',
  NG: 'Nigeria',
  GH: 'Ghana',
  SN: 'Senegal',
  IN: 'India',
  BD: 'Bangladesh',
  NP: 'Nepal',
  PK: 'Pakistan',
  BR: 'Brazil',
  AR: 'Argentina',
  CO: 'Colombia',
  PE: 'Peru',
  AU: 'Australia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Philippines',
  MY: 'Malaysia',
  ES: 'Spain',
  IT: 'Italy',
  FR: 'France',
  DE: 'Germany',
  GB: 'United Kingdom',
  JP: 'Japan',
  CN: 'China',
};

const COUNTRY_CODE_TO_MACRO_REGION: Record<string, string> = {
  ID: 'SOUTHEAST_ASIA',
  MY: 'SOUTHEAST_ASIA',
  TH: 'SOUTHEAST_ASIA',
  VN: 'SOUTHEAST_ASIA',
  PH: 'SOUTHEAST_ASIA',
  US: 'NORTH_AMERICA',
  CA: 'NORTH_AMERICA',
  KE: 'EAST_AFRICA',
  TZ: 'EAST_AFRICA',
  UG: 'EAST_AFRICA',
  ET: 'EAST_AFRICA',
  RW: 'EAST_AFRICA',
  NG: 'WEST_AFRICA',
  GH: 'WEST_AFRICA',
  SN: 'WEST_AFRICA',
  IN: 'SOUTH_ASIA',
  BD: 'SOUTH_ASIA',
  NP: 'SOUTH_ASIA',
  PK: 'SOUTH_ASIA',
  BR: 'LATIN_AMERICA',
  AR: 'LATIN_AMERICA',
  CO: 'LATIN_AMERICA',
  PE: 'LATIN_AMERICA',
  MX: 'LATIN_AMERICA',
  AU: 'OCEANIA',
  ES: 'MEDITERRANEAN_EUROPE',
  IT: 'MEDITERRANEAN_EUROPE',
  FR: 'EUROPE',
  DE: 'EUROPE',
  GB: 'EUROPE',
};

/**
 * Infers country code, country label, and macro-region from LocationCoordinates.
 * Uses explicit countryCode first, then Nominatim country string, then placeName tokens,
 * and falls back conservatively to coarse coordinate envelopes without assuming Indonesia globally.
 */
export function resolveRegionIdentity(location: LocationCoordinates): {
  country: string;
  countryCode: string;
  macroRegion: string;
} {
  let countryCode = location.countryCode?.trim().toUpperCase() || '';
  let country = location.country?.trim() || '';

  if (!countryCode && country) {
    const normalized = country.toLowerCase();
    countryCode = COUNTRY_NAME_TO_CODE[normalized] || '';
  }

  if (!countryCode && location.placeName) {
    const lowerPlace = location.placeName.toLowerCase();
    for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
      if (lowerPlace.includes(name)) {
        countryCode = code;
        break;
      }
    }
    // Check well-known Indonesian regional place markers only when explicitly present
    if (
      !countryCode &&
      /\b(indonesia|jawa|java|gunungkidul|ntt|ntb|sumba|kupang|madura|lampung|sulawesi|kalimantan|sumatra|lombok|bali)\b/i.test(
        lowerPlace
      )
    ) {
      countryCode = 'ID';
    }
  }

  // Coarse geospatial fallback ONLY when geocoding returned no country metadata
  if (!countryCode) {
    const { lat, lon } = location;
    if (lat >= -11.2 && lat <= 6.2 && lon >= 94.8 && lon <= 141.1) {
      countryCode = 'ID';
    } else if (lat >= 24.5 && lat <= 49.5 && lon >= -125.0 && lon <= -66.5) {
      countryCode = 'US';
    } else if (lat >= -5.0 && lat <= 5.0 && lon >= 33.5 && lon <= 42.0) {
      countryCode = 'KE';
    } else if (lat >= 6.5 && lat <= 35.5 && lon >= 68.0 && lon <= 97.5) {
      countryCode = 'IN';
    } else if (lat >= -33.8 && lat <= 5.3 && lon >= -74.0 && lon <= -34.7) {
      countryCode = 'BR';
    } else if (lat >= -44.0 && lat <= -10.0 && lon >= 112.0 && lon <= 154.0) {
      countryCode = 'AU';
    } else {
      countryCode = 'GLOBAL';
    }
  }

  if (!country) {
    country = COUNTRY_CODE_TO_NAME[countryCode] || (countryCode === 'GLOBAL' ? 'Unmapped Region' : countryCode);
  }

  let macroRegion = COUNTRY_CODE_TO_MACRO_REGION[countryCode];
  if (!macroRegion) {
    const { lat, lon } = location;
    if (lat >= -15 && lat <= 18 && lon >= 28 && lon <= 52) {
      macroRegion = 'EAST_AFRICA';
    } else if (lat >= 4 && lat <= 18 && lon >= -18 && lon <= 16) {
      macroRegion = 'WEST_AFRICA';
    } else if (lat >= 5 && lat <= 38 && lon >= 60 && lon <= 98) {
      macroRegion = 'SOUTH_ASIA';
    } else if (lat >= -12 && lat <= 22 && lon >= 92 && lon <= 142) {
      macroRegion = 'SOUTHEAST_ASIA';
    } else if (lat >= -56 && lat <= 24 && lon >= -118 && lon <= -34) {
      macroRegion = 'LATIN_AMERICA';
    } else if (lat >= 24 && lat <= 72 && lon >= -168 && lon <= -52) {
      macroRegion = 'NORTH_AMERICA';
    } else if (lat >= -46 && lat <= -9 && lon >= 110 && lon <= 180) {
      macroRegion = 'OCEANIA';
    } else if (lat >= 34 && lat <= 46 && lon >= -10 && lon <= 35) {
      macroRegion = 'MEDITERRANEAN_EUROPE';
    } else {
      macroRegion = 'GLOBAL_UNMAPPED';
    }
  }

  return { country, countryCode, macroRegion };
}

export function classifyElevationBand(
  elevationM: number
): 'lowland (<500m)' | 'mid-elevation (500-1200m)' | 'highland (>1200m)' {
  if (elevationM >= 1200) return 'highland (>1200m)';
  if (elevationM >= 500) return 'mid-elevation (500-1200m)';
  return 'lowland (<500m)';
}

export function classifyPhotoperiod(lat: number): PhotoperiodClass {
  const absLat = Math.abs(lat);
  if (absLat <= 12) return 'tropical-low-seasonality';
  if (absLat <= 28) return 'subtropical-moderate-seasonality';
  return 'temperate-high-seasonality';
}

export function classifyAgroecologicalZone(params: {
  lat: number;
  elevationM: number;
  annualRainfallMm: number;
  annualMeanC: number;
  drySeasonMonthCount: number;
  winterRainRatio: number;
}): AgroecologicalZoneType {
  const absLat = Math.abs(params.lat);
  const { elevationM, annualRainfallMm, drySeasonMonthCount, winterRainRatio } = params;

  // Tropical belt (|lat| <= 23.5)
  if (absLat <= 23.5) {
    if (elevationM >= 1200 || (elevationM >= 950 && params.annualMeanC < 21)) {
      return 'tropical highland';
    }
    if (annualRainfallMm < 400 || drySeasonMonthCount >= 9) {
      return 'arid tropical';
    }
    if (annualRainfallMm < 1050 || drySeasonMonthCount >= 5) {
      return 'semi-arid tropical';
    }
    if (annualRainfallMm < 1800 || drySeasonMonthCount >= 3) {
      return 'sub-humid tropical';
    }
    return 'humid tropical';
  }

  // Subtropical / Mediterranean belt (23.5 < |lat| <= 38)
  if (absLat <= 38) {
    if (annualRainfallMm >= 300 && annualRainfallMm <= 950 && winterRainRatio >= 0.62) {
      return 'mediterranean';
    }
    if (annualRainfallMm < 750 || drySeasonMonthCount >= 6) {
      return 'semi-arid subtropical';
    }
    return 'humid subtropical';
  }

  // Temperate belt (|lat| > 38)
  if (absLat <= 45 && annualRainfallMm <= 850 && winterRainRatio >= 0.62) {
    return 'mediterranean';
  }
  if (annualRainfallMm < 650 || drySeasonMonthCount >= 6) {
    return 'semi-arid temperate';
  }
  return 'humid temperate';
}

/**
 * Location-to-Zone Pipeline (Global Agroecological Zoning):
 * Transforms coordinates, elevation, NASA POWER climate, and ISRIC SoilGrids
 * into a normalized AgroecologicalProfile for downstream cultivar localization.
 */
export function buildAgroecologicalProfile(
  location: LocationCoordinates,
  elevationM: number,
  climate: ClimateData | null,
  soil: SoilData | null
): AgroecologicalProfile {
  const { country, countryCode, macroRegion } = resolveRegionIdentity(location);
  const region = [location.province, location.district].filter(Boolean).join(', ') || location.placeName;
  const hemisphere: 'Northern' | 'Southern' = location.lat >= 0 ? 'Northern' : 'Southern';
  const elevationBand = classifyElevationBand(elevationM);
  const photoperiodClass = classifyPhotoperiod(location.lat);

  const monthly = climate?.monthlyData ?? [];
  const annualRainfallMm =
    climate?.annualRainfall_mm ??
    (monthly.length > 0 ? Math.round(monthly.reduce((acc, m) => acc + m.rainfall_mm, 0)) : 1100);

  const drySeasonMonths =
    monthly.length > 0
      ? monthly.filter(m => m.rainfall_mm < 60).map(m => m.month)
      : [];

  const annualMinC =
    monthly.length > 0
      ? Number(Math.min(...monthly.map(m => m.tmin_c)).toFixed(1))
      : 20.0;
  const annualMaxC =
    monthly.length > 0
      ? Number(Math.max(...monthly.map(m => m.tmax_c)).toFixed(1))
      : 32.0;
  const annualMeanC =
    climate?.avgTemp_c ??
    (monthly.length > 0
      ? Number((monthly.reduce((s, m) => s + m.tmean_c, 0) / monthly.length).toFixed(1))
      : 26.0);

  // Growing Degree Days (Base 10°C, capped at 30°C effective mean proxy per month)
  const gddAnnual =
    monthly.length === 12
      ? Math.round(
          monthly.reduce((sum, m, idx) => {
            const effectiveMean = Math.min(30, m.tmean_c);
            const dailyGdd = Math.max(0, effectiveMean - 10);
            return sum + dailyGdd * (DAYS_IN_MONTH[idx] || 30);
          }, 0)
        )
      : Math.round(Math.max(0, annualMeanC - 10) * 365);

  // Winter-half rainfall share helps detect Mediterranean winter-rainfall regimes
  let winterRainRatio = 0.5;
  if (monthly.length === 12 && annualRainfallMm > 0) {
    const northernWinterMonths = [10, 11, 12, 1, 2, 3];
    const southernWinterMonths = [4, 5, 6, 7, 8, 9];
    const targetMonths = hemisphere === 'Northern' ? northernWinterMonths : southernWinterMonths;
    const winterRain = monthly
      .filter(m => targetMonths.includes(m.month))
      .reduce((sum, m) => sum + m.rainfall_mm, 0);
    winterRainRatio = winterRain / annualRainfallMm;
  }

  const aez = classifyAgroecologicalZone({
    lat: location.lat,
    elevationM,
    annualRainfallMm,
    annualMeanC,
    drySeasonMonthCount: drySeasonMonths.length,
    winterRainRatio,
  });

  return {
    country,
    country_code: countryCode,
    macro_region: macroRegion,
    region,
    hemisphere,
    agroecological_zone: aez,
    elevation_m: Math.round(elevationM),
    elevation_band: elevationBand,
    annual_rainfall_mm: Math.round(annualRainfallMm),
    dry_season_months: drySeasonMonths,
    temperature_range_c: {
      annual_min_c: annualMinC,
      annual_max_c: annualMaxC,
      annual_mean_c: annualMeanC,
    },
    growing_degree_days_annual: gddAnnual,
    soil_texture: soil?.textureClass || 'Loam (Unresolved)',
    soil_ph: soil?.ph ?? 6.2,
    soil_soc_percent: soil?.soc ?? 1.2,
    soil_cec_cmol_kg: soil?.cec ?? 14.0,
    soil_awc_mm: soil?.awc ?? 32,
    root_zone_moisture: climate?.rootZoneSoilMoisture ?? 0.5,
    photoperiod_class: photoperiodClass,
  };
}
