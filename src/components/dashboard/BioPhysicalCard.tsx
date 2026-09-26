'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Droplets, CloudRain, Layers, Activity, Gauge, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BioPhysicalCard() {
  const { soilData, climateData, isLoadingBioData, fetchBioPhysicalData, location } = useTerraShaftStore();

  const handleRefresh = () => {
    fetchBioPhysicalData(location.lat, location.lon);
  };

  // Status visual kelembapan SMAP
  const getWetnessBadge = (moisture: number) => {
    if (moisture < 0.25) {
      return { text: 'Kering Ekstrem', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    } else if (moisture < 0.45) {
      return { text: 'Defisit Air', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    } else if (moisture <= 0.80) {
      return { text: 'Lembab Cukup', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    return { text: 'Sangat Jenuh', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
  };

  // Status Karbon Organik Tanah (SOC)
  const getSOCBadge = (soc: number) => {
    if (soc < 1.0) return { text: 'Kritis Rendah', color: 'text-rose-400' };
    if (soc <= 2.0) return { text: 'Sedang (Perlu Cover Crop)', color: 'text-amber-400' };
    return { text: 'Tinggi (Tanah Sehat)', color: 'text-emerald-400' };
  };

  const wetness = climateData ? getWetnessBadge(climateData.rootZoneSoilMoisture) : { text: 'Memuat...', color: 'bg-slate-800 text-slate-400' };
  const socStatus = soilData ? getSOCBadge(soilData.soc) : { text: 'Memuat...', color: 'text-slate-400' };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-white text-sm">Bio-Physical Baseline</h3>
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                <CheckCircle className="w-2.5 h-2.5" /> Live Satelit
              </span>
            </div>
            <p className="text-xs text-slate-400">Observasi Asimilasi NASA POWER & ISRIC SoilGrids v2.0</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoadingBioData}
          title="Segarkan Data Satelit"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingBioData ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Grid Paramater Biofisik */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Kelembapan Akar SMAP */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Kelembapan Akar (SMAP)
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${wetness.color}`}>
              {wetness.text}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {climateData ? Math.round(climateData.rootZoneSoilMoisture * 100) : '--'}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Root-Zone Wetness (0–1.0)</p>
        </div>

        {/* 2. Curah Hujan Tahunan */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              Curah Hujan Tahunan
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {climateData ? climateData.annualRainfall_mm.toLocaleString('id-ID') : '--'}
            </span>
            <span className="text-xs text-slate-400">mm/tahun</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Akumulasi NASA Agroclimatology</p>
        </div>

        {/* 3. Karbon Organik Tanah (SOC) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              Karbon Organik (SOC)
            </span>
            <span className={`text-[10px] font-medium ${socStatus.color}`}>
              {soilData ? `${soilData.soc}%` : '--'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-amber-300">
              {soilData ? soilData.soc : '--'}
            </span>
            <span className="text-xs text-slate-400">% C-Organik</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{socStatus.text}</p>
        </div>

        {/* 4. Kapasitas Menahan Air (AWC) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Kapasitas Retensi (AWC)
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-300">
              {soilData ? soilData.awc : '--'}
            </span>
            <span className="text-xs text-slate-400">mm / 30cm</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Formula Pedotransfer ISRIC</p>
        </div>
      </div>

      {/* Profil Tekstur Tanah & Kimia */}
      {soilData && (
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Klasifikasi Tekstur USDA:</span>
            <span className="font-medium text-slate-200">{soilData.textureClass}</span>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-slate-400 block">Fraksi Tanah</span>
              <span className="font-mono text-[11px] text-slate-300">
                P:{soilData.sand}% | D:{soilData.silt}% | L:{soilData.clay}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">pH / KTK</span>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                {soilData.ph} / {soilData.cec}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
