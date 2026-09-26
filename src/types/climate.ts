export interface MonthlyClimate {
  month: number;
  monthName: string;
  rainfall_mm: number;
  tmin_c: number;
  tmax_c: number;
  tmean_c: number;
  solar_radiation_mj: number;
  et0_mm: number;
}

export interface ClimateData {
  annualRainfall_mm: number;
  monthlyData: MonthlyClimate[];
  rootZoneSoilMoisture: number; // 0.0 - 1.0 (GWETROOT / SMAP proxy)
  soilWetnessCategory: 'Very Dry' | 'Deficit' | 'Adequate' | 'Saturated';
  avgTemp_c: number;
  source: 'NASA_POWER_LIVE' | 'FALLBACK_CLIMATOLOGY';
  lastUpdated: string;
}

export interface LocationCoordinates {
  lat: number;
  lon: number;
  placeName: string;
  district?: string;
  province?: string;
}
