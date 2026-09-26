'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area
} from 'recharts';
import { MapPin, Navigation, Compass, Layers, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Preset Kawasan Lahan Kering Indonesia
const REGION_PRESETS = [
  { name: 'Kupang Timur, NTT', lat: -10.1542, lon: 123.8210, elevation: 85 },
  { name: 'Gunungkidul, DIY', lat: -7.9656, lon: 110.6012, elevation: 220 },
  { name: 'Sumba Timur, NTT', lat: -9.6541, lon: 120.2642, elevation: 60 },
  { name: 'Indramayu, Jabar', lat: -6.3275, lon: 108.3242, elevation: 12 },
  { name: 'Lombok Timur, NTB', lat: -8.6508, lon: 116.5342, elevation: 140 }
];

export default function WaterBalanceCenter() {
  const { location, setLocation, plans, selectedPathway, climateData, soilData, elevation_m } = useTerraShaftStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<'carto' | 'satellite'>('carto');

  const currentPlan = plans ? plans[selectedPathway] : null;

  // Inisialisasi Peta Minimalis Monokromatik (Carto Dark Matter)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = leafletModule.default;

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-[#06B6D4]/30 animate-ping absolute"></div>
            <div class="w-5 h-5 rounded-full bg-[#06B6D4] border-2 border-white flex items-center justify-center text-slate-950 font-bold text-[9px] shadow-sm">
              ●
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lon],
        zoom: 11,
        zoomControl: false
      });

      const cartoDark = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; CartoDB & OpenStreetMap'
        }
      );

      cartoDark.addTo(map);
      tileLayerRef.current = cartoDark;

      const marker = L.marker([location.lat, location.lon], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const pos = e.target.getLatLng();
        await setLocation(pos.lat, pos.lng);
      });

      map.on('click', async (e) => {
        marker.setLatLng(e.latlng);
        await setLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update posisi saat lokasi berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const pos = markerRef.current.getLatLng();
    if (Math.abs(pos.lat - location.lat) > 0.0001 || Math.abs(pos.lng - location.lon) > 0.0001) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      mapInstanceRef.current.setView([location.lat, location.lon], 11, { animate: true });
    }
  }, [location.lat, location.lon]);

  const toggleBasemap = (mode: 'carto' | 'satellite') => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((leafletModule) => {
      if (!mapInstanceRef.current) return;
      const L = leafletModule.default;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const layer = mode === 'carto'
        ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; CartoDB'
          })
        : L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: 'Esri Satellite'
          });

      layer.addTo(mapInstanceRef.current);
      tileLayerRef.current = layer;
      setMapMode(mode);
    });
  };

  // Data Dual-Axis Timeseries (ETc vs Presipitasi per 4 Musim)
  const chartData = currentPlan?.seasons.map((s) => ({
    name: s.monthRange,
    fullName: s.seasonName.split('(')[0].trim(),
    cropName: s.crop.name,
    'Presipitasi GPM (mm)': s.expectedRain_mm,
    'Kebutuhan Air ETc (mm)': s.waterDemand_mm,
    'Defisit Air Wdeficit (mm)': s.waterDeficit_mm
  })) || [];

  // Soil Battery Metrics
  const batteryScore = currentPlan?.soilBatteryScore ?? 50;
  const initialBattery = currentPlan?.initialBatteryScore ?? 50;
  const batteryDelta = batteryScore - initialBattery;
  const isCharging = batteryDelta >= 0;

  return (
    <div className="flex flex-col gap-3 font-mono text-slate-200">
      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ZONA 2: KOMPUTASI SPASIAL NERACA AIR & BATERAI TANAH
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Skenario: <strong className="text-white">{selectedPathway}</strong>
        </span>
      </div>

      {/* 1. Scientific Geo-Locator Map (Peta Minimalis Monokromatik) */}
      <div className="telemetry-card rounded border border-[#1E293B] bg-[#131B2E] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">OBSERVASI SPASIAL LAHAN</span>
            <span className="text-[10px] text-slate-400">({location.placeName || 'Lahan Target'})</span>
          </div>

          {/* Toggle Map Mode */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => toggleBasemap('carto')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mapMode === 'carto' ? 'bg-[#1E293B] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Carto Dark
            </button>
            <button
              type="button"
              onClick={() => toggleBasemap('satellite')}
              className={`px-2 py-0.5 rounded transition-colors ${
                mapMode === 'satellite' ? 'bg-[#1E293B] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satelit
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full h-[180px] rounded border border-slate-800 overflow-hidden relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 z-[400] bg-[#0B0F17]/90 px-2 py-1 rounded border border-[#1E293B] text-[10px] text-slate-300">
            PIN: <span className="tabular-nums text-[#06B6D4]">{location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5">
          <span className="text-slate-500 shrink-0">Preset Lahan:</span>
          {REGION_PRESETS.map((p) => {
            const isMatch = Math.abs(p.lat - location.lat) < 0.01;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setLocation(p.lat, p.lon, p.name, p.elevation)}
                className={`px-2 py-0.5 rounded border transition-colors shrink-0 ${
                  isMatch
                    ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#06B6D4] font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.name.split(',')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dual-Axis Water Balance Chart (ETc vs Presipitasi Harian/Musiman) */}
      <div className="telemetry-card rounded border border-[#1E293B] bg-[#131B2E] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300">DUAL-AXIS WATER BALANCE</span>
            <p className="text-[10px] text-slate-400 font-sans">
              Presipitasi GPM (Batang Sky Blue) vs Kebutuhan Air ETc Tanaman (Garis Amber)
            </p>
          </div>

          {/* Critical Threshold Deficit Alert Indicator */}
          {currentPlan && currentPlan.seasons.some((s) => s.waterDeficit_mm > 100) && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-950/40 border border-red-800 text-[#EF4444] text-[10px] rounded font-bold">
              <AlertTriangle className="w-3 h-3" />
              <span>DEFISIT KRITIS {'>'} 100mm TERDETEKSI</span>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-[220px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="2 2" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              {/* Sumbu Y Kiri: Presipitasi (mm) */}
              <YAxis
                yAxisId="left"
                stroke="#64748B"
                tick={{ fill: '#38BDF8', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              {/* Sumbu Y Kanan: ETc (mm) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748B"
                tick={{ fill: '#F59E0B', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0F17',
                  borderColor: '#1E293B',
                  borderRadius: '0.25rem',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />

              {/* Sumbu Y Kiri: Bar Presipitasi (Sky Blue #38BDF8) */}
              <Bar
                yAxisId="left"
                dataKey="Presipitasi GPM (mm)"
                fill="#38BDF8"
                opacity={0.85}
                barSize={32}
              />

              {/* Sumbu Y Kanan: Line ETc Kebutuhan Air (Amber #F59E0B) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Kebutuhan Air ETc (mm)"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#F59E0B' }}
              />

              {/* Shading Defisit Air (Red #EF4444) */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="Defisit Air Wdeficit (mm)"
                fill="#EF4444"
                stroke="#EF4444"
                fillOpacity={0.25}
                strokeWidth={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>*Shading area merah menandakan $W_{'{deficit}'}$ (risiko cekaman kekeringan).</span>
          <span>AWC Tanah: <strong className="text-[#06B6D4]">{soilData?.awc ?? 30.3} mm</strong></span>
        </div>
      </div>

      {/* 3. The Soil Battery State Machine Card */}
      <div className="telemetry-card rounded border border-[#1E293B] bg-[#131B2E] p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-xs font-bold text-slate-300">THE SOIL BATTERY (CADANGAN BIOFISIK)</span>
          </div>

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${
            isCharging
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
              : 'bg-red-950/40 text-[#EF4444] border-red-800'
          }`}>
            {isCharging ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{isCharging ? `CHARGING (+${batteryDelta}%)` : `DISCHARGING (${batteryDelta}%)`}</span>
          </div>
        </div>

        {/* Battery Telemetry Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400">Status Kapasitas Akhir (4 Musim)</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold tabular-nums ${batteryScore >= 60 ? 'text-[#06B6D4]' : batteryScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {batteryScore}%
              </span>
              <span className="text-slate-500 text-[10px]">/ 100%</span>
            </div>
          </div>

          {/* Engineering Battery Track */}
          <div className="w-full h-4 bg-slate-900 border border-slate-700 rounded-sm p-0.5 flex items-center relative overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-sm ${
                batteryScore >= 60 ? 'bg-[#06B6D4]' : batteryScore >= 40 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, batteryScore))}%` }}
            />
            {/* Grid Notches */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-800" />
            <div className="absolute left-2/4 top-0 bottom-0 w-px bg-slate-800" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-800" />
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 tabular-nums">
            <span>Baseline Awal: {initialBattery}%</span>
            <span>+15% per Legum / -20% Sereal Beruntun</span>
            <span>Kapasitas Target: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
