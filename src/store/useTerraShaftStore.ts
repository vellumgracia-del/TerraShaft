'use client';

import { create } from 'zustand';
import { Crop, SoilData, Priorities, RotationPlan } from '@/types/agronomy';
import { ClimateData, LocationCoordinates } from '@/types/climate';
import { VegetationData } from '@/types/vegetation';
import type { AgroecologicalProfile, ResolvedCultivarRecommendation } from '@/types/cultivar';
import { generateOptimizationPlans } from '@/lib/optimizationEngine';
import { resolveTerraShaftProvenance, TerraShaftProvenance } from '@/types/provenance';
import { buildAgroecologicalProfile } from '@/lib/agroecologicalZoning';
import { localizeCropsForRegion } from '@/lib/cultivarLocalizer';

export type AppLocale = 'en' | 'id';

interface TerraShaftState {
  // Lokasi Lahan & Telemetri
  location: LocationCoordinates;
  elevation_m: number;
  satelliteSyncTime: string;
  isFieldMode: boolean; // High-contrast outdoor mode for field agents
  
  // Data Biofisik Satelit & Tanah
  soilData: SoilData | null;
  climateData: ClimateData | null;
  vegetationData: VegetationData | null;
  isLoadingBioData: boolean;
  loadingSources: {
    nasaPower: boolean;
    soilGrids: boolean;
  };
  activeRequestId: number;
  errorBioData: string | null;
  provenance: TerraShaftProvenance;

  // Application display language ('en' default for event/demo mode, 'id' Indonesian alternative)
  locale: AppLocale;

  // Prioritas Petani / PPL
  priorities: Priorities;

  // Global Agroecological Zoning & Localized Cultivar Layer
  agroecologicalProfile: AgroecologicalProfile;
  localizedCultivars: ResolvedCultivarRecommendation[];

  // Pustaka Komoditas Tanaman (terlokalisasi per wilayah + kustom pengguna)
  crops: Crop[];

  // Hasil Optimasi 3 Skenario
  selectedPathway: 'A' | 'B' | 'C';
  plans: Record<'A' | 'B' | 'C', RotationPlan> | null;

  // Actions
  setLocale: (locale: AppLocale) => void;
  hydrateLocale: () => void;
  setLocation: (
    lat: number,
    lon: number,
    placeName?: string,
    elevation?: number,
    regionMeta?: { country?: string; countryCode?: string; district?: string; province?: string }
  ) => Promise<void>;
  fetchBioPhysicalData: (lat: number, lon: number) => Promise<void>;
  toggleFieldMode: () => void;
  setPriorities: (priorities: Partial<Priorities>) => void;
  setPriorityPreset: (preset: 'profit' | 'water' | 'soil') => void;
  setSelectedPathway: (id: 'A' | 'B' | 'C') => void;
  addCustomCrop: (crop: Omit<Crop, 'id'>) => void;
  removeCustomCrop: (id: string) => void;
  hydrateCustomCrops: () => void;
  recalculate: () => void;
  getProvenance: () => TerraShaftProvenance;
}

const CUSTOM_CROPS_STORAGE_KEY = 'terrashaft_custom_crops_v1';
const LOCALE_STORAGE_KEY = 'terrashaft_locale_v1';

// Default location: Kupang Timur, NTT (Indonesia Semi-Arid Dryland Baseline)
const DEFAULT_LOCATION: LocationCoordinates = {
  lat: -10.1542,
  lon: 123.8210,
  placeName: 'Kupang Timur, Kab. Kupang, Nusa Tenggara Timur',
  district: 'Kupang Timur',
  province: 'Nusa Tenggara Timur',
  country: 'Indonesia',
  countryCode: 'ID'
};

const INITIAL_AEZ_PROFILE = buildAgroecologicalProfile(DEFAULT_LOCATION, 85, null, null);
const INITIAL_LOCALIZED_CROPS = localizeCropsForRegion(INITIAL_AEZ_PROFILE);
const INITIAL_CULTIVAR_RESOLUTIONS = INITIAL_LOCALIZED_CROPS
  .map(c => c.cultivar_resolution)
  .filter((r): r is ResolvedCultivarRecommendation => Boolean(r));

const DEFAULT_PRIORITIES: Priorities = {
  profitWeight: 40,
  waterWeight: 35,
  soilWeight: 25
};

