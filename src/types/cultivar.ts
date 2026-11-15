import { CropCategory, DroughtTolerance, SoilCarbonInput } from './agronomy';

export type ToleranceLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export type PhotoperiodSensitivity =
  | 'Day-Neutral (Insensitive)'
  | 'Short-Day Sensitive'
  | 'Quantitative Short-Day'
  | 'Long-Day Sensitive';

export type PhotoperiodClass =
  | 'tropical-low-seasonality'
  | 'subtropical-moderate-seasonality'
  | 'temperate-high-seasonality';

export type AgroecologicalZoneType =
  | 'arid tropical'
  | 'semi-arid tropical'
  | 'sub-humid tropical'
  | 'humid tropical'
  | 'tropical highland'
  | 'mediterranean'
  | 'semi-arid subtropical'
  | 'humid subtropical'
  | 'semi-arid temperate'
  | 'humid temperate';

export type RegistrationStatus =
  | 'National Released Cultivar'
  | 'Regional Certified Variety'
  | 'Public Landrace / Extension Standard'
  | 'Phenotype Archetype (Unverified Local Registry)';

export type AvailabilityStatus =
  | 'Verified Commercial / Extension Seed'
  | 'Regional Research / Extension Distribution'
  | 'Archetype Fallback — Verify Local Seed Registry';

export interface SoilRequirements {
  preferred_textures: string[];
  ph_min: number;
  ph_max: number;
  min_awc_mm: number;
  drainage_preference: 'Well-drained' | 'Moderately well-drained' | 'Tolerates seasonal waterlogging';
}

export interface TemperatureRangeC {
  min_c: number;
  optimal_min_c: number;
  optimal_max_c: number;
  max_c: number;
}

export interface RainfallRequirementMm {
  seasonal_min_mm: number;
  seasonal_optimal_mm: number;
  seasonal_max_mm: number;
}

/**
 * A.1 Crop Species Entity (Separated from Cultivar/Variety)
 */
export interface CropSpeciesEntity {
  species_id: string;
  legacy_crop_id: string; // Maps cleanly to legacy Crop.id for backward compatibility
  crop_type: CropCategory;
  scientific_name: string;
  common_name_en: string;
  common_name_id: string;
  maturity_group_default: string;
  growth_duration_days: number;
  drought_tolerance: DroughtTolerance;
  heat_tolerance: ToleranceLevel;
  flood_tolerance: ToleranceLevel;
  salinity_tolerance: ToleranceLevel;
  soil_requirements: SoilRequirements;
  photoperiod_sensitivity: PhotoperiodSensitivity;
  temperature_range_c: TemperatureRangeC;
  rainfall_requirement_mm: RainfallRequirementMm;
  water_requirement_mm: number;
  kc_mid: number;
  root_depth_cm: number;
  disease_pest_resistance: string[];
  nitrogen_requirement_kg_ha: number;
  nitrogen_fixation_kg_ha: number;
  soil_carbon_input: SoilCarbonInput;
  economic_profit_index: number;
  market_use: string[];
  break_pest_cycle: boolean;
  icon: string;
  archetype_label_en: string;
  archetype_label_id: string;
  species_notes_en: string;
  species_notes_id: string;
}

/**
 * A.2 Cultivar / Variety Entity (Regionally Bound & Evidence-Backed)
 */
export interface CultivarEntity {
  cultivar_id: string;
  species_id: string;
  crop_type: CropCategory;
  cultivar_name: string;
  local_common_name: string;
  local_common_name_id: string;
  scientific_name: string;
  breeding_program: string;
  maturity_group: string;
  growth_duration_days: number;
  drought_tolerance: DroughtTolerance;
  heat_tolerance: ToleranceLevel;
  flood_tolerance: ToleranceLevel;
  salinity_tolerance: ToleranceLevel;
  soil_requirements: SoilRequirements;
  photoperiod_sensitivity: PhotoperiodSensitivity;
  temperature_range_c: TemperatureRangeC;
  rainfall_requirement_mm: RainfallRequirementMm;
  water_requirement_mm: number;
  root_depth_cm: number;
  disease_pest_resistance: string[];
  nitrogen_requirement_kg_ha: number;
  nitrogen_fixation_kg_ha: number;
  market_use: string[];
  /**
   * ISO-3166 alpha-2 country codes (e.g. "ID", "KE", "US", "AU", "IN", "BR")
   * or explicit macro-region identifiers ("EAST_AFRICA", "WEST_AFRICA", "SOUTH_ASIA", "SOUTHEAST_ASIA", "NORTH_AMERICA", "LATIN_AMERICA", "MEDITERRANEAN_EUROPE").
   * Never global by default unless verified.
   */
  country_or_region_of_release: string[];
  allowed_agroecological_zones: AgroecologicalZoneType[];
  registration_status: RegistrationStatus;
  evidence_source: string;
  evidence_date: string;
  availability_status: AvailabilityStatus;
  confidence_score: number; // 0.0 to 1.0
  agronomic_notes_en: string;
  agronomic_notes_id: string;
}

/**
 * B. Normalized Global Agroecological Zone Profile
 */
export interface AgroecologicalProfile {
  country: string;
  country_code: string;
  macro_region: string;
  region: string;
  hemisphere: 'Northern' | 'Southern';
  agroecological_zone: AgroecologicalZoneType;
  elevation_m: number;
  elevation_band: 'lowland (<500m)' | 'mid-elevation (500-1200m)' | 'highland (>1200m)';
  annual_rainfall_mm: number;
  dry_season_months: number[];
  temperature_range_c: {
    annual_min_c: number;
    annual_max_c: number;
    annual_mean_c: number;
  };
  growing_degree_days_annual: number;
  soil_texture: string;
  soil_ph: number;
  soil_soc_percent: number;
  soil_cec_cmol_kg: number;
  soil_awc_mm: number;
  root_zone_moisture: number;
  photoperiod_class: PhotoperiodClass;
}

/**
 * C. Resolved Cultivar Recommendation Result with Evidence & Fallback Transparency
 */
export interface ResolvedCultivarRecommendation {
  species: CropSpeciesEntity;
  cultivar: CultivarEntity;
  is_archetype_fallback: boolean;
  fallback_reason: string | null;
  suitability_reasons_en: string[];
  suitability_reasons_id: string[];
  assumptions_en: string;
  assumptions_id: string;
  confidence_score: number; // 0.0 to 1.0
}
