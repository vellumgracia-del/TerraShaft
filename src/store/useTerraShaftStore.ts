'use client';

import { create } from 'zustand';
import { Crop, SoilData, Priorities, RotationPlan } from '@/types/agronomy';
import { ClimateData, LocationCoordinates } from '@/types/climate';
import initialCrops from '@/data/crops_library.json';
import { generateOptimizationPlans } from '@/lib/optimizationEngine';

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
  errorBioData: string | null;

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
  errorBioData: null,
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
      set({
        errorBioData: `Koordinat tidak valid (${lat}, ${lon}): Latitude harus antara -90° dan 90°, Longitude antara -180° dan 180°.`
      });
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
      errorBioData: null
    }));
    await get().fetchBioPhysicalData(lat, lon);
  },

  fetchBioPhysicalData: async (lat: number, lon: number) => {
    set({ isLoadingBioData: true, errorBioData: null });
    try {
      const [climateRes, soilRes] = await Promise.all([
        fetch(`/api/nasa-climate?lat=${lat}&lon=${lon}`),
        fetch(`/api/soil-profile?lat=${lat}&lon=${lon}`)
      ]);

      if (!climateRes.ok || !soilRes.ok) {
        throw new Error('Gagal memuat profil iklim atau tanah dari server proxy');
      }

      const climateData: ClimateData = await climateRes.json();
      const soilData: SoilData = await soilRes.json();

      set({
        climateData,
        soilData,
        isLoadingBioData: false,
        satelliteSyncTime: new Date().toISOString()
      });

      // Hitung ulang rekomendasi rotasi
      get().recalculate();
    } catch (err: unknown) {
      console.error('Error fetching bio-physical data:', err);
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kendala jaringan telemetri satelit';
      set({ isLoadingBioData: false, errorBioData: errorMsg });
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
  }
}));
