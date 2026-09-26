'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Calendar, Droplets, Zap, ShieldCheck, AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RotationTimeline() {
  const { plans, selectedPathway } = useTerraShaftStore();
  const currentPlan = plans ? plans[selectedPathway] : null;

  if (!currentPlan) return null;

  const getCropCategoryColor = (category: string) => {
    switch (category) {
      case 'Cover Crop':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Legume':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Cereal':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Cereal / Forage':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const getCropEmoji = (id: string, icon: string) => {
    switch (id) {
      case 'jagung_hibrida': return '🌽';
      case 'padi_gogo': return '🌾';
      case 'kedelai': return '🫘';
      case 'kacang_hijau': return '🌱';
      case 'sorgum': return '🌾';
      case 'crotalaria': return '🌼';
      default: return '🌿';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Horizon Rotation Timeline (Gantt 4 Musim)</h3>
            <p className="text-xs text-slate-400">Siklus kalender tanam adaptif berkesinambungan 12 bulan penuh</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <span className="font-medium text-slate-400">Skenario Aktif:</span>
          <span className="font-bold text-emerald-400">{currentPlan.title}</span>
        </div>
      </div>

      {/* 4 Musim Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {currentPlan.seasons.map((alloc, idx) => {
          const crop = alloc.crop;
          const isDry = idx >= 2;
          const emoji = getCropEmoji(crop.id, crop.icon);
          const catStyle = getCropCategoryColor(crop.category);

          return (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between gap-3 relative hover:border-slate-700 transition-all shadow-md group"
            >
              {/* Season Badge Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 font-mono text-xs flex items-center justify-center font-bold">
                    {alloc.seasonIndex}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {alloc.monthRange}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                  isDry ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                }`}>
                  {isDry ? 'Musim Kemarau' : 'Musim Rendeng/Hujan'}
                </span>
              </div>

              {/* Crop Hero Card */}
              <div className="flex items-start gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800/60">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shadow">
                  {emoji}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-[10px] w-fit px-1.5 py-0.2 rounded border font-medium ${catStyle}`}>
                    {crop.category}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-0.5 leading-snug">
                    {crop.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {crop.growth_duration_days} hari tanam
                  </span>
                </div>
              </div>

              {/* Rekomendasi Varietas Unggul */}
              {crop.recommended_variety && (
                <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-slate-800/50 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="text-[10px] text-slate-300 truncate">
                    <span className="text-slate-400">Varietas: </span>
                    <strong className="text-slate-200">{crop.recommended_variety}</strong>
                  </div>
                </div>
              )}

              {/* Metrics Status Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {/* Air & Defisit */}
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    Kebutuhan Air
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono font-bold text-slate-200">{alloc.waterDemand_mm}</span>
                    <span className="text-[9px] text-slate-400">mm</span>
                  </div>
                  <div className="mt-1">
                    {alloc.waterDeficit_mm > 0 ? (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Defisit: {alloc.waterDeficit_mm}mm
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Cukup Air
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Hara / Baterai */}
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Efek Baterai
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`font-mono font-bold text-xs ${
                      alloc.batteryDelta_pct > 0 ? 'text-emerald-400' : alloc.batteryDelta_pct < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {alloc.batteryDelta_pct > 0 ? `+${alloc.batteryDelta_pct}%` : `${alloc.batteryDelta_pct}%`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 truncate">
                    {alloc.nitrogenDelta_kg_ha > 0 ? `+${alloc.nitrogenDelta_kg_ha}kg N` : `${alloc.nitrogenDelta_kg_ha}kg N`}
                  </span>
                </div>
              </div>

              {/* Catatan Agronomi & Peran Lapangan */}
              <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/40 text-[10px] text-slate-300 leading-relaxed">
                <span className="text-slate-400 block font-medium mb-0.5">Aksi Lapangan & Manfaat:</span>
                {alloc.notes}
              </div>

              {/* Arrow Connector Icon between cards */}
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 shadow">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
