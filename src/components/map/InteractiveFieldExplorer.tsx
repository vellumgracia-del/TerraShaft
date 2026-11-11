'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Search,
  MapPin,
  Layers,
  Plus,
  Minus,
  Crosshair,
  Navigation,
  LocateFixed,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sparkles,
  ArrowRight,
  X,
  Check
} from 'lucide-react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PresetItem {
  name: string;
  full: string;
  lat: number;
  lon: number;
  elevation: number;
  category: 'timor' | 'indonesia' | 'global';
  notes: string;
}

const PRESET_LOCATIONS: PresetItem[] = [
  {
    name: 'Kupang Timur',
    full: 'Kupang Timur, Kab. Kupang, Nusa Tenggara Timur',
    lat: -10.1542,
    lon: 123.821,
    elevation: 85,
    category: 'timor',
    notes: 'Lahan sawah tadah hujan & palawija tanah Vertisol'
  },
  {
    name: 'Camplong',
    full: 'Camplong, Fatuleu, Kab. Kupang, NTT',
    lat: -10.0381,
    lon: 123.9215,
    elevation: 180,
    category: 'timor',
    notes: 'Kawasan perbukitan semi-kering lereng kapur'
  },
  {
    name: 'Sumba Timur',
    full: 'Pandawai, Kab. Sumba Timur, NTT',
    lat: -9.6541,
    lon: 120.2642,
    elevation: 60,
    category: 'timor',
    notes: 'Sentra sorgum & padang sabana iklim kering'
  },
  {
    name: 'Gunungkidul',
    full: 'Playen, Kab. Gunungkidul, D.I. Yogyakarta',
    lat: -7.9656,
    lon: 110.6012,
    elevation: 220,
    category: 'indonesia',
    notes: 'Lahan kering karst bergelombang tanah mediteran'
  },
  {
    name: 'Indramayu',
    full: 'Kandanghaur, Kab. Indramayu, Jawa Barat',
    lat: -6.3275,
    lon: 108.3242,
    elevation: 12,
    category: 'indonesia',
    notes: 'Dataran pantai aluvial sawah irigasi teknis'
  },
  {
    name: 'Lombok Timur',
    full: 'Jerowaru, Kab. Lombok Timur, NTB',
    lat: -8.6508,
    lon: 116.5342,
    elevation: 140,
    category: 'indonesia',
    notes: 'Kawasan bayangan hujan sentra jagung dan tembakau'
  },
  {
    name: 'Machakos (Kenya)',
    full: 'Machakos County, Semi-Arid East Africa, Kenya',
    lat: -1.5177,
    lon: 37.2634,
    elevation: 1600,
    category: 'global',
    notes: 'Dataran tinggi semi-arid Afrika Timur'
  },
  {
    name: 'Central Valley (USA)',
    full: 'Fresno, San Joaquin Valley, California, USA',
    lat: 36.7378,
    lon: -119.7871,
    elevation: 94,
    category: 'global',
    notes: 'Lembah agribisnis mediterania dengan irigasi intensif'
  },
  {
    name: 'Murray-Darling (Australia)',
    full: 'Bathurst, Murray-Darling Basin, NSW, Australia',
    lat: -33.4193,
    lon: 149.5775,
    elevation: 650,
    category: 'global',
    notes: 'Cekungan pertanian gandum dan peternakan iklim sedang'
  },
  {
    name: 'Petrolina (Brazil)',
    full: 'Petrolina, Sertao Semi-Arid, Pernambuco, Brazil',
    lat: -9.3891,
    lon: -40.503,
    elevation: 376,
    category: 'global',
    notes: 'Kawasan semi-kering Sertao lembah Rio Sao Francisco'
  }
];

