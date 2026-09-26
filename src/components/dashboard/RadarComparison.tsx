'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Compass, PieChart, Info } from 'lucide-react';

export default function RadarComparison() {
  const { plans } = useTerraShaftStore();

  if (!plans) return null;

  const planA = plans.A;
  const planB = plans.B;
  const planC = plans.C;

  // Normalisasi data untuk 5 sumbu trade-off agronomi (skala 0 - 100)
  const normalizeN = (netN: number) => Math.max(10, Math.min(100, Math.round(50 + netN / 4)));
  const calculateDroughtScore = (waterSavings: number, deficit: number) =>
    Math.max(15, Math.min(100, Math.round(waterSavings * 1.2 + (100 - deficit / 3) * 0.4)));

  const totalDeficitA = planA.seasons.reduce((acc, s) => acc + s.waterDeficit_mm, 0);
  const totalDeficitB = planB.seasons.reduce((acc, s) => acc + s.waterDeficit_mm, 0);
  const totalDeficitC = planC.seasons.reduce((acc, s) => acc + s.waterDeficit_mm, 0);

  const radarData = [
    {
      subject: 'Profit Kas',
      fullMark: 100,
      'Pathway A (Soil)': planA.projectedProfitIndex,
      'Pathway B (Drought)': planB.projectedProfitIndex,
      'Pathway C (Cash)': planC.projectedProfitIndex
    },
    {
      subject: 'Hemat Air',
      fullMark: 100,
      'Pathway A (Soil)': planA.waterSavingsPct,
      'Pathway B (Drought)': planB.waterSavingsPct,
      'Pathway C (Cash)': planC.waterSavingsPct
    },
    {
      subject: 'Baterai Tanah',
      fullMark: 100,
      'Pathway A (Soil)': planA.soilBatteryScore,
      'Pathway B (Drought)': planB.soilBatteryScore,
      'Pathway C (Cash)': planC.soilBatteryScore
    },
    {
      subject: 'Fiksasi Nitrogen',
      fullMark: 100,
      'Pathway A (Soil)': normalizeN(planA.netNitrogenDelta),
      'Pathway B (Drought)': normalizeN(planB.netNitrogenDelta),
      'Pathway C (Cash)': normalizeN(planC.netNitrogenDelta)
    },
    {
      subject: 'Ketahanan Iklim',
      fullMark: 100,
      'Pathway A (Soil)': calculateDroughtScore(planA.waterSavingsPct, totalDeficitA),
      'Pathway B (Drought)': calculateDroughtScore(planB.waterSavingsPct, totalDeficitB),
      'Pathway C (Cash)': calculateDroughtScore(planC.waterSavingsPct, totalDeficitC)
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Radar Perbandingan Trade-off 3 Skenario</h3>
            <p className="text-xs text-slate-400">Analisis komparatif multi-dimensi agronomi & keuntungan petani</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Skala 0–100 Skor Komposit</span>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="w-full h-[320px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} />

            {/* Pathway A - Green */}
            <Radar
              name="Pathway A: Max Soil"
              dataKey="Pathway A (Soil)"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
            />

            {/* Pathway B - Blue */}
            <Radar
              name="Pathway B: Drought Guard"
              dataKey="Pathway B (Drought)"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.25}
              strokeWidth={2}
            />

            {/* Pathway C - Amber */}
            <Radar
              name="Pathway C: Cash Flow"
              dataKey="Pathway C (Cash)"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.25}
              strokeWidth={2}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                fontSize: '11px',
                color: '#f8fafc'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span><strong>Pathway A:</strong> Unggul mutlak di perbaikan hara dan pemulihan biomasa tanah.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
          <span><strong>Pathway B:</strong> Unggul dalam efisiensi air & proteksi musim kemarau ekstrem.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span><strong>Pathway C:</strong> Hasil panen tunai maksimal dengan margin pasar tertinggi.</span>
        </div>
      </div>
    </div>
  );
}
