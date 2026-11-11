'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { Activity, CheckCircle2 } from 'lucide-react';

export default function PathwayRadarComparison() {
  const { plans, selectedPathway, setSelectedPathway } = useTerraShaftStore();

  if (!plans) return null;

  const calcDroughtSafety = (pathwayId: 'A' | 'B' | 'C') => {
    const p = plans[pathwayId];
    const maxDef = Math.max(...p.seasons.map((s) => s.waterDeficit_mm), 0);
    return Math.min(100, Math.max(15, Math.round(100 - maxDef / 2.2)));
  };

  const calcNitrogenScore = (pathwayId: 'A' | 'B' | 'C') => {
    const p = plans[pathwayId];
    return Math.min(100, Math.max(10, Math.round(50 + p.netNitrogenDelta / 5)));
  };

  const calcWaterScore = (pathwayId: 'A' | 'B' | 'C') => {
    const p = plans[pathwayId];
    return Math.min(100, Math.max(15, Math.round(p.waterSavingsPct * 1.5)));
  };

  const radarData = [
    {
      axis: 'Baterai Tanah',
      A: plans.A.soilBatteryScore,
      B: plans.B.soilBatteryScore,
      C: plans.C.soilBatteryScore
    },
    {
      axis: 'Efisiensi Air',
      A: calcWaterScore('A'),
      B: calcWaterScore('B'),
      C: calcWaterScore('C')
    },
    {
      axis: 'Aman Kemarau',
      A: calcDroughtSafety('A'),
      B: calcDroughtSafety('B'),
      C: calcDroughtSafety('C')
    },
    {
      axis: 'Indeks Profit',
      A: plans.A.projectedProfitIndex,
      B: plans.B.projectedProfitIndex,
      C: plans.C.projectedProfitIndex
    },
    {
      axis: 'Fiksasi Nitrogen',
      A: calcNitrogenScore('A'),
      B: calcNitrogenScore('B'),
      C: calcNitrogenScore('C')
    }
  ];

  const summaryRows: Array<{ id: 'A' | 'B' | 'C'; color: string; label: string }> = [
    { id: 'A', color: '#12A875', label: 'Pathway A (Max Soil)' },
    { id: 'B', color: '#0284C7', label: 'Pathway B (Drought Guard)' },
    { id: 'C', color: '#D97706', label: 'Pathway C (Cash Flow)' }
  ];

  return (
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col gap-5 text-[#F1F3F5]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2C313A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[4px] bg-[#163A40] text-[#00C2CC]">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-medium text-[#F1F3F5] tracking-tight">
              Komparasi Multi-Objektif 5-Axis Radar (Pathway A vs B vs C)
            </h3>
          </div>
          <p className="text-xs text-[#8A949E] mt-0.5">
            Evaluasi trade-off antara kesehatan baterai tanah, ketahanan kekeringan, fiksasi nitrogen, dan arus kas petani
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#00C2CC] bg-[#163A40] border border-[#009DA5]/40 px-2.5 py-0.5 rounded-[3px] self-start sm:self-auto">
          Aktif: Jalur {selectedPathway}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 5-Axis Spider Radar Chart (7 Col) */}
        <div className="lg:col-span-7 w-full h-[300px] sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#2C313A" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: '#8A949E', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6E7781', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Pathway A (Soil)"
                dataKey="A"
                stroke="#009DA5"
                fill="#009DA5"
                fillOpacity={selectedPathway === 'A' ? 0.35 : 0.1}
                strokeWidth={selectedPathway === 'A' ? 2.5 : 1.5}
              />
              <Radar
                name="Pathway B (Water)"
                dataKey="B"
                stroke="#0284C7"
                fill="#0284C7"
                fillOpacity={selectedPathway === 'B' ? 0.35 : 0.1}
                strokeWidth={selectedPathway === 'B' ? 2.5 : 1.5}
              />
              <Radar
                name="Pathway C (Profit)"
                dataKey="C"
                stroke="#D97706"
                fill="#D97706"
                fillOpacity={selectedPathway === 'C' ? 0.35 : 0.1}
                strokeWidth={selectedPathway === 'C' ? 2.5 : 1.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16191E',
                  borderColor: '#2C313A',
                  borderRadius: '4px',
                  color: '#F1F3F5',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Side Comparison Table & Quick Selector (5 Col) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {summaryRows.map((row) => {
            const p = plans[row.id];
            const isSelected = selectedPathway === row.id;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedPathway(row.id)}
                className={`p-3.5 rounded-[4px] border text-left transition-all flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#163A40] border-[#009DA5] shadow-xs'
                    : 'bg-[#16191E] border-[#2C313A] hover:bg-[#20242B]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#F1F3F5] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span>{row.label}</span>
                  </span>
                  <span className="text-xs font-mono font-medium text-[#00C2CC] flex items-center gap-1">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Skor {p.compositeScore}/100</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-[#2C313A] font-mono">
                  <div>
                    <span className="text-[#8A949E] block">Baterai</span>
                    <strong className="text-[#F1F3F5]">{p.soilBatteryScore}%</strong>
                  </div>
                  <div>
                    <span className="text-[#8A949E] block">Hemat Air</span>
                    <strong className="text-[#00C2CC]">{p.waterSavingsPct}%</strong>
                  </div>
                  <div>
                    <span className="text-[#8A949E] block">Profit</span>
                    <strong className="text-[#C1C7CD]">{p.projectedProfitIndex}/100</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
