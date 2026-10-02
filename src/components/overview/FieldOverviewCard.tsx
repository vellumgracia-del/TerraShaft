'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  MapPin,
  Sparkles,
  Compass,
  Droplets
} from 'lucide-react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const REGION_PRESETS = [
  { name: 'Kupang Timur', full: 'Kupang Timur, Kab. Kupang, NTT', lat: -10.1542, lon: 123.8210, elevation: 85 },
  { name: 'Gunungkidul', full: 'Gunungkidul, D.I. Yogyakarta', lat: -7.9656, lon: 110.6012, elevation: 220 },
  { name: 'Sumba Timur', full: 'Sumba Timur, Nusa Tenggara Timur', lat: -9.6541, lon: 120.2642, elevation: 60 },
  { name: 'Indramayu', full: 'Indramayu, Jawa Barat', lat: -6.3275, lon: 108.3242, elevation: 12 },
  { name: 'Lombok Timur', full: 'Lombok Timur, Nusa Tenggara Barat', lat: -8.6508, lon: 116.5342, elevation: 140 }
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
      return 'Mode failover regional aktif: Menggunakan model agroklimat dan pedologi regional terkalibrasi Nusa Tenggara.';
    }
    if (!isNasaFallback && isSoilFallback) {
      return 'Telemetri iklim bersumber dari API NASA POWER (baseline historis 1-tahun). Sifat fisik tanah menggunakan profil regional terkalibrasi Nusa Tenggara karena respons hulu SoilGrids tidak tersedia.';
    }
    if (isNasaFallback && !isSoilFallback) {
      return 'Profil tanah bersumber dari API ISRIC SoilGrids (0–30cm). Data iklim menggunakan klimatologi regional terkalibrasi Nusa Tenggara.';
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
              🌱
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
    <div className="agri-card p-5 lg:p-6 flex flex-col gap-5">
      {/* Header of Main Field Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4EAE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E7F5EE] text-[#12A875]">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#17231F] tracking-tight">
              Observasi Lahan & Koordinat Spasial
            </h2>
          </div>
          <p className="text-xs text-[#7B8681] mt-0.5">
            Klik peta atau geser pin hijau untuk menentukan lokasi lahan budidaya
          </p>
        </div>

        {/* Map Layer Switcher */}
        <div className="inline-flex p-1 bg-[#F5F7F4] border border-[#E4EAE6] rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleToggleBasemap('streets')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mapType === 'streets'
                ? 'bg-white text-[#17231F] shadow-xs font-bold'
                : 'text-[#7B8681] hover:text-[#17231F]'
            }`}
          >
            Peta Terang
          </button>
          <button
            type="button"
            onClick={() => handleToggleBasemap('satellite')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mapType === 'satellite'
                ? 'bg-white text-[#17231F] shadow-xs font-bold'
                : 'text-[#7B8681] hover:text-[#17231F]'
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
            className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-[#E4EAE6] shadow-xs"
            style={{ isolation: 'isolate', zIndex: 10 }}
          >
            <div ref={mapContainerRef} className="w-full h-full relative" style={{ zIndex: 1 }} />

            {/* Floating Coordinate Pill on Map */}
            <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E4EAE6] text-xs font-mono text-[#17231F] shadow-xs flex items-center gap-1.5 pointer-events-auto">
              <MapPin className="w-3.5 h-3.5 text-[#12A875]" />
              <span>
                {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
              </span>
              <span className="text-[#9CA3AF]">|</span>
              <span className="text-[#52605B]">{elevation_m}m dpl</span>
            </div>

            {/* Loading Indicator Overlay */}
            {isLoadingBioData && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-30 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#E4EAE6] shadow-md text-xs font-medium text-[#17231F]">
                  <div className="w-4 h-4 border-2 border-[#12A875] border-t-transparent rounded-full animate-spin" />
                  <span>Memuat telemetri biofisik...</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Location Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#7B8681] font-semibold text-[11px] uppercase tracking-wider mr-1">
              Preset Wilayah:
            </span>
            {REGION_PRESETS.map((preset) => {
              const isSelected =
                Math.abs(location.lat - preset.lat) < 0.001 && Math.abs(location.lon - preset.lon) < 0.001;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setLocation(preset.lat, preset.lon, preset.full, preset.elevation)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#12A875] text-white border-[#12A875] shadow-xs font-semibold'
                      : 'bg-white border-[#E4EAE6] text-[#52605B] hover:bg-[#F5F7F4] hover:text-[#17231F]'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Selected Field Context & Live State Insight (4 Col) */}
        <div className="lg:col-span-4 flex flex-col gap-4 justify-between bg-[#F5F7F4] p-4 sm:p-5 rounded-2xl border border-[#E4EAE6]">
          {/* Field Details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8681]">
                Informasi Lahan
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#E4EAE6] text-[11px] font-semibold text-[#17231F]">
                Zona Terpilih
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#17231F] leading-snug">
                {location.placeName || `${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}°`}
              </h3>
              <p className="text-xs text-[#7B8681] mt-0.5">
                Ketinggian Lahan: <strong className="text-[#17231F] font-mono">{elevation_m} meter</strong> di atas permukaan laut
              </p>
            </div>

            {/* Root-Zone Moisture Indicator */}
            <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7B8681] flex items-center gap-1 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />
                  Kelembapan Zona Akar
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isCriticalMoisture
                      ? 'bg-[#FDEAEA] text-[#E11D48]'
                      : isWatchMoisture
                      ? 'bg-[#FFF4D8] text-[#D97706]'
                      : 'bg-[#E7F5EE] text-[#12A875]'
                  }`}
                >
                  {isCriticalMoisture ? 'Kritis (<0.25)' : isWatchMoisture ? 'Waspada (0.25–0.45)' : 'Memadai (≥0.45)'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-[#17231F]">{gwetroot.toFixed(2)}</span>
                <span className="text-xs text-[#7B8681]">/ 1.00 GWETROOT</span>
              </div>
            </div>

            {/* Active Pathway Recommendation Snapshot */}
            {currentPlan && (
              <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] flex flex-col gap-1">
                <span className="text-[11px] text-[#7B8681] font-semibold uppercase tracking-wider">
                  Skenario Rotasi Aktif
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#17231F]">{currentPlan.title}</span>
                  <span className="text-xs font-bold text-[#12A875] bg-[#E7F5EE] px-2 py-0.5 rounded-full">
                    Skor {currentPlan.compositeScore}/100
                  </span>
                </div>
                <p className="text-xs text-[#52605B] mt-0.5 line-clamp-2">
                  {currentPlan.description}
                </p>
              </div>
            )}
          </div>

          {/* Verified Real-State Agronomic Insight Box */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E4EAE6] flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-[#12A875] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#17231F]">Wawasan Biofisik Lahan</span>
              <p className="text-xs text-[#52605B] leading-relaxed">
                {getAgronomicInsight()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
