'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { BatteryCharging, Zap, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

export default function SoilBatteryGauge() {
  const { plans, selectedPathway, soilData } = useTerraShaftStore();
  const currentPlan = plans ? plans[selectedPathway] : null;

  const batteryScore = currentPlan ? currentPlan.soilBatteryScore : 50;
  const initialBattery = currentPlan ? currentPlan.initialBatteryScore : 50;
  const batteryDelta = batteryScore - initialBattery;

  // Penentuan warna status baterai
  const getBatteryTheme = (score: number) => {
    if (score >= 65) {
      return {
        barColor: 'from-emerald-500 to-teal-400',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-500/10',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        status: 'Recharged (Subur Aktif)'
      };
    } else if (score >= 40) {
      return {
        barColor: 'from-amber-500 to-yellow-400',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-500/10',
        glowColor: 'rgba(245, 158, 11, 0.3)',
        status: 'Moderate (Cukup Hara)'
      };
    }
    return {
      barColor: 'from-rose-600 to-red-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-500/10',
      glowColor: 'rgba(239, 68, 68, 0.35)',
      status: 'Draining (Kritis Terkuras)'
    };
  };

  const theme = getBatteryTheme(batteryScore);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">The Soil Battery Engine</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${theme.bgColor} ${theme.textColor} ${theme.borderColor}`}>
                {theme.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">Model Biofisik Dinamika Kapasitas Hara & SOC Tanah</p>
          </div>
        </div>

        {/* Delta Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold ${
          batteryDelta >= 0
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        }`}>
          {batteryDelta >= 0 ? (
            <>
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{batteryDelta}% Charged</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{batteryDelta}% Drained</span>
            </>
          )}
        </div>
      </div>

      {/* Visual Tabung Baterai Modern Horizontal & Vertical */}
      <div className="relative bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
        {/* Glow Background Effect */}
        <div
          className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: theme.glowColor }}
        />

        {/* Angka Besar Persentase & Status */}
        <div className="flex items-center gap-4 z-10">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Kapasitas Baterai Akhir (4 Musim)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${theme.textColor}`}>
                {batteryScore}%
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100%</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Baseline Awal: <strong className="text-slate-200">{initialBattery}%</strong> (dari {soilData?.soc || 1.1}% SOC)
            </span>
          </div>
        </div>

        {/* Tabung Baterai Representatif */}
        <div className="w-full sm:w-56 flex flex-col gap-1.5 z-10">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>0% Kosong</span>
            <span className="text-slate-300 font-mono">{batteryScore}% Terisi</span>
            <span>100% Penuh</span>
          </div>

          {/* Bar Baterai Fisik dengan Tip Cap */}
          <div className="relative flex items-center">
            <div className="w-full h-8 bg-slate-900 border-2 border-slate-700 rounded-xl p-1 overflow-hidden shadow-inner relative flex items-center">
              {/* Segmen Batang Pengisian */}
              <div
                className={`h-full rounded-lg bg-gradient-to-r ${theme.barColor} transition-all duration-700 ease-out shadow-lg relative`}
                style={{ width: `${Math.max(5, Math.min(100, batteryScore))}%` }}
              >
                {/* Animasi kilau cahaya pada cairan baterai */}
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg" />
              </div>

              {/* Garis Grid Penanda 25%, 50%, 75% */}
              <div className="absolute left-1/4 top-1 bottom-1 w-px bg-slate-700/50" />
              <div className="absolute left-2/4 top-1 bottom-1 w-px bg-slate-700/50" />
              <div className="absolute left-3/4 top-1 bottom-1 w-px bg-slate-700/50" />
            </div>

            {/* Terminal Positif Baterai */}
            <div className="w-1.5 h-4 bg-slate-600 rounded-r -ml-0.5" />
          </div>
        </div>
      </div>

      {/* Grid Status Hara & Perbaikan Fisika Tanah */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Neraca Nitrogen
          </span>
          <span className="font-mono text-xs font-bold text-emerald-300">
            {currentPlan ? (currentPlan.netNitrogenDelta > 0 ? `+${currentPlan.netNitrogenDelta}` : currentPlan.netNitrogenDelta) : '0'} kg N/ha
          </span>
          <span className="text-[10px] text-slate-500">Pasokan hara alami</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" />
            Input Karbon
          </span>
          <span className="font-semibold text-xs text-amber-300">
            {selectedPathway === 'A' ? 'Sangat Tinggi' : selectedPathway === 'B' ? 'Tinggi' : 'Sedang'}
          </span>
          <span className="text-[10px] text-slate-500">Regenerasi biomasa</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" />
            Penghematan Air
          </span>
          <span className="font-mono text-xs font-bold text-sky-300">
            {currentPlan ? `${currentPlan.waterSavingsPct}%` : '0%'}
          </span>
          <span className="text-[10px] text-slate-500">vs monokultur jagung</span>
        </div>
      </div>
    </div>
  );
}