export const useTerraShaftStore = create<TerraShaftState>((set, get) => ({
  location: DEFAULT_LOCATION,
  elevation_m: 85,
  satelliteSyncTime: new Date().toISOString(),
  isFieldMode: true,
  soilData: null,
  climateData: null,
  vegetationData: null,
  isLoadingBioData: false,
  loadingSources: {
    nasaPower: false,
    soilGrids: false
  },
  activeRequestId: 0,
  errorBioData: null,
  provenance: resolveTerraShaftProvenance(null, null, false, null),
  locale: 'en',
  priorities: DEFAULT_PRIORITIES,
  agroecologicalProfile: INITIAL_AEZ_PROFILE,
  localizedCultivars: INITIAL_CULTIVAR_RESOLUTIONS,
  crops: INITIAL_LOCALIZED_CROPS,
  selectedPathway: 'A',
  plans: null,

  setLocale: (locale: AppLocale) => {
    // Switching display language MUST NOT modify telemetry, cultivar choices, or rotation calculations
    set({ locale });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // Ignore storage errors
      }
    }
  },

  hydrateLocale: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'en' || saved === 'id') {
        set({ locale: saved });
      }
    } catch {
      // Ignore storage errors
    }
  },

  toggleFieldMode: () => {
    set((state) => ({ isFieldMode: !state.isFieldMode }));
  },

  setLocation: async (
    lat: number,
    lon: number,
    placeName?: string,
    elevation?: number,
    regionMeta?: { country?: string; countryCode?: string; district?: string; province?: string }
  ) => {
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      const errorMsg = `Invalid coordinates (${lat}, ${lon}): Latitude must be between -90° and 90°, Longitude between -180° and 180°.`;
      set((state) => ({
        errorBioData: errorMsg,
        provenance: resolveTerraShaftProvenance(state.climateData, state.soilData, false, errorMsg)
      }));
      return;
    }

    const needsGeocode = !placeName || elevation === undefined || !regionMeta?.countryCode;

    const preliminaryLocation: LocationCoordinates = {
      lat,
      lon,
      placeName: placeName || `Resolving location (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)...`,
      district: regionMeta?.district,
      province: regionMeta?.province,
      country: regionMeta?.country,
      countryCode: regionMeta?.countryCode
    };
    const nextElevation = elevation ?? get().elevation_m;
    const preliminaryAez = buildAgroecologicalProfile(preliminaryLocation, nextElevation, get().climateData, get().soilData);
    const customOnly = get().crops.filter(c => c.is_custom);
    const preliminaryCrops = localizeCropsForRegion(preliminaryAez, customOnly);

    set({
      location: preliminaryLocation,
      elevation_m: nextElevation,
      agroecologicalProfile: preliminaryAez,
      crops: preliminaryCrops,
      localizedCultivars: preliminaryCrops
        .map(c => c.cultivar_resolution)
        .filter((r): r is ResolvedCultivarRecommendation => Boolean(r)),
      satelliteSyncTime: new Date().toISOString(),
      errorBioData: null,
      isLoadingBioData: true,
      loadingSources: { nasaPower: true, soilGrids: true }
    });

    if (needsGeocode && typeof window !== 'undefined') {
      fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
        .then(res => (res.ok ? res.json() : null))
        .then(geo => {
          if (!geo) return;
          const currentLoc = get().location;
          if (Math.abs(currentLoc.lat - lat) < 0.001 && Math.abs(currentLoc.lon - lon) < 0.001) {
            const updatedLoc: LocationCoordinates = {
              ...currentLoc,
              placeName: placeName || geo.placeName || `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
              district: regionMeta?.district || geo.district || currentLoc.district,
              province: regionMeta?.province || geo.province || currentLoc.province,
              country: regionMeta?.country || geo.country || currentLoc.country,
              countryCode: regionMeta?.countryCode || geo.countryCode || currentLoc.countryCode
            };
            const updatedElev = elevation ?? (typeof geo.elevation_m === 'number' ? geo.elevation_m : get().elevation_m);
            const updatedAez = buildAgroecologicalProfile(updatedLoc, updatedElev, get().climateData, get().soilData);
            const existingCustom = get().crops.filter(c => c.is_custom);
            const updatedCrops = localizeCropsForRegion(updatedAez, existingCustom);
            set({
              location: updatedLoc,
              elevation_m: updatedElev,
              agroecologicalProfile: updatedAez,
              crops: updatedCrops,
              localizedCultivars: updatedCrops
                .map(c => c.cultivar_resolution)
                .filter((r): r is ResolvedCultivarRecommendation => Boolean(r))
            });
            if (get().climateData && get().soilData) {
              get().recalculate();
            }
          }
        })
        .catch(() => {
          const currentLoc = get().location;
          if (!placeName && Math.abs(currentLoc.lat - lat) < 0.001 && Math.abs(currentLoc.lon - lon) < 0.001) {
            set(state => ({
              location: {
                ...state.location,
                placeName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
              }
            }));
          }
        });
    }

    await get().fetchBioPhysicalData(lat, lon);
  },

  fetchBioPhysicalData: async (lat: number, lon: number) => {
    const nextReqId = (get().activeRequestId || 0) + 1;
    set({
      activeRequestId: nextReqId,
      isLoadingBioData: true,
      errorBioData: null,
      loadingSources: { nasaPower: true, soilGrids: true },
      provenance: resolveTerraShaftProvenance(get().climateData, get().soilData, true, null, {
        nasaPower: true,
        soilGrids: true
      })
    });

    const fetchNasa = async () => {
      try {
        const res = await fetch(`/api/nasa-climate?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ClimateData = await res.json();
        if (get().activeRequestId !== nextReqId) return null;
        set(state => {
          const newLoading = { ...state.loadingSources, nasaPower: false };
          const stillLoading = newLoading.soilGrids;
          return {
            climateData: data,
            loadingSources: newLoading,
            isLoadingBioData: stillLoading,
            provenance: resolveTerraShaftProvenance(data, state.soilData, stillLoading, null, newLoading)
          };
        });

        // Auto-recheck silently if initial cold-start returned fallback
        if (data.source === 'FALLBACK_CLIMATOLOGY' && typeof window !== 'undefined') {
          setTimeout(async () => {
            if (get().activeRequestId !== nextReqId) return;
            try {
              const retryRes = await fetch(`/api/nasa-climate?lat=${lat}&lon=${lon}`);
              if (!retryRes.ok) return;
              const retryData: ClimateData = await retryRes.json();
              if (retryData.source === 'NASA_POWER_LIVE' && get().activeRequestId === nextReqId) {
                set(state => ({
                  climateData: retryData,
                  provenance: resolveTerraShaftProvenance(retryData, state.soilData, false, null)
                }));
                get().recalculate();
              }
            } catch {
              // Silently ignore
            }
          }, 3500);
        }

        return data;
      } catch (err) {
        if (get().activeRequestId !== nextReqId) return null;
        console.warn('NASA POWER fetch failed, using fallback:', err);
        set(state => {
          const newLoading = { ...state.loadingSources, nasaPower: false };
          const stillLoading = newLoading.soilGrids;
          return {
            loadingSources: newLoading,
            isLoadingBioData: stillLoading,
            provenance: resolveTerraShaftProvenance(state.climateData, state.soilData, stillLoading, null, newLoading)
          };
        });
        return null;
      }
    };

    const fetchSoil = async () => {
      try {
        const res = await fetch(`/api/soil-profile?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SoilData = await res.json();
        if (get().activeRequestId !== nextReqId) return null;
        set(state => {
          const newLoading = { ...state.loadingSources, soilGrids: false };
          const stillLoading = newLoading.nasaPower;
          return {
            soilData: data,
            loadingSources: newLoading,
            isLoadingBioData: stillLoading,
            provenance: resolveTerraShaftProvenance(state.climateData, data, stillLoading, null, newLoading)
          };
        });

        // Auto-recheck silently if initial cold-start returned fallback
        if (data.source === 'REGIONAL_FALLBACK' && typeof window !== 'undefined') {
          setTimeout(async () => {
            if (get().activeRequestId !== nextReqId) return;
            try {
              const retryRes = await fetch(`/api/soil-profile?lat=${lat}&lon=${lon}`);
              if (!retryRes.ok) return;
              const retryData: SoilData = await retryRes.json();
              if (retryData.source === 'ISRIC_SOILGRIDS_LIVE' && get().activeRequestId === nextReqId) {
                set(state => ({
                  soilData: retryData,
                  provenance: resolveTerraShaftProvenance(state.climateData, retryData, false, null)
                }));
                get().recalculate();
              }
            } catch {
              // Silently ignore
            }
          }, 3500);
        }

        return data;
      } catch (err) {
        if (get().activeRequestId !== nextReqId) return null;
        console.warn('SoilGrids fetch failed, using fallback:', err);
        set(state => {
          const newLoading = { ...state.loadingSources, soilGrids: false };
          const stillLoading = newLoading.nasaPower;
          return {
            loadingSources: newLoading,
            isLoadingBioData: stillLoading,
            provenance: resolveTerraShaftProvenance(state.climateData, state.soilData, stillLoading, null, newLoading)
          };
        });
        return null;
      }
    };

    const fetchVegetation = async () => {
      try {
        const res = await fetch(`/api/vegetation-indices?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: VegetationData = await res.json();
        if (get().activeRequestId !== nextReqId) return null;
        set(state => ({
          vegetationData: data,
          provenance: resolveTerraShaftProvenance(
            state.climateData,
            state.soilData,
            state.isLoadingBioData,
            null,
            state.loadingSources,
            data
          )
        }));
        return data;
      } catch (err) {
        console.warn('Vegetation indices fetch failed, skipping live NDVI:', err);
        return null;
      }
    };

    await Promise.allSettled([fetchNasa(), fetchSoil(), fetchVegetation()]);

    if (get().activeRequestId === nextReqId) {
      set(state => ({
        isLoadingBioData: false,
        loadingSources: { nasaPower: false, soilGrids: false },
        satelliteSyncTime: new Date().toISOString(),
        provenance: resolveTerraShaftProvenance(
          state.climateData,
          state.soilData,
          false,
          null,
          { nasaPower: false, soilGrids: false },
          state.vegetationData
        )
      }));
      get().recalculate();
    }
  },

  setPriorities: (newPriorities) => {
    set(state => ({
      priorities: { ...state.priorities, ...newPriorities }
    }));
    get().recalculate();
  },

  setPriorityPreset: (preset: 'profit' | 'water' | 'soil') => {
    if (preset === 'profit') {
      set({ priorities: { profitWeight: 70, waterWeight: 15, soilWeight: 15 }, selectedPathway: 'C' });
    } else if (preset === 'water') {
      set({ priorities: { profitWeight: 20, waterWeight: 60, soilWeight: 20 }, selectedPathway: 'B' });
    } else {
      set({ priorities: { profitWeight: 20, waterWeight: 20, soilWeight: 60 }, selectedPathway: 'A' });
    }
    get().recalculate();
  },

  setSelectedPathway: (id: 'A' | 'B' | 'C') => {
    set({ selectedPathway: id });
  },

  addCustomCrop: (newCropData) => {
    const id = `custom_${Date.now()}`;
    const customCrop: Crop = {
      ...newCropData,
      id,
      is_custom: true
    };

    set(state => {
      const updated = [...state.crops, customCrop];
      if (typeof window !== 'undefined') {
        try {
          const customOnly = updated.filter(c => c.is_custom);
          window.localStorage.setItem(CUSTOM_CROPS_STORAGE_KEY, JSON.stringify(customOnly));
        } catch {
          // Ignore storage quota errors
        }
      }
      return { crops: updated };
    });

    get().recalculate();
  },

  removeCustomCrop: (id: string) => {
    set(state => {
      const updated = state.crops.filter(c => !(c.id === id && c.is_custom));
      if (typeof window !== 'undefined') {
        try {
          const customOnly = updated.filter(c => c.is_custom);
          window.localStorage.setItem(CUSTOM_CROPS_STORAGE_KEY, JSON.stringify(customOnly));
        } catch {
          // Ignore storage errors
        }
      }
      return { crops: updated };
    });

    get().recalculate();
  },

  hydrateCustomCrops: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(CUSTOM_CROPS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const validCustom: Crop[] = parsed.filter(
        (c: unknown): c is Crop =>
          Boolean(c && typeof c === 'object' && 'id' in c && 'name' in c)
      ).map(c => ({ ...c, is_custom: true }));

      if (validCustom.length > 0) {
        const aez = get().agroecologicalProfile;
        const localized = localizeCropsForRegion(aez, validCustom);
        set({
          crops: localized,
          localizedCultivars: localized
            .map(c => c.cultivar_resolution)
            .filter((r): r is ResolvedCultivarRecommendation => Boolean(r))
        });
        get().recalculate();
      }
    } catch {
      // Ignore malformed local storage
    }
  },

  recalculate: () => {
    const { location, elevation_m, climateData, soilData, priorities, crops } = get();
    const customOnly = crops.filter(c => c.is_custom);
    const updatedAez = buildAgroecologicalProfile(location, elevation_m, climateData, soilData);
    const localizedCrops = localizeCropsForRegion(updatedAez, customOnly);
    const localizedCultivars = localizedCrops
      .map(c => c.cultivar_resolution)
      .filter((r): r is ResolvedCultivarRecommendation => Boolean(r));

    if (!climateData || !soilData) {
      set({
        agroecologicalProfile: updatedAez,
        crops: localizedCrops,
        localizedCultivars
      });
      return;
    }

    const generatedPlans = generateOptimizationPlans(localizedCrops, climateData, soilData, priorities);
    set({
      agroecologicalProfile: updatedAez,
      crops: localizedCrops,
      localizedCultivars,
      plans: generatedPlans
    });
  },

  getProvenance: () => {
    return get().provenance;
  }
}));
