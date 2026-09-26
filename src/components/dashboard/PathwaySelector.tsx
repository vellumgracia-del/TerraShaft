'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Sprout, ShieldAlert, Coins, CheckCircle2, Award } from 'lucide-react';

export default function PathwaySelector() {
  const { plans, selectedPathway, setSelectedPathway } = useTerraShaftStore();

  if (!plans) return null;

  const pathways = [
    {
      id: 'A' as const,
      data: plans.A,
      icon: Sprout,
      color: 'emerald',
      activeBorder: 'border-emerald-500 shadow-emerald-500/20 bg-emerald-950/20',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'B' as const,
      data: plans.B,
      icon: ShieldAlert,
      color: 'sky',
      activeBorder: 'border-sky-500 shadow-sky-500/20 bg-sky-950/20',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    },
    {
      id: 'C' as const,
      data: plans.C,
      icon: Coins,
      color: 'amber',
      activeBorder: 'border-amber-500 shadow-amber-500/20 bg-amber-950/20',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-base">3 Skenario Rotasi Optimal</h3>
          <p className="text-xs text-slate-400">Pilih skenario yang paling sesuai dengan target musim tanam Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pathways.map(({ id, data, icon: Icon, activeBorder, badgeColor }) => {
          const isSelected = selectedPathway === id;

          return (
            <div
              key={id}
              onClick={() => setSelectedPathway(id)}
              className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between gap-3 ${
                isSelected
                  ? `${activeBorder} border-2 shadow-xl scale-[1.01]`
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Header Card */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${badgeColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {id}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-tight">
                        {data.title.replace(`Pathway ${id}: `, '')}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{data.subtitle}</span>
                  </div>
                </div>

                {/* Composite Score */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400 font-medium">Skor Komposit</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span className="font-mono font-bold text-white text-sm">{data.compositeScore}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {data.description}
              </p>

              {/* Recommendation Badges */}
              <div className="flex flex-wrap gap-1.5">
                {data.recommendationBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700 font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/70 text-center">
                <div className="bg-slate-950/40 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Baterai</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">{data.soilBatteryScore}%</span>
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Hemat Air</span>
                  <span className="font-mono text-xs font-bold text-sky-400">{data.waterSavingsPct}%</span>
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Indeks Profit</span>
                  <span className="font-mono text-xs font-bold text-amber-400">{data.projectedProfitIndex}</span>
                </div>
              </div>

              {/* Selection Button */}
              <button
                type="button"
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Skenario Terpilih</span>
                  </>
                ) : (
                  <span>Pilih Skenario {id}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
