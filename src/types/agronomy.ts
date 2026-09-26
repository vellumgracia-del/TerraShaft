export type CropCategory = 'Cereal' | 'Legume' | 'Cover Crop' | 'Cereal / Forage' | 'Tuber' | 'Other';
export type DroughtTolerance = 'Low' | 'Moderate' | 'High' | 'Very High';
export type SoilCarbonInput = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Crop {
  id: string;
  name: string;
  category: CropCategory;
  growth_duration_days: number;
  water_requirement_mm: number;
  kc_mid: number;
  root_depth_cm: number;
  nitrogen_fixation_kg_ha: number;
  nitrogen_demand_kg_ha: number;
  soil_carbon_input: SoilCarbonInput;
  economic_profit_index: number; // 0 - 100
  drought_tolerance: DroughtTolerance;
  break_pest_cycle: boolean;
  icon: string;
  recommended_variety?: string;
  local_notes?: string;
  is_custom?: boolean;
}

export interface SoilData {
  sand: number; // percentage %
  clay: number; // percentage %
  silt: number; // percentage %
  soc: number;  // Soil Organic Carbon %
  ph: number;   // pH level
  cec: number;  // Cation Exchange Capacity cmol/kg
  awc: number;  // Available Water Capacity mm
  textureClass: string; // e.g. "Sandy Loam", "Clay", "Loam"
}

export interface SeasonCropAllocation {
  seasonIndex: number;
  seasonName: string;
  monthRange: string;
  crop: Crop;
  waterDemand_mm: number;
  expectedRain_mm: number;
  waterDeficit_mm: number;
  nitrogenDelta_kg_ha: number;
  batteryDelta_pct: number;
  notes: string;
  statusBadge: 'positive' | 'warning' | 'cash';
}

export interface RotationPlan {
  pathwayId: 'A' | 'B' | 'C';
  title: string;
  subtitle: string;
  description: string;
  seasons: SeasonCropAllocation[];
  soilBatteryScore: number; // 0 - 100%
  initialBatteryScore: number;
  waterSavingsPct: number;
  netNitrogenDelta: number; // kg/ha
  projectedProfitIndex: number; // 0 - 100
  compositeScore: number;
  recommendationBadges: string[];
}

export interface Priorities {
  profitWeight: number; // 0 - 100
  waterWeight: number;  // 0 - 100
  soilWeight: number;   // 0 - 100
}
