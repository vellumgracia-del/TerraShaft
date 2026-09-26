'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Droplets, CloudRain, Sun, Activity, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function SatelliteTelemetryRack() {
  const { climateData, soilData, isLoadingBioData, fetchBioPhysicalData, location } = useTerraShaftStore();

  // Parameter SMAP GWETROOT (0.00 - 1.00)
  const gwetroot = climateData ? climateData.rootZoneSoilMoisture : 0.38;
  const isCriticalDeficit = gwetroot < 0.25;
  const isWatch = gwetroot >= 0.25 && gwetroot < 0.45;

  // Nilai CERES & MERRA-2 terkini
  const currentMonthIdx = new Date().getMonth();
  const currentMonthData = climateData?.monthlyData?.[currentMonthIdx] || climateData?.monthlyData?.[0];

  const dailyET0 = currentMonthData ? (currentMonthData.et0_mm / 30).toFixed(1) : '3.8';
  const solarRad = currentMonthData ? currentMonthData.solar_radiation_mj.toFixed(1) : '18.5';
  const tMin = currentMonthData ? currentMonthData.tmin_c : 22.0;
  const tMax = currentMonthData ? currentMonthData.tmax_c : 32.0;
  const deltaT = (tMax - tMin).toFixed(1);
  const tMean = currentMonthData ? currentMonthData.tmean_c.toFixed(1) : '27.0';

  // Nilai GPM Presipitasi
  const annualRain = climateData ? climateData.annualRainfall_mm : 1327;
  const currentRain = currentMonthData ? (currentMonthData.rainfall_mm / 30).toFixed(1) : '3.2';

  return (
    <div className="flex flex-col gap-3 font-mono text-slate-200">
      {/* Rack Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ZONA 1: TELEMETRI BIOFISIK SATELIT
          </span>
        </div>
        <button
          type="button"
          onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
          disabled={isLoadingBioData}
          title="Sinkronisasi Ulang NASA POWER & SoilGrids"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBioData ? 'animate-spin text-[#06B6D4]' : ''}`} />
        </button>
      </div>

      {/* 1. NASA SMAP: Root-Zone Soil Wetness (GWETROOT) */}
      <div className="telemetry-card p-3.5 rounded border border-[#1E293B] bg-[#131B2E] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
            <span className="text-xs font-bold text-slate-300">NASA SMAP: GWETROOT</span>
          </div>
          <span className="text-[10px] text-slate-400">L4_SM (0–100cm)</span>
        </div>

        {/* Large Monospace Value & Status Badge */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold tabular-nums tracking-tight ${
              isCriticalDeficit ? 'text-[#EF4444]' : isWatch ? 'text-[#F59E0B]' : 'text-[#06B6D4]'
            }`}>
              {gwetroot.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/ 1.00</span>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
            isCriticalDeficit
              ? 'bg-red-950/40 text-[#EF4444] border-red-800/80'
              : isWatch
              ? 'bg-amber-950/40 text-[#F59E0B] border-amber-800/80'
              : 'bg-cyan-950/40 text-[#06B6D4] border-cyan-800/80'
          }`}>
            {isCriticalDeficit ? 'CRITICAL DEFICIT (<0.25)' : isWatch ? 'WATCH DEFICIT (0.25-0.45)' : 'ADEQUATE ROOT RESERVES'}
          </span>
        </div>

        {/* Segmented Linear Gauge Bar with Red Threshold Notch at 0.25 */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="relative w-full h-3 bg-slate-900 border border-slate-700/80 rounded-sm overflow-hidden">
            {/* Zone 1: Critical (0 - 0.25) -> Red */}
            <div className="absolute left-0 top-0 bottom-0 w-[25%] bg-red-900/40 border-r border-red-500" />
            {/* Zone 2: Watch (0.25 - 0.45) -> Amber */}
            <div className="absolute left-[25%] top-0 bottom-0 w-[20%] bg-amber-900/30 border-r border-amber-500" />
            {/* Zone 3: Optimal (0.45 - 1.0) -> Cyan */}
            <div className="absolute left-[45%] top-0 bottom-0 w-[55%] bg-cyan-950/30" />

            {/* Level Fill Indicator */}
            <div
              className={`h-full transition-all duration-500 ${
                isCriticalDeficit ? 'bg-[#EF4444]' : isWatch ? 'bg-[#F59E0B]' : 'bg-[#06B6D4]'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, gwetroot * 100))}%` }}
            />

            {/* 0.25 Critical Threshold Notch (Garis Penanda Ambang Kritis) */}
            <div
              className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-red-400 z-10"
              title="Ambang Batas Kritis Kekeringan (0.25)"
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 tabular-nums">
            <span>0.00 Kering</span>
            <span className="text-red-400 font-bold">▲ 0.25 AMBANG KRITIS</span>
            <span>1.00 Jenuh</span>
          </div>
        </div>
      </div>

      {/* 2. NASA GPM: Presipitasi Terkoreksi (PRECTOTCORR) */}
      <div className="telemetry-card p-3.5 rounded border border-[#1E293B] bg-[#131B2E] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span className="text-xs font-bold text-slate-300">NASA GPM: PRECTOTCORR</span>
          </div>
          <span className="text-[10px] text-slate-400">IMERG V06</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Laju Harian Rataan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-[#38BDF8] tabular-nums">{currentRain}</span>
              <span className="text-[10px] text-slate-500">mm/hari</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Akumulasi Tahunan</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-slate-200 tabular-nums">{annualRain}</span>
              <span className="text-[10px] text-slate-500">mm/thn</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-sans bg-slate-900/80 p-1.5 rounded border border-slate-800/80 flex items-center justify-between">
          <span>Profil Neraca Musim:</span>
          <span className="font-mono text-slate-300">
            {annualRain < 1000 ? 'Semi-Arid Kering' : annualRain < 2000 ? 'Monsoon Sedang' : 'Basah / Rendeng'}
          </span>
        </div>
      </div>

      {/* 3. NASA CERES & MERRA-2: Driver Evapotranspirasi (ET0) */}
      <div className="telemetry-card p-3.5 rounded border border-[#1E293B] bg-[#131B2E] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
            <span className="text-xs font-bold text-slate-300">CERES & MERRA-2: EVAPOTRANSPIRASI</span>
          </div>
          <span className="text-[10px] text-slate-400">Hargreaves-Samani</span>
        </div>

        <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Acuan Evapotranspirasi (ET₀)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#EAB308] tabular-nums">{dailyET0}</span>
              <span className="text-[10px] text-slate-500">mm/hari</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-sans">Laju Penguapan</span>
            <span className="text-xs text-slate-300 font-bold">{parseFloat(dailyET0) > 4.5 ? 'Tinggi' : 'Normal'}</span>
          </div>
        </div>

        {/* Derived Physics Table */}
        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800 text-[10px]">
          <div className="bg-slate-900/60 p-1 rounded text-center">
            <span className="text-slate-500 block">Radiasi (Ra)</span>
            <span className="font-bold text-slate-200 tabular-nums">{solarRad} MJ</span>
          </div>
          <div className="bg-slate-900/60 p-1 rounded text-center">
            <span className="text-slate-500 block">Fluktuasi ΔT</span>
            <span className="font-bold text-slate-200 tabular-nums">{deltaT}°C</span>
          </div>
          <div className="bg-slate-900/60 p-1 rounded text-center">
            <span className="text-slate-500 block">Suhu Rataan</span>
            <span className="font-bold text-slate-200 tabular-nums">{tMean}°C</span>
          </div>
        </div>
      </div>

      {/* 4. ISRIC SoilGrids v2.0: Profil Fisika Tanah */}
      <div className="telemetry-card p-3.5 rounded border border-[#1E293B] bg-[#131B2E] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">ISRIC SOILGRIDS (0–30cm)</span>
          <span className="text-[10px] text-slate-400">Pedotransfer AWC</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800 text-center">
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block">Retensi (AWC)</span>
            <span className="text-sm font-bold text-[#06B6D4] tabular-nums">{soilData?.awc ?? 30.3}</span>
            <span className="text-[9px] text-slate-500 block">mm / 30cm</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block">SOC Karbon</span>
            <span className="text-sm font-bold text-amber-300 tabular-nums">{soilData?.soc ?? 1.15}%</span>
            <span className="text-[9px] text-slate-500 block">C-Organik</span>
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <span className="text-[9px] text-slate-500 block">pH / KTK</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{soilData?.ph ?? 6.4}</span>
            <span className="text-[9px] text-slate-500 block">{soilData?.cec ?? 19} cmol</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
          <span>Kelas Tekstur USDA:</span>
          <strong className="text-slate-200 font-mono">{soilData?.textureClass || 'Lempung Liat Berpasir'}</strong>
        </div>
      </div>
    </div>
  );
}
