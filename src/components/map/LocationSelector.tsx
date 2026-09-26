'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { MapPin, Navigation, Layers, Search, Compass, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Preset wilayah lahan kering & sentra pangan Indonesia (PRD Implementation Target)
const REGION_PRESETS = [
  { name: 'Kupang Timur, NTT', lat: -10.1542, lon: 123.8210, desc: 'Lahan Semi-Arid Tropis (Aluvial/Vertisol)' },
  { name: 'Gunungkidul, DIY', lat: -7.9656, lon: 110.6012, desc: 'Kawasan Karst & Tanah Mediteran Kering' },
  { name: 'Sumba Timur, NTT', lat: -9.6541, lon: 120.2642, desc: 'Sabana Kering & Defisit Air Tinggi' },
  { name: 'Indramayu, Jabar', lat: -6.3275, lon: 108.3242, desc: 'Sentra Padi/Palawija Dataran Rendah' },
  { name: 'Lombok Timur, NTB', lat: -8.6508, lon: 116.5342, desc: 'Lahan Kering Berpasir Gunung Rinjani' }
];

export default function LocationSelector() {
  const { location, setLocation, isLoadingBioData } = useTerraShaftStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Inisialisasi Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix icon Leaflet di Next.js bundler
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute"></div>
          <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
            🌱
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const initialMap = L.map(mapContainerRef.current, {
      center: [location.lat, location.lon],
      zoom: 12,
      zoomControl: false
    });

    // Default: Satellite imagery (Esri World Imagery)
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    );

    satelliteTile.addTo(initialMap);
    tileLayerRef.current = satelliteTile;

    const initialMarker = L.marker([location.lat, location.lon], {
      draggable: true,
      icon: customIcon
    }).addTo(initialMap);

    initialMarker.on('dragend', async (e) => {
      const marker = e.target;
      const position = marker.getLatLng();
      await setLocation(position.lat, position.lng);
    });

    initialMap.on('click', async (e) => {
      initialMarker.setLatLng(e.latlng);
      await setLocation(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = initialMap;
    markerRef.current = initialMarker;

    return () => {
      initialMap.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update posisi marker & center peta saat lokasi store berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const currentLatLng = markerRef.current.getLatLng();
    if (Math.abs(currentLatLng.lat - location.lat) > 0.0001 || Math.abs(currentLatLng.lng - location.lon) > 0.0001) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      mapInstanceRef.current.setView([location.lat, location.lon], 12, { animate: true });
    }
  }, [location.lat, location.lon]);

  // Toggle basemap Satelit vs Street
  const handleToggleBasemap = (type: 'satellite' | 'streets') => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = type === 'satellite'
      ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          attribution: 'Esri Satellite'
        })
      : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        });

    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    setMapType(type);
  };

  // Preset click
  const handleSelectPreset = async (preset: typeof REGION_PRESETS[0]) => {
    await setLocation(preset.lat, preset.lon, preset.name);
  };

  // Search geocoding sederhana via Nominatim OSM
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Indonesia')}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        await setLocation(lat, lon, item.display_name.split(',')[0]);
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Peta Interaktif Lahan Pertanian</h3>
            <p className="text-xs text-slate-400">Pilih titik atau geser pin untuk kalkulasi satelit</p>
          </div>
        </div>

        {/* Toggle Layer Satelit vs OpenStreetMap */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => handleToggleBasemap('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
              mapType === 'satellite'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Satelit NASA
          </button>
          <button
            type="button"
            onClick={() => handleToggleBasemap('streets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
              mapType === 'streets'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Peta Jalan
          </button>
        </div>
      </div>

      {/* Form Cari Lokasi */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kecamatan, kabupaten, atau desa (mis: Kupang, Gunungkidul)..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-24 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-1.5 top-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all"
        >
          {isSearching ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {/* Map Container */}
      <div className="relative w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Loading Overlay */}
        {isLoadingBioData && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-emerald-300 font-medium">Sinkronisasi NASA POWER & ISRIC SoilGrids...</p>
          </div>
        )}

        {/* Koordinat Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 shadow">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-emerald-300 font-semibold">{location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°</span>
        </div>
      </div>

      {/* Presets Lahan Kering Indonesia */}
      <div>
        <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Preset Kawasan Sentra Lahan Kering Indonesia:</span>
        <div className="flex flex-wrap gap-1.5">
          {REGION_PRESETS.map((p) => {
            const isSelected = Math.abs(p.lat - location.lat) < 0.01 && Math.abs(p.lon - location.lon) < 0.01;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
