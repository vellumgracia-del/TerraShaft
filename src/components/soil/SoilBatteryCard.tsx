'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  BatteryCharging,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Droplets,
  Info,
  Layers
} from 'lucide-react';

import {
  formatKgPerHa,
  formatPercentage,
  formatMm
} from '@/lib/formatters';

interface SoilBatteryCardProps {
  onExploreRotation?: () => void;
}

export default function SoilBatteryCard({ onExploreRotation }: SoilBatteryCardProps) {
  const { plans, selectedPathway, soilData } = useTerraShaftStore();

  const currentPlan = plans ? plans[selectedPathway] : null;

  const initialBattery = currentPlan?.initialBatteryScore ?? 63;
  const finalBattery = currentPlan?.soilBatteryScore ?? 100;
  const batteryDelta = finalBattery - initialBattery;
  const isCharging = batteryDelta >= 0;

  const nitrogenBalance = currentPlan?.netNitrogenDelta ?? 370;
  const waterSavings = currentPlan?.waterSavingsPct ?? 40;
  const socBaseline = soilData?.soc ?? 1.15;

  // SVG Radial Gauge Calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finalBattery / 100) * circumference;

  return (
    <div id="soil-battery" className="agri-card p-5 lg:p-6 flex flex-col justify-between gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4EAE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E7F5EE] text-[#12A875]">
              <BatteryCharging className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#17231F] tracking-tight">
              Baterai Tanah (Soil Battery Screening Score)
            </h2>
          </div>
          <p className="text-xs text-[#7B8681] mt-0.5">
            Model proyeksi kapasitas kesuburan tanah melalui pergiliran tanaman regeneratif
          </p>
        </div>

        {onExploreRotation && (
          <button
            type="button"
            onClick={onExploreRotation}
            className="text-xs font-semibold text-[#12A875] hover:text-[#0E9365] hover:underline self-start sm:self-auto"
          >
            Lihat Detail Rotasi &rarr;
          </button>
        )}
      </div>

      {/* Main Content: Radial Gauge + Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Prominent Radial Gauge (5 Col) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#E4EAE6]"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={isCharging ? 'stroke-[#12A875]' : 'stroke-[#E11D48]'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-[#17231F] font-mono tracking-tight tabular-nums">
                {finalBattery}%
              </span>
              <span className="text-[11px] font-semibold text-[#7B8681] uppercase tracking-wider">
                Screening Score
              </span>
              <span
                className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                  isCharging ? 'bg-[#E7F5EE] text-[#12A875]' : 'bg-[#FDEAEA] text-[#E11D48]'
                }`}
              >
                {isCharging ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{isCharging ? `+${batteryDelta}% Charging` : `${batteryDelta}% Discharging`}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-[#7B8681] text-center mt-2">
            Baseline Awal Lahan: <strong className="text-[#17231F] font-mono">{initialBattery}%</strong>
          </div>
        </div>

        {/* Right: Key Derived Agronomic Pillars (7 Col) */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* 1. Estimated Nitrogen Balance */}
          <div className="p-3.5 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#12A875] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#7B8681] block font-medium">Estimasi Kontribusi N Biologis Kumulatif</span>
                <span className="text-sm font-bold text-[#17231F]">
                  {formatKgPerHa(nitrogenBalance)}
                </span>
                <span className="text-[10px] text-[#7B8681] block mt-0.5">
                  Tidak berarti seluruh nitrogen langsung tersedia bagi tanaman.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#12A875] bg-[#E7F5EE] px-2 py-1 rounded-lg shrink-0">
              Fiksasi Biologis
            </span>
          </div>

          {/* 2. Model-based Water Saving Estimate */}
          <div className="p-3.5 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF5F4] text-[#0284C7] flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#7B8681] block font-medium">Estimasi Penghematan Air Siklus</span>
                <span className="text-sm font-bold text-[#17231F]">
                  Hingga {formatPercentage(waterSavings)} Efisiensi Air
                </span>
                <span className="text-[10px] text-[#7B8681] block mt-0.5">
                  Dibandingkan model baseline monokultur; bukan jaminan hasil lapangan.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#0284C7] bg-[#EAF5F4] px-2 py-1 rounded-lg shrink-0">
              vs Monokultur
            </span>
          </div>

          {/* 3. Soil Organic Carbon (SOC) Baseline */}
          <div className="p-3.5 rounded-xl bg-[#F5F7F4] border border-[#E4EAE6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF4D8] text-[#D97706] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#7B8681] block font-medium">Karbon Organik Tanah (SOC ISRIC)</span>
                <span className="text-sm font-bold text-[#17231F]">
                  {socBaseline}% C-Organik (Lapisan 0–30cm)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#52605B] bg-white border border-[#E4EAE6] px-2 py-1 rounded-lg font-mono shrink-0">
              AWC: {formatMm(soilData?.awc ?? 30.3)}
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Transparency Disclaimer */}
      <div className="p-3 bg-[#F5F7F4] rounded-xl border border-[#E4EAE6] flex items-start gap-2 text-xs text-[#7B8681]">
        <Info className="w-4 h-4 text-[#12A875] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catatan Ilmiah:</strong> Skor Baterai Tanah adalah indikator <em>screening model</em> berbasis kaidah agronomi pergantian legum penambat nitrogen dan cover crop, bukan pengukuran laboratorium <em>real-time</em>.
        </p>
      </div>
    </div>
  );
}