export default function InteractiveFieldExplorer() {
  const {
    location,
    setLocation,
    elevation_m,
    climateData,
    soilData,
    plans,
    selectedPathway,
    isLoadingBioData
  } = useTerraShaftStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const baseLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const initialLocRef = useRef(location);

  // Explorer State
  const [activeTab, setActiveTab] = useState<'inspector' | 'presets'>('inspector');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mapType, setMapType] = useState<'satellite' | 'streets' | 'topo'>('satellite');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ displayName: string; shortName: string; lat: number; lon: number }>
  >([]);

  // Filter Presets State
  const [presetFilter, setPresetFilter] = useState<'all' | 'timor' | 'indonesia' | 'global'>('all');
  const [presetSearchText, setPresetSearchText] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  const currentPlan = plans ? plans[selectedPathway] : null;
  const gwetroot = climateData?.rootZoneSoilMoisture ?? 0.38;
  const isCriticalMoisture = gwetroot < 0.25;
  const isWatchMoisture = gwetroot >= 0.25 && gwetroot < 0.45;

  // Telemetry calculations matching Planet Explorer status bar (Image 2)
  const activeLat = cursorCoords ? cursorCoords.lat : location.lat;
  const activeLon = cursorCoords ? cursorCoords.lon : location.lon;

  const formatPlanetCoord = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
  };

  const metersPerPixel = (156543.03392 * Math.cos((activeLat * Math.PI) / 180)) / Math.pow(2, zoomLevel);
  const formattedMpx = metersPerPixel >= 100 ? metersPerPixel.toFixed(1) : metersPerPixel.toFixed(2);

  const getScaleBarConfig = (mPerPx: number) => {
    const targetMeters = 80 * mPerPx;
    const steps = [
      1, 2, 5, 10, 20, 50, 100, 200, 500,
      1000, 2000, 5000, 10000, 20000, 50000,
      100000, 200000, 500000, 1000000, 2000000, 5000000
    ];
    let chosenDistance = steps[0];
    for (const step of steps) {
      if (step <= targetMeters) {
        chosenDistance = step;
      } else {
        break;
      }
    }
    const widthPx = Math.max(Math.min(chosenDistance / mPerPx, 110), 32);
    const label = chosenDistance >= 1000 ? `${chosenDistance / 1000} km` : `${chosenDistance} m`;
    return { widthPx, label };
  };

  const scaleBar = getScaleBarConfig(metersPerPixel);

  const getAgronomicInsight = () => {
    if (isLoadingBioData) {
      return 'Menghubungkan ke API telemetri NASA POWER dan ISRIC SoilGrids v2.0...';
    }
    const isNasaFallback = climateData?.source === 'FALLBACK_CLIMATOLOGY';
    const isSoilFallback = soilData?.source === 'REGIONAL_FALLBACK';

    if (isNasaFallback && isSoilFallback) {
      return 'Mode failover regional: Menggunakan profil agroklimat dan pedologi regional terkalibrasi.';
    }
    if (!isNasaFallback && isSoilFallback) {
      return 'Telemetri iklim bersumber dari NASA POWER. Profil tanah menggunakan estimasi pedotransfer regional.';
    }
    if (isNasaFallback && !isSoilFallback) {
      return 'Profil tanah bersumber dari ISRIC SoilGrids (0-30cm). Data iklim menggunakan klimatologi regional.';
    }
    if (isCriticalMoisture) {
      return 'Cadangan air zona akar defisit kritis (<0.25). Prioritaskan komoditas toleran kekeringan (Sorgum / Orok-orok).';
    }
    if (currentPlan && currentPlan.soilBatteryScore > currentPlan.initialBatteryScore) {
      return `Pola rotasi ${currentPlan.title} memulihkan baterai tanah dari ${currentPlan.initialBatteryScore}% ke ${currentPlan.soilBatteryScore}%.`;
    }
    return 'Kondisi air tanah memadai untuk budidaya multi-musim terencana.';
  };

  // Build Tile Layers
  const setBasemapLayer = (
    type: 'satellite' | 'streets' | 'topo',
    L: typeof import('leaflet'),
    targetMap?: L.Map
  ) => {
    const map = targetMap || mapInstanceRef.current;
    if (!map) return;
    if (baseLayerGroupRef.current) {
      baseLayerGroupRef.current.clearLayers();
    } else {
      baseLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    if (type === 'satellite') {
      // Esri Satellite + Boundaries & Places Labels (Identical to Planet Explorer)
      const satTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles (c) Esri - Source: Esri, Maxar, Earthstar Geographics'
        }
      );
      const labelTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19
        }
      );
      baseLayerGroupRef.current.addLayer(satTile);
      baseLayerGroupRef.current.addLayer(labelTile);
    } else if (type === 'streets') {
      const streetTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '(c) OpenStreetMap contributors'
      });
      baseLayerGroupRef.current.addLayer(streetTile);
    } else if (type === 'topo') {
      const topoTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles (c) Esri - USGS, NOAA'
        }
      );
      baseLayerGroupRef.current.addLayer(topoTile);
    }

    setMapType(type);
    setIsLayerMenuOpen(false);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let isMounted = true;
    const initialCenter = initialLocRef.current;
    let resizeObserver: ResizeObserver | null = null;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = leafletModule.default;

      // Custom Planet-style target pin
      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div class="w-10 h-10 rounded-full bg-[#00C2CC]/30 animate-ping absolute"></div>
            <div class="w-9 h-9 rounded-full bg-[#181B20] border-2 border-[#00C2CC] flex items-center justify-center text-[#00C2CC] shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lon],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Default Basemap: Satellite + Place Labels
      setBasemapLayer('satellite', L, map);

      const marker = L.marker([initialCenter.lat, initialCenter.lon], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const target = e.target as L.Marker;
        const pos = target.getLatLng();
        await useTerraShaftStore.getState().setLocation(pos.lat, pos.lng);
      });

      map.on('click', async (e) => {
        marker.setLatLng(e.latlng);
        await useTerraShaftStore.getState().setLocation(e.latlng.lat, e.latlng.lng);
      });

      map.on('mousemove', (e) => {
        setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
      });

      map.on('zoom', () => {
        setZoomLevel(map.getZoom());
      });

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });

      markerRef.current = marker;

      // Invalidate sizes in intervals to handle flex / drawer layout stabilization
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);

      if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    });

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        baseLayerGroupRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when drawer toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  // Sync Map on Location Update
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const currentLatLng = markerRef.current.getLatLng();
    if (
      Math.abs(currentLatLng.lat - location.lat) > 0.0001 ||
      Math.abs(currentLatLng.lng - location.lon) > 0.0001
    ) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      mapInstanceRef.current.flyTo([location.lat, location.lon], Math.max(mapInstanceRef.current.getZoom(), 12), {
        duration: 1.2
      });
    }
  }, [location.lat, location.lon]);

  // Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.lat, location.lon], 13, { duration: 1.2 });
    }
  };

  const handleUseGps = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, altitude } = pos.coords;
        const elev = altitude !== null && !isNaN(altitude) ? Math.round(altitude) : undefined;
        await setLocation(latitude, longitude, undefined, elev);
        setIsLocatingGps(false);
      },
      () => {
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    // Direct Coordinate check (e.g. -10.15, 123.82)
    const coordMatch = query.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        await setLocation(lat, lon, `Koordinat (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`);
        setSearchResults([]);
        return;
      }
    }

    setIsSearchingPlace(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const handleSelectSearchResult = async (item: {
    displayName: string;
    shortName: string;
    lat: number;
    lon: number;
  }) => {
    setSearchResults([]);
    setSearchQuery(item.shortName);
    await setLocation(item.lat, item.lon, item.displayName);
  };

  const handleSelectPreset = async (preset: PresetItem) => {
    await setLocation(preset.lat, preset.lon, preset.full, preset.elevation);
  };

  const handleManualCoordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const lat = parseFloat(String(fd.get('lat') ?? ''));
    const lon = parseFloat(String(fd.get('lon') ?? ''));
    if (!isNaN(lat) && !isNaN(lon)) {
      await setLocation(lat, lon);
    }
  };

  const filteredPresets = PRESET_LOCATIONS.filter((p) => {
    const matchesCategory = presetFilter === 'all' || p.category === presetFilter;
    const matchesSearch =
      presetSearchText.trim() === '' ||
      p.name.toLowerCase().includes(presetSearchText.toLowerCase()) ||
      p.full.toLowerCase().includes(presetSearchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative w-full h-full overflow-hidden flex select-none bg-[#121417] text-[#F1F3F5]">
      {/* 1. Full-screen Interactive Leaflet Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* 2. Top Floating Search Bar (Centered over Map) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-[480px] md:w-[560px]">
        <div className="relative">
          <form
            onSubmit={handleSearchSubmit}
            className="h-10 px-3 bg-[#16191E]/95 backdrop-blur-md border border-[#282C34] hover:border-[#383E4A] focus-within:border-[#009DA5] rounded-[4px] shadow-2xl flex items-center gap-2 transition-all"
          >
            <Search className="w-4 h-4 text-[#00C2CC] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi, desa, kabupaten, atau koordinat (misal: -10.15, 123.82)..."
              className="flex-1 bg-transparent text-xs text-[#F1F3F5] placeholder-[#8A949E] outline-none"
            />
            {isSearchingPlace && (
              <div className="w-3.5 h-3.5 border-2 border-[#009DA5] border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {searchQuery && !isSearchingPlace && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-[#8A949E] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSearchingPlace || searchQuery.trim().length < 2}
              className="px-2.5 py-1 bg-[#009DA5] hover:bg-[#00B4BD] text-white text-[11px] font-medium rounded-[3px] transition-colors disabled:opacity-40"
            >
              Cari
            </button>
          </form>

          {/* Search Autocomplete Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-[#16191E]/98 backdrop-blur-md border border-[#282C34] rounded-[4px] shadow-2xl overflow-hidden divide-y divide-[#282C34] text-xs max-h-72 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.lat}-${item.lon}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#163A40] transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="truncate">
                    <span className="font-medium text-[#F1F3F5] group-hover:text-[#00C2CC]">
                      {item.shortName}
                    </span>
                    <span className="text-[#8A949E] ml-2 text-[11px] truncate block sm:inline">
                      {item.displayName}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#00C2CC] shrink-0">
                    {item.lat.toFixed(3)}°, {item.lon.toFixed(3)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Left Flyout Drawer (Planet-Style Mosaics / AOI Inspector Panel) */}
      <div
        className={`absolute left-0 top-0 bottom-7 z-20 w-80 sm:w-96 bg-[#16191E]/95 backdrop-blur-md border-r border-[#282C34] flex flex-col shadow-2xl transition-transform duration-200 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header matching Planet Mosaics Header */}
        <div className="px-4 py-3 border-b border-[#282C34] flex items-center justify-between shrink-0 bg-[#121417]/60">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00C2CC]" />
            <h1 className="text-sm font-semibold tracking-tight text-[#F1F3F5]">
              Area of Interest (AOI)
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            title="Ciutkan Panel AOI"
            className="p-1 rounded-[3px] text-[#8A949E] hover:bg-[#20252D] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: AOI INSPECTOR vs ALL LOCATIONS */}
        <div className="flex items-center border-b border-[#282C34] text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`flex-1 py-2.5 text-center transition-colors relative ${
              activeTab === 'inspector' ? 'text-[#00C2CC]' : 'text-[#8A949E] hover:text-[#F1F3F5]'
            }`}
          >
            AOI INSPECTOR
            {activeTab === 'inspector' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#009DA5]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2.5 text-center transition-colors relative ${
              activeTab === 'presets' ? 'text-[#00C2CC]' : 'text-[#8A949E] hover:text-[#F1F3F5]'
            }`}
          >
            ALL LOCATIONS
            {activeTab === 'presets' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#009DA5]" />
            )}
          </button>
        </div>

        {/* Tab Content 1: AOI INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4 text-xs">
            {/* Active AOI Card */}
            <div className="p-3.5 bg-[#20252D] border border-[#282C34] rounded-[4px] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8A949E]">
                <span>Lahan Aktif Terpilih</span>
                <span className="text-[#00C2CC] bg-[#163A40] px-2 py-0.5 rounded-[3px] border border-[#009DA5]/40">
                  FOKUS
                </span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F1F3F5] leading-snug">
                  {location.placeName || 'Lahan Budidaya'}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#8A949E]">
                  <span>
                    LAT: <strong className="text-[#F1F3F5]">{location.lat.toFixed(4)}°</strong>
                  </span>
                  <span>
                    LON: <strong className="text-[#F1F3F5]">{location.lon.toFixed(4)}°</strong>
                  </span>
                  <span>
                    ELEV: <strong className="text-[#F1F3F5]">{elevation_m}m</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Lat/Lon Coordinates & GPS Geolocation */}
            <form
              onSubmit={handleManualCoordSubmit}
              className="p-3 bg-[#16191E] border border-[#282C34] rounded-[4px] flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8A949E]">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#00C2CC]" />
                  <span>Input Koordinat Manual:</span>
                </span>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isLocatingGps}
                  className="text-[#00C2CC] hover:underline flex items-center gap-1"
                >
                  <LocateFixed className={`w-3 h-3 ${isLocatingGps ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGps ? 'GPS...' : 'GPS Saya'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="text-[10px] text-[#8A949E] block mb-1">LATITUDE</label>
                  <input
                    type="number"
                    name="lat"
                    step="any"
                    min="-90"
                    max="90"
                    defaultValue={location.lat.toFixed(4)}
                    key={`lat-${location.lat.toFixed(4)}`}
                    className="w-full px-2.5 py-1.5 bg-[#20252D] border border-[#282C34] rounded-[3px] text-xs text-[#F1F3F5] outline-none focus:border-[#009DA5]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8A949E] block mb-1">LONGITUDE</label>
                  <input
                    type="number"
                    name="lon"
                    step="any"
                    min="-180"
                    max="180"
                    defaultValue={location.lon.toFixed(4)}
                    key={`lon-${location.lon.toFixed(4)}`}
                    className="w-full px-2.5 py-1.5 bg-[#20252D] border border-[#282C34] rounded-[3px] text-xs text-[#F1F3F5] outline-none focus:border-[#009DA5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-[#009DA5] hover:bg-[#00B4BD] text-white font-medium rounded-[3px] text-xs transition-colors"
              >
                Pindah Titik Lahan
              </button>
            </form>

            {/* Biophysical Telemetry Snapshot */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A949E]">
                Telemetri Biofisik Lapangan
              </span>

              {/* SMAP Root-zone Moisture */}
              <div className="p-3 bg-[#20252D] border border-[#282C34] rounded-[4px] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A949E] flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#00C2CC]" />
                    <span>Kelembapan Zona Akar</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono font-medium ${
                      isCriticalMoisture
                        ? 'bg-[#2D1B1E] text-[#F87171] border border-[#7F1D1D]/50'
                        : isWatchMoisture
                        ? 'bg-[#2B261A] text-[#FBBF24] border border-[#B45309]/40'
                        : 'bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40'
                    }`}
                  >
                    {isCriticalMoisture ? 'KRITIS' : isWatchMoisture ? 'WASPADA' : 'MEMADAI'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-xl font-bold text-[#F1F3F5]">{gwetroot.toFixed(2)}</span>
                  <span className="text-xs text-[#8A949E]">/ 1.00 GWETROOT (NASA SMAP)</span>
                </div>
              </div>

              {/* ISRIC Soil Properties */}
              <div className="p-3 bg-[#20252D] border border-[#282C34] rounded-[4px] grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 bg-[#16191E] rounded-[3px]">
                  <span className="text-[10px] text-[#8A949E] block">AWC Retensi</span>
                  <span className="text-sm font-bold text-[#00C2CC]">
                    {soilData?.awc?.toFixed(1) ?? '27.8'} mm
                  </span>
                </div>
                <div className="p-2 bg-[#16191E] rounded-[3px]">
                  <span className="text-[10px] text-[#8A949E] block">Bahan Organik</span>
                  <span className="text-sm font-bold text-[#F1F3F5]">
                    {soilData?.soc?.toFixed(1) ?? '1.2'}% SOC
                  </span>
                </div>
              </div>

              {/* Agronomic Insight Box */}
              <div className="p-3 bg-[#16191E] border border-[#282C34] rounded-[4px] flex gap-2 items-start">
                <Sparkles className="w-3.5 h-3.5 text-[#00C2CC] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8A949E] leading-relaxed">
                  {getAgronomicInsight()}
                </p>
              </div>
            </div>

            {/* Quick Flow Buttons */}
            <div className="mt-auto pt-2 flex flex-col gap-2">
              <Link
                href="/rotation-planner"
                className="w-full py-2 bg-[#009DA5] hover:bg-[#00B4BD] text-white font-medium rounded-[3px] text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Optimasi Rotasi 4 Musim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/water-balance"
                className="w-full py-2 bg-[#20252D] hover:bg-[#282E38] text-[#C1C7CD] hover:text-white border border-[#282C34] font-medium rounded-[3px] text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Periksa Neraca Air Lahan</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab Content 2: ALL LOCATIONS / PRESETS */}
        {activeTab === 'presets' && (
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 text-xs">
            {/* Filter by name input */}
            <div className="relative">
              <input
                type="text"
                value={presetSearchText}
                onChange={(e) => setPresetSearchText(e.target.value)}
                placeholder="Filter by name..."
                className="w-full px-3 py-1.5 bg-[#20252D] border border-[#282C34] rounded-[3px] text-xs text-[#F1F3F5] placeholder-[#8A949E] outline-none focus:border-[#009DA5]"
              />
            </div>

            {/* Category Filter Pills (WEEKLY / MONTHLY style in screenshot) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono text-[#8A949E]">
              {(
                [
                  { id: 'all', label: 'SEMUA' },
                  { id: 'timor', label: 'TIMOR' },
                  { id: 'indonesia', label: 'INDONESIA' },
                  { id: 'global', label: 'GLOBAL' }
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPresetFilter(cat.id)}
                  className={`px-2 py-0.5 rounded-[3px] transition-colors whitespace-nowrap ${
                    presetFilter === cat.id
                      ? 'bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40 font-semibold'
                      : 'hover:bg-[#20252D] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List of Location Cards */}
            <div className="flex flex-col gap-2 pt-1">
              {filteredPresets.map((preset) => {
                const isSelected =
                  Math.abs(location.lat - preset.lat) < 0.001 &&
                  Math.abs(location.lon - preset.lon) < 0.001;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-[4px] border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#163A40] border-[#009DA5] text-[#F1F3F5]'
                        : 'bg-[#20252D] border-[#282C34] text-[#C1C7CD] hover:border-[#383E4A] hover:bg-[#262C36]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#F1F3F5]">{preset.name}</span>
                      <span className="font-mono text-[10.5px] text-[#00C2CC]">
                        {preset.elevation}m dpl
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A949E] line-clamp-1">{preset.notes}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[#282C34]/60 text-[10.5px] font-mono text-[#8A949E]">
                      <span>
                        {preset.lat.toFixed(3)}°, {preset.lon.toFixed(3)}°
                      </span>
                      {isSelected ? (
                        <span className="text-[#00C2CC] flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>TERPILIH</span>
                        </span>
                      ) : (
                        <span className="text-[#8A949E] group-hover:text-white">PILIH</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="text-center py-8 text-xs text-[#8A949E]">
                  Tidak ada lokasi preset yang sesuai filter.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Re-open Flyout Button (when Drawer is collapsed) */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          title="Buka Panel AOI"
          className="absolute left-0 top-3 z-20 h-10 px-3 bg-[#16191E]/95 backdrop-blur-md border-r border-t border-b border-[#282C34] hover:bg-[#20252D] text-[#C1C7CD] hover:text-white rounded-r-[4px] shadow-2xl flex items-center gap-2 text-xs font-mono transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[#00C2CC]" />
          <span>Area of Interest</span>
        </button>
      )}

      {/* 4. Right Floating Map Controls Toolbar (Zoom, Basemap Switcher, Fullscreen) */}
      <div className="absolute right-4 top-3 z-20 flex flex-col gap-1.5">
        {/* Zoom Controls */}
        <div className="bg-[#16191E]/95 backdrop-blur-md border border-[#282C34] rounded-[4px] shadow-xl flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Perbesar Peta"
            className="w-8 h-8 flex items-center justify-center text-[#C1C7CD] hover:bg-[#20252D] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-[#282C34]" />
          <button
            type="button"
            onClick={handleZoomOut}
            title="Perkecil Peta"
            className="w-8 h-8 flex items-center justify-center text-[#C1C7CD] hover:bg-[#20252D] hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Recenter to Active AOI */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Fokus ke Lokasi Lahan Terpilih"
          className="w-8 h-8 bg-[#16191E]/95 backdrop-blur-md border border-[#282C34] hover:bg-[#20252D] rounded-[4px] shadow-xl flex items-center justify-center text-[#00C2CC] transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Basemap Switcher Button + Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayerMenuOpen((prev) => !prev)}
            title="Ganti Lapisan Peta Basemap"
            className={`w-8 h-8 bg-[#16191E]/95 backdrop-blur-md border border-[#282C34] hover:bg-[#20252D] rounded-[4px] shadow-xl flex items-center justify-center transition-colors ${
              isLayerMenuOpen ? 'text-[#00C2CC] border-[#009DA5]' : 'text-[#C1C7CD] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {isLayerMenuOpen && (
            <div className="absolute right-10 top-0 w-44 bg-[#16191E]/98 backdrop-blur-md border border-[#282C34] rounded-[4px] shadow-2xl p-1.5 flex flex-col gap-1 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A949E] px-2 py-1">
                Pilih Lapisan Citra
              </span>
              <button
                type="button"
                onClick={() => {
                  import('leaflet').then((L) => setBasemapLayer('satellite', L.default));
                }}
                className={`w-full text-left px-2 py-1.5 rounded-[3px] transition-colors flex items-center justify-between ${
                  mapType === 'satellite'
                    ? 'bg-[#163A40] text-[#00C2CC] font-semibold'
                    : 'text-[#C1C7CD] hover:bg-[#20252D] hover:text-white'
                }`}
              >
                <span>Satelit Riil & Label</span>
                {mapType === 'satellite' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  import('leaflet').then((L) => setBasemapLayer('streets', L.default));
                }}
                className={`w-full text-left px-2 py-1.5 rounded-[3px] transition-colors flex items-center justify-between ${
                  mapType === 'streets'
                    ? 'bg-[#163A40] text-[#00C2CC] font-semibold'
                    : 'text-[#C1C7CD] hover:bg-[#20252D] hover:text-white'
                }`}
              >
                <span>Peta Jalan (OSM)</span>
                {mapType === 'streets' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  import('leaflet').then((L) => setBasemapLayer('topo', L.default));
                }}
                className={`w-full text-left px-2 py-1.5 rounded-[3px] transition-colors flex items-center justify-between ${
                  mapType === 'topo'
                    ? 'bg-[#163A40] text-[#00C2CC] font-semibold'
                    : 'text-[#C1C7CD] hover:bg-[#20252D] hover:text-white'
                }`}
              >
                <span>Topografi & Kontur</span>
                {mapType === 'topo' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          className="w-8 h-8 bg-[#16191E]/95 backdrop-blur-md border border-[#282C34] hover:bg-[#20252D] rounded-[4px] shadow-xl flex items-center justify-center text-[#C1C7CD] hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 5. Bottom Telemetry & Status Bar matching Planet Explorer Footer (Image 2) */}
      <footer className="absolute bottom-0 left-0 right-0 h-7 bg-[#121417]/95 backdrop-blur-xs border-t border-[#282C34] z-20 px-3 sm:px-4 flex items-center justify-between text-[11px] font-mono text-[#C1C7CD] select-none">
        {/* Left: Source Attribution */}
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#C1C7CD] font-medium hidden md:inline">TerraShaft Orbital</span>
          <span className="hidden md:inline text-[#383E4A]">|</span>
          <span className="truncate text-[#8A949E] text-[10.5px]">
            (c) NASA POWER · ISRIC SoilGrids v2.0 · Esri · OpenStreetMap
          </span>
        </div>

        {/* Right: Planet Explorer Telemetry Bar (Coordinates, Zoom, m/px, Scale Line) */}
        <div className="flex items-center gap-3.5 sm:gap-5 md:gap-6 shrink-0 text-[11px] font-mono text-[#E1E4EA]">
          {/* Coordinates with GIS Heading Pointer Arrow */}
          <div className="flex items-center gap-1.5" title="Koordinat Lokasi / Kursor Aktif">
            <svg
              className="w-3.5 h-3.5 text-[#E1E4EA] shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M2 2L14 7.5L8.5 9L7 14.5L2 2Z" />
            </svg>
            <span className="tracking-tight text-[#E1E4EA]">
              {formatPlanetCoord(activeLat, activeLon)}
            </span>
          </div>

          {/* Zoom Level with Search/Magnifier */}
          <div className="hidden xs:flex items-center gap-1.5" title="Tingkat Pembesaran Zoom">
            <Search className="w-3 h-3 text-[#C1C7CD] shrink-0" />
            <span className="text-[#E1E4EA]">{zoomLevel.toFixed(2)}</span>
          </div>

          {/* Spatial Resolution (m/px) with Pixel Frame Icon */}
          <div className="hidden sm:flex items-center gap-1.5" title="Resolusi Citra (Ground Sampling Distance)">
            <svg
              className="w-3 h-3 text-[#C1C7CD] shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M3 6V3h3M10 3h3v3M3 10v3h3M10 13h3v-3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="1" fill="currentColor" />
            </svg>
            <span className="text-[#E1E4EA]">{formattedMpx} m/px</span>
          </div>

          {/* Scale Line with Distance Unit */}
          <div className="flex items-center gap-2 shrink-0" title="Skala Jarak Lapangan">
            <div
              className="h-[1.5px] bg-white transition-all shrink-0"
              style={{ width: `${Math.round(scaleBar.widthPx)}px` }}
            />
            <span className="text-white text-[11px] font-medium whitespace-nowrap">
              {scaleBar.label}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}