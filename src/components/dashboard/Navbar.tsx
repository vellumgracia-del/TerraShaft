'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Sun, Moon, Radio, Share2, Database, MapPin, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenCropLibrary: () => void;
  onOpenExportModal: () => void;
}

export default function Navbar({ onOpenCropLibrary, onOpenExportModal }: NavbarProps) {
  const { location, elevation_m, satelliteSyncTime, isFieldMode, toggleFieldMode, isLoadingBioData } = useTerraShaftStore();

  const formattedUTC = React.useMemo(() => {
    try {
      const d = new Date(satelliteSyncTime);
      return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
      return 'LIVE TELEMETRY';
    }
  }, [satelliteSyncTime]);

  return (
    <header className="border-b border-[#1E293B] bg-[#0B0F17] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Brand & Mission Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#131B2E] border border-[#1E293B] flex items-center justify-center text-[#06B6D4] font-mono font-bold text-xs">
            TR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
                TERRAROTATE <span className="text-[#06B6D4]">TELEMETRY</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#131B2E] text-slate-400 border border-[#1E293B] rounded">
                MISSION-CRITICAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Adaptive Soil Regeneration & Biophysical Deficit Engine
            </p>
          </div>
        </div>

        {/* Middle: Real-time Telemetry Metadata Strip */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] font-mono bg-[#131B2E] px-3.5 py-1.5 rounded border border-[#1E293B]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="tabular-nums">
              LAT {location.lat.toFixed(4)}° | LON {location.lon.toFixed(4)}° | ALT {elevation_m}m
            </span>
          </div>

          <div className="w-px h-3.5 bg-slate-700" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className={`w-3 h-3 ${isLoadingBioData ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span className="tabular-nums">{formattedUTC}</span>
          </div>

          <div className="w-px h-3.5 bg-slate-700" />

          {/* Sensor Feed Status */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="px-1 py-0.2 bg-slate-800 text-[#06B6D4] border border-slate-700 rounded font-semibold">SMAP L4</span>
            <span className="px-1 py-0.2 bg-slate-800 text-[#38BDF8] border border-slate-700 rounded font-semibold">GPM</span>
            <span className="px-1 py-0.2 bg-slate-800 text-[#EAB308] border border-slate-700 rounded font-semibold">CERES</span>
            <span className="px-1 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold">SOILGRIDS</span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          {/* High-Contrast Outdoor Field Mode Toggle */}
          <button
            type="button"
            onClick={toggleFieldMode}
            className={`px-3 py-1.5 rounded border font-mono text-xs transition-colors flex items-center gap-1.5 ${
              isFieldMode
                ? 'bg-black text-white border-black font-bold'
                : 'bg-[#131B2E] hover:bg-slate-800 text-slate-300 border-[#1E293B]'
            }`}
            title="Aktifkan Mode Lapangan Kontras Tinggi untuk Keterbacaan di Bawah Terik Matahari"
          >
            {isFieldMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isFieldMode ? 'Mode Lapangan [Aktif]' : 'Mode Lapangan'}</span>
          </button>

          {/* Pustaka Tanaman */}
          <button
            type="button"
            onClick={onOpenCropLibrary}
            className="px-3 py-1.5 rounded border border-[#1E293B] bg-[#131B2E] hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="hidden sm:inline">Pustaka</span>
          </button>

          {/* Export Action Sheet Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-3 py-1.5 rounded border border-[#2563EB] bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 shadow-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Action Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
}
