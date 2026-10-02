'use client';

import { create } from 'zustand';
import { Crop, SoilData, Priorities, RotationPlan } from '@/types/agronomy';
import { ClimateData, LocationCoordinates } from '@/types/climate';
import initialCrops from '@/data/crops_library.json';
import { generateOptimizationPlans } from '@/lib/optimizationEngine';
import { resolveTerraShaftProvenance, TerraShaftProvenance } from '@/types/provenance';

interface TerraShaftState {
  // Lokasi Lahan & Telemetri
  location: LocationCoordinates;
  elevation_m: number;
  satelliteSyncTime: string;
  isFieldMode: boolean; // High-contrast outdoor mode for field agents
  
  // Data Biofisik Satelit & Tanah
  soilData: SoilData | null;
  climateData: ClimateData | null;
  isLoadingBioData: boolean;
  loadingSources: {
    nasaPower: boolean;
    soilGrids: boolean;
  };
  activeRequestId: number;
  errorBioData: string | null;
  provenance: TerraShaftProvenance;

  // Prioritas Petani / PPL
  priorities: Priorities;

  // Pustaka Komoditas Tanaman (bawaan + kustom PPL)
  crops: Crop[];

  // Hasil Optimasi 3 Skenario
  selectedPathway: 'A' | 'B' | 'C';
  plans: Record<'A' | 'B' | 'C', RotationPlan> | null;

  // Modal States
  isExportModalOpen: boolean;
  isAddCropModalOpen: boolean;

  // Actions
  setLocation: (lat: number, lon: number, placeName?: string, elevation?: number) => Promise<void>;
  fetchBioPhysicalData: (lat: number, lon: number) => Promise<void>;
  toggleFieldMode: () => void;
  setPriorities: (priorities: Partial<Priorities>) => void;
  setPriorityPreset: (preset: 'profit' | 'water' | 'soil') => void;
  setSelectedPathway: (id: 'A' | 'B' | 'C') => void;
  addCustomCrop: (crop: Omit<Crop, 'id'>) => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  openAddCropModal: () => void;
  closeAddCropModal: () => void;
  recalculate: () => void;
  getProvenance: () => TerraShaftProvenance;
}

// Lokasi Default: Kupang Timur, NTT (Kawasan Lahan Kering Semi-Arid Indonesia)
const DEFAULT_LOCATION: LocationCoordinates = {
  lat: -10.1542,
  lon: 123.8210,
  placeName: 'Kupang Timur, Kab. Kupang, Nusa Tenggara Timur',
  district: 'Kupang Timur',
  province: 'Nusa Tenggara Timur'
};

const DEFAULT_PRIORITIES: Priorities = {
  profitWeight: 40,
  waterWeight: 35,
  soilWeight: 25
};

export const useTerraShaftStore = create<TerraShaftState>((set, get) => ({
  location: DEFAULT_LOCATION,
  elevation_m: 85,
  satelliteSyncTime: new Date().toISOString(),
  isFieldMode: false,
  soilData: null,
  climateData: null,
  isLoadingBioData: false,
  loadingSources: {
    nasaPower: false,
    soilGrids: false
  },
  activeRequestId: 0,
  errorBioData: null,
  provenance: resolveTerraShaftProvenance(null, null, false, null),
  priorities: DEFAULT_PRIORITIES,
  crops: initialCrops as Crop[],
  selectedPathway: 'A',
  plans: null,
  isExportModalOpen: false,
  isAddCropModalOpen: false,

  toggleFieldMode: () => {
    set((state) => ({ isFieldMode: !state.isFieldMode }));
  },

  setLocation: async (lat: number, lon: number, placeName?: string, elevation?: number) => {
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      const errorMsg = `Koordinat tidak valid (${lat}, ${lon}): Latitude harus antara -90° dan 90°, Longitude antara -180° dan 180°.`;
      set((state) => ({
        errorBioData: errorMsg,
        provenance: resolveTerraShaftProvenance(state.climateData, state.soilData, false, errorMsg)
      }));
      return;
    }

    set(state => ({
      location: {
        ...state.location,
        lat,
        lon,
        placeName: placeName || `Titik Koordinat: ${lat.toFixed(4)}, ${lon.toFixed(4)}`
      },
      elevation_m: elevation ?? Math.round(45 + Math.abs(lat * 12) + Math.abs(lon % 50)),
      satelliteSyncTime: new Date().toISOString(),
      errorBioData: null,
      isLoadingBioData: true,
      loadingSources: { nasaPower: true, soilGrids: true }
    }));
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

    await Promise.allSettled([fetchNasa(), fetchSoil()]);

    if (get().activeRequestId === nextReqId) {
      set({
        isLoadingBioData: false,
        loadingSources: { nasaPower: false, soilGrids: false },
        satelliteSyncTime: new Date().toISOString(),
        provenance: resolveTerraShaftProvenance(get().climateData, get().soilData, false, null)
      });
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

    set(state => ({
      crops: [...state.crops, customCrop],
      isAddCropModalOpen: false
    }));

    get().recalculate();
  },

  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),

  openAddCropModal: () => set({ isAddCropModalOpen: true }),
  closeAddCropModal: () => set({ isAddCropModalOpen: false }),

  recalculate: () => {
    const { climateData, soilData, priorities, crops } = get();
    if (!climateData || !soilData) return;

    const generatedPlans = generateOptimizationPlans(crops, climateData, soilData, priorities);
    set({ plans: generatedPlans });
  },

  getProvenance: () => {
    return get().provenance;
  }
}));
