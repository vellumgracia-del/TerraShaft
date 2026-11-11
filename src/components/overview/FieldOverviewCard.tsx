'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  MapPin,
  Sparkles,
  Compass,
  Droplets,
  LocateFixed,
  Globe,
  Navigation,
  Search
} from 'lucide-react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const REGION_PRESETS = [
  { name: 'Kupang Timur', full: 'Kupang Timur, Kab. Kupang, NTT', lat: -10.1542, lon: 123.8210, elevation: 85, scope: 'id' },
  { name: 'Gunungkidul', full: 'Gunungkidul, D.I. Yogyakarta', lat: -7.9656, lon: 110.6012, elevation: 220, scope: 'id' },
  { name: 'Sumba Timur', full: 'Sumba Timur, Nusa Tenggara Timur', lat: -9.6541, lon: 120.2642, elevation: 60, scope: 'id' },
  { name: 'Indramayu', full: 'Indramayu, Jawa Barat', lat: -6.3275, lon: 108.3242, elevation: 12, scope: 'id' },
  { name: 'Lombok Timur', full: 'Lombok Timur, Nusa Tenggara Barat', lat: -8.6508, lon: 116.5342, elevation: 140, scope: 'id' }
];

const GLOBAL_PRESETS = [
  { name: 'Machakos (Kenya)', full: 'Machakos County, Semi-Arid East Africa, Kenya', lat: -1.5177, lon: 37.2634, elevation: 1600, scope: 'global' },
  { name: 'Central Valley (USA)', full: 'Fresno, San Joaquin Valley, California, USA', lat: 36.7378, lon: -119.7871, elevation: 94, scope: 'global' },
  { name: 'Murray-Darling (Aus)', full: 'Bathurst, Murray-Darling Basin, NSW, Australia', lat: -33.4193, lon: 149.5775, elevation: 650, scope: 'global' },
  { name: 'Petrolina (Brazil)', full: 'Petrolina, Sertao Semi-Arid, Pernambuco, Brazil', lat: -9.3891, lon: -40.5030, elevation: 376, scope: 'global' },
  { name: 'Punjab (India)', full: 'Ludhiana, Indo-Gangetic Plains, Punjab, India', lat: 30.9010, lon: 75.8573, elevation: 247, scope: 'global' }
];

