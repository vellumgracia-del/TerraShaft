'use client';

import React from 'react';
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
import { Droplets, Info } from 'lucide-react';
import { formatMm, getStructuredSeason } from '@/lib/formatters';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl border border-[#E4EAE6] shadow-lg text-xs flex flex-col gap-1.5 z-50">
        <span className="font-bold text-[#17231F] pb-1 border-b border-[#E4EAE6]">
          {label}
        </span>
        {payload.map((item, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#52605B]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span>{item.name}:</span>
            </span>
            <span className="font-mono font-bold text-[#17231F]">
              {formatMm(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function WaterBalanceCard() {
  const { plans, selectedPathway, soilData } = useTerraShaftStore();

  const currentPlan = plans ? plans[selectedPathway] : null;

  // Chart data from current rotation plan with structured seasons and clean precision
  const chartData = currentPlan?.seasons.map((season) => {
    const sInfo = getStructuredSeason(season.seasonIndex, season.seasonName, season.monthRange);
    return {
      seasonName: `${sInfo.seasonLabel} (${sInfo.monthRange})`,
      cropName: season.crop.name,
      rainfall_mm: Math.round(season.expectedRain_mm),
      demand_mm: Math.round(season.waterDemand_mm),
      deficit_mm: Number(season.waterDeficit_mm.toFixed(1))
    };
  }) || [
    { seasonName: 'Musim 1 (Nov – Feb)', cropName: 'Orok-orok', rainfall_mm: 1010, demand_mm: 150, deficit_mm: 0 },
    { seasonName: 'Musim 2 (Mar – Mei)', cropName: 'Kedelai', rainfall_mm: 360, demand_mm: 360, deficit_mm: 0 },
    { seasonName: 'Musim 3 (Jun – Agu)', cropName: 'Orok-orok', rainfall_mm: 35, demand_mm: 150, deficit_mm: 115 },
    { seasonName: 'Musim 4 (Sep – Okt)', cropName: 'Orok-orok', rainfall_mm: 47, demand_mm: 150, deficit_mm: 103 }
  ];

  return (
    <div id="water-balance" className="agri-card p-5 lg:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4EAE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF5F4] text-[#0284C7]">
              <Droplets className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#17231F] tracking-tight">
              Neraca Air Lahan & Risiko Defisit (Dual-Axis Water Balance)
            </h2>
          </div>
          <p className="text-xs text-[#7B8681] mt-0.5">
            Komparasi presipitasi musiman NASA GPM vs kebutuhan air tanaman (ETc)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="text-[#7B8681]">Kapasitas Retensi (AWC):</span>
          <span className="font-mono font-bold text-[#12A875] bg-[#E7F5EE] px-2 py-0.5 rounded-md">
            {formatMm(soilData?.awc ?? 30.3)} / 30cm
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[280px] sm:h-[340px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, bottom: 25, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EAE6" vertical={false} />
            <XAxis
              dataKey="seasonName"
              tick={{ fill: '#7B8681', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#E4EAE6' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#7B8681', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#E4EAE6' }}
              label={{ value: 'Milimeter (mm)', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 10, offset: 15 }}
            />

            <Tooltip content={<CustomChartTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#52605B' }}
            />

            {/* Presipitasi Hujan GPM (Bar) */}
            <Bar
              yAxisId="left"
              dataKey="rainfall_mm"
              name="Presipitasi GPM (mm)"
              fill="#38BDF8"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />

            {/* Area Defisit Air Cekaman (Shaded Area) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="deficit_mm"
              name="Defisit Air Cekaman (mm)"
              fill="#FDEAEA"
              stroke="#E11D48"
              strokeWidth={1.5}
            />

            {/* Kebutuhan Air Tanaman ETc (Line) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="demand_mm"
              name="Kebutuhan Air ETc (mm)"
              stroke="#D97706"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Note */}
      <div className="p-3 bg-[#F5F7F4] rounded-xl border border-[#E4EAE6] flex items-center justify-between text-xs text-[#7B8681]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
          <span>Area arsir merah menandakan defisit air musiman yang melampaui cadangan air tanah AWC.</span>
        </div>
        <span className="font-semibold text-[#17231F] hidden sm:inline">
          Ambang Batas Kritis: 100 mm
        </span>
      </div>
    </div>
  );
}