export default function FieldOverviewCard() {
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ displayName: string; shortName: string; lat: number; lon: number }>
  >([]);
  const initialLocRef = useRef(location);

  const currentPlan = plans ? plans[selectedPathway] : null;
  const gwetroot = climateData?.rootZoneSoilMoisture ?? 0.38;
  const isCriticalMoisture = gwetroot < 0.25;
  const isWatchMoisture = gwetroot >= 0.25 && gwetroot < 0.45;

  // Real agronomic insight calculation based purely on verified state
  const getAgronomicInsight = () => {
    if (isLoadingBioData) {
      return 'Menghubungkan ke API NASA POWER dan profil tanah ISRIC SoilGrids...';
    }
    const isNasaFallback = climateData?.source === 'FALLBACK_CLIMATOLOGY';
    const isSoilFallback = soilData?.source === 'REGIONAL_FALLBACK';

    if (isNasaFallback && isSoilFallback) {
      return 'Mode failover regional aktif: Menggunakan model agroklimat dan pedologi regional terkalibrasi.';
    }
    if (!isNasaFallback && isSoilFallback) {
      return 'Telemetri iklim bersumber dari API NASA POWER (baseline historis 1-tahun). Sifat fisik tanah menggunakan profil regional terkalibrasi karena respons hulu SoilGrids tidak tersedia.';
    }
    if (isNasaFallback && !isSoilFallback) {
      return 'Profil tanah bersumber dari API ISRIC SoilGrids (0–30cm). Data iklim menggunakan klimatologi regional terkalibrasi.';
    }
    if (isCriticalMoisture) {
      return 'Cadangan air zona akar berada pada kondisi defisit kritis (<0.25). Prioritaskan tanaman toleran kekeringan tinggi (Sorgum / Kacang Hijau).';
    }
    if (currentPlan && currentPlan.soilBatteryScore > currentPlan.initialBatteryScore) {
      return `Rotasi ${currentPlan.title} memulihkan baterai tanah dari ${currentPlan.initialBatteryScore}% ke ${currentPlan.soilBatteryScore}% melalui legum penambat nitrogen dan cover crop berakar dalam.`;
    }
    return 'Kondisi air tanah memadai untuk budidaya multi-musim terencana dengan efisiensi tata kelola air.';
  };

  // Helper function to build street tile layer with reliable fallback
  const createStreetLayer = (L: typeof import('leaflet')) => {
    const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    });

    layer.on('tileerror', () => {
      // Graceful fallback to Esri Street if OpenStreetMap has network issues
      if (mapInstanceRef.current && tileLayerRef.current === layer) {
        console.warn('OpenStreetMap tile error, switching to Esri World Street Map');
        const fallback = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
            attribution: 'Tiles &copy; Esri'
          }
        );
        mapInstanceRef.current.removeLayer(layer);
        fallback.addTo(mapInstanceRef.current);
        tileLayerRef.current = fallback;
      }
    });

    return layer;
  };

  // Helper function to build satellite tile layer
  const createSatelliteLayer = (L: typeof import('leaflet')) => {
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }
    );
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let isMounted = true;
    const initialCenter = initialLocRef.current;
    let resizeObserver: ResizeObserver | null = null;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = leafletModule.default;

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-[#12A875]/25 animate-ping absolute"></div>
            <div class="w-8 h-8 rounded-full bg-[#12A875] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialCenter.lat, initialCenter.lon],
        zoom: 11,
        zoomControl: false
      });

      // Default: Clean OpenStreetMap standard tile layer (zero API key required)
      const streetTile = createStreetLayer(L);
      streetTile.addTo(map);
      tileLayerRef.current = streetTile;

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

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size once DOM stabilizes
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Attach ResizeObserver to keep map responsive across sidebar and window changes
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
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update map view & marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const currentLatLng = markerRef.current.getLatLng();
    if (
      Math.abs(currentLatLng.lat - location.lat) > 0.0001 ||
      Math.abs(currentLatLng.lng - location.lon) > 0.0001
    ) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      mapInstanceRef.current.setView([location.lat, location.lon], 11, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  }, [location.lat, location.lon]);

  const handleManualCoordinateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parsedLat = parseFloat(String(formData.get('lat') ?? ''));
    const parsedLon = parseFloat(String(formData.get('lon') ?? ''));
    await setLocation(parsedLat, parsedLon);
  };

  const handleUseGpsLocation = () => {
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

  const handlePlaceSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;
    setIsSearchingPlace(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
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

  // Toggle Basemap (Clean Street vs Satellite Imagery)
  const handleToggleBasemap = (type: 'streets' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default;
      if (tileLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const newLayer = type === 'streets' ? createStreetLayer(L) : createSatelliteLayer(L);

      newLayer.addTo(mapInstanceRef.current!);
      tileLayerRef.current = newLayer;
      setMapType(type);
      mapInstanceRef.current!.invalidateSize();
    });
  };

  return (
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col gap-5 text-[#F1F3F5]">
      {/* Header of Main Field Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2C313A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[4px] bg-[#163A40] text-[#00C2CC]">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-base font-medium text-[#F1F3F5] tracking-tight">
              Observasi Lahan & Koordinat Spasial
            </h2>
          </div>
          <p className="text-xs text-[#8A949E] mt-0.5">
            Klik peta atau geser pin hijau untuk menentukan lokasi lahan budidaya
          </p>
        </div>

        {/* Map Layer Switcher */}
        <div className="inline-flex p-1 bg-[#16191E] border border-[#2C313A] rounded-[4px] self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => handleToggleBasemap('streets')}
            className={`px-3 py-1 rounded-[3px] transition-all ${
              mapType === 'streets'
                ? 'bg-[#20242B] text-[#F1F3F5] font-semibold'
                : 'text-[#8A949E] hover:text-[#F1F3F5]'
            }`}
          >
            Peta Terang
          </button>
          <button
            type="button"
            onClick={() => handleToggleBasemap('satellite')}
            className={`px-3 py-1 rounded-[3px] transition-all ${
              mapType === 'satellite'
                ? 'bg-[#20242B] text-[#F1F3F5] font-semibold'
                : 'text-[#8A949E] hover:text-[#F1F3F5]'
            }`}
          >
            Satelit Riil
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Side Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Container (8 Col) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div
            className="relative w-full h-[320px] sm:h-[380px] rounded-[4px] overflow-hidden border border-[#2C313A] shadow-xs"
            style={{ isolation: 'isolate', zIndex: 10 }}
          >
            <div ref={mapContainerRef} className="w-full h-full relative" style={{ zIndex: 1 }} />

            {/* Floating Coordinate Pill on Map */}
            <div className="absolute top-3 left-3 z-20 bg-[#16191E]/95 backdrop-blur-xs px-3 py-1.5 rounded-[4px] border border-[#2C313A] text-xs font-mono text-[#F1F3F5] shadow-xs flex items-center gap-1.5 pointer-events-auto">
              <MapPin className="w-3.5 h-3.5 text-[#00C2CC]" />
              <span>
                {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
              </span>
              <span className="text-[#8A949E]">|</span>
              <span className="text-[#C1C7CD]">{elevation_m}m dpl</span>
            </div>

            {/* Loading Indicator Overlay */}
            {isLoadingBioData && (
              <div className="absolute inset-0 bg-[#181B20]/80 backdrop-blur-xs z-30 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-[#20242B] px-4 py-2.5 rounded-[4px] border border-[#2C313A] shadow-md text-xs font-medium text-[#F1F3F5]">
                  <div className="w-4 h-4 border-2 border-[#00C2CC] border-t-transparent rounded-full animate-spin" />
                  <span>Memuat telemetri biofisik...</span>
                </div>
              </div>
            )}
          </div>

          {/* Public Place Search (OpenStreetMap Nominatim + Open-Meteo DEM) */}
          <div className="relative">
            <form
              onSubmit={handlePlaceSearchSubmit}
              className="p-2.5 bg-[#16191E] border border-[#2C313A] rounded-[4px] flex items-center gap-2 text-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#00C2CC] shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari desa, kabupaten, atau kota dunia (OpenStreetMap Nominatim)..."
                className="flex-1 px-2.5 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-xs text-[#F1F3F5] focus:border-[#009DA5] outline-none"
                aria-label="Cari nama lokasi"
              />
              <button
                type="submit"
                disabled={isSearchingPlace || searchQuery.trim().length < 2}
                className="px-3 py-1 rounded-[3px] bg-[#009DA5] hover:bg-[#00B4BD] text-white font-medium transition-colors disabled:opacity-50"
              >
                {isSearchingPlace ? 'Mencari...' : 'Cari Lokasi'}
              </button>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchResults([])}
                  className="px-2 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[#8A949E] hover:text-[#F1F3F5]"
                >
                  Tutup
                </button>
              )}
            </form>

            {searchResults.length > 0 && (
              <div className="mt-1.5 bg-[#20242B] border border-[#2C313A] rounded-[4px] shadow-md overflow-hidden divide-y divide-[#2C313A] text-xs">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lon}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3 py-2 hover:bg-[#163A40] transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <span className="font-medium text-[#F1F3F5]">{item.shortName}</span>
                      <span className="text-[#8A949E] ml-1.5 text-[11px]">{item.displayName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#00C2CC] shrink-0">
                      {item.lat.toFixed(3)}°, {item.lon.toFixed(3)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Coordinate Input & Geolocation Bar */}
          <form
            key={`${location.lat.toFixed(4)},${location.lon.toFixed(4)}`}
            onSubmit={handleManualCoordinateSubmit}
            className="p-3 bg-[#16191E] border border-[#2C313A] rounded-[4px] flex flex-wrap items-center justify-between gap-2.5 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A949E] flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-[#00C2CC]" />
                <span>Koordinat Manual:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-[#8A949E] text-[11px] font-mono">Lat</label>
                <input
                  type="number"
                  name="lat"
                  step="any"
                  min="-90"
                  max="90"
                  defaultValue={location.lat.toFixed(4)}
                  className="w-24 px-2 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] font-mono text-xs text-[#F1F3F5] focus:border-[#009DA5] outline-none"
                  aria-label="Latitude"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[#8A949E] text-[11px] font-mono">Lon</label>
                <input
                  type="number"
                  name="lon"
                  step="any"
                  min="-180"
                  max="180"
                  defaultValue={location.lon.toFixed(4)}
                  className="w-24 px-2 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] font-mono text-xs text-[#F1F3F5] focus:border-[#009DA5] outline-none"
                  aria-label="Longitude"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1 rounded-[3px] bg-[#009DA5] hover:bg-[#00B4BD] text-white font-medium transition-colors"
              >
                Terapkan
              </button>
            </div>

            <button
              type="button"
              onClick={handleUseGpsLocation}
              disabled={isLocatingGps}
              className="px-3 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] hover:bg-[#163A40] text-[#00C2CC] font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isLocatingGps ? 'Mendeteksi GPS...' : 'Gunakan GPS Saya'}</span>
            </button>
          </form>

          {/* Preset Location Pills: Indonesia & Global */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#8A949E] font-mono text-[11px] uppercase tracking-wider mr-1">
                Preset Indonesia:
              </span>
              {REGION_PRESETS.map((preset) => {
                const isSelected =
                  Math.abs(location.lat - preset.lat) < 0.001 && Math.abs(location.lon - preset.lon) < 0.001;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setLocation(preset.lat, preset.lon, preset.full, preset.elevation)}
                    className={`px-2.5 py-1 rounded-[3px] border text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/60 font-semibold'
                        : 'bg-[#20242B] border-[#2C313A] text-[#C1C7CD] hover:bg-[#16191E] hover:text-[#F1F3F5]'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#00C2CC] font-mono text-[11px] uppercase tracking-wider mr-1 inline-flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Sentra Global:</span>
              </span>
              {GLOBAL_PRESETS.map((preset) => {
                const isSelected =
                  Math.abs(location.lat - preset.lat) < 0.001 && Math.abs(location.lon - preset.lon) < 0.001;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setLocation(preset.lat, preset.lon, preset.full, preset.elevation)}
                    className={`px-2.5 py-1 rounded-[3px] border text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/60 font-semibold'
                        : 'bg-[#20242B] border-[#2C313A] text-[#C1C7CD] hover:bg-[#16191E] hover:text-[#00C2CC]'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel: Selected Field Context & Live State Insight (4 Col) */}
        <div className="lg:col-span-4 flex flex-col gap-4 justify-between bg-[#16191E] p-4 sm:p-5 rounded-[4px] border border-[#2C313A]">
          {/* Field Details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A949E]">
                Informasi Lahan
              </span>
              <span className="px-2 py-0.5 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-[11px] font-mono text-[#C1C7CD]">
                Zona Terpilih
              </span>
            </div>

            <div>
              <h3 className="text-base font-medium text-[#F1F3F5] leading-snug">
                {location.placeName || `${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}°`}
              </h3>
              <p className="text-xs text-[#8A949E] mt-0.5">
                Ketinggian Lahan: <strong className="text-[#F1F3F5] font-mono">{elevation_m} meter</strong> di atas permukaan laut
              </p>
            </div>

            {/* Root-Zone Moisture Indicator */}
            <div className="bg-[#20242B] p-3 rounded-[4px] border border-[#2C313A] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8A949E] flex items-center gap-1 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-[#00C2CC]" />
                  Kelembapan Zona Akar
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[3px] border font-mono text-[10.5px] ${
                    isCriticalMoisture
                      ? 'bg-[#2D1B1E] text-[#F87171] border-[#7F1D1D]/40'
                      : isWatchMoisture
                      ? 'bg-[#20242B] text-[#C1C7CD] border-[#2C313A]'
                      : 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
                  }`}
                >
                  {isCriticalMoisture ? 'KRITIS (<0.25)' : isWatchMoisture ? 'WASPADA (0.25-0.45)' : 'MEMADAI (>=0.45)'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[#F1F3F5]">{gwetroot.toFixed(2)}</span>
                <span className="text-xs text-[#8A949E]">/ 1.00 GWETROOT</span>
              </div>
            </div>

            {/* Active Pathway Recommendation Snapshot */}
            {currentPlan && (
              <div className="bg-[#20242B] p-3 rounded-[4px] border border-[#2C313A] flex flex-col gap-1">
                <span className="text-[11px] text-[#8A949E] font-mono uppercase tracking-wider">
                  Skenario Rotasi Aktif
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#F1F3F5]">{currentPlan.title}</span>
                  <span className="text-xs font-mono text-[#00C2CC] bg-[#163A40] px-2 py-0.5 rounded-[3px] border border-[#009DA5]/30">
                    Skor {currentPlan.compositeScore}/100
                  </span>
                </div>
                <p className="text-xs text-[#C1C7CD] mt-0.5 line-clamp-2">
                  {currentPlan.description}
                </p>
              </div>
            )}
          </div>

          {/* Verified Real-State Agronomic Insight Box */}
          <div className="p-3.5 rounded-[4px] bg-[#20242B] border border-[#2C313A] flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-[#009DA5] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-[#F1F3F5]">Wawasan Biofisik Lahan</span>
              <p className="text-xs text-[#8A949E] leading-relaxed">
                {getAgronomicInsight()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
