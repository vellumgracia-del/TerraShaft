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
import { estimateBulkDensity, estimateCurrentMoistureReserve } from '@/lib/pedotransfer';

interface SoilBatteryCardProps {
  onExploreRotation?: () => void;
}

export default function SoilBatteryCard({ onExploreRotation }: SoilBatteryCardProps) {
  const { plans, selectedPathway, soilData, climateData } = useTerraShaftStore();

  const currentPlan = plans ? plans[selectedPathway] : null;

  const initialBattery = currentPlan?.initialBatteryScore ?? 63;
  const finalBattery = currentPlan?.soilBatteryScore ?? 100;
  const batteryDelta = finalBattery - initialBattery;
  const isCharging = batteryDelta >= 0;

  const nitrogenBalance = currentPlan?.netNitrogenDelta ?? 370;
  const waterSavings = currentPlan?.waterSavingsPct ?? 40;
  const socBaseline = soilData?.soc ?? 1.15;
  const sandPct = soilData?.sand ?? 38;
  const siltPct = soilData?.silt ?? 32;
  const clayPct = soilData?.clay ?? 30;
  const phVal = soilData?.ph ?? 6.4;
  const cecVal = soilData?.cec ?? 19.5;
  const awcVal = soilData?.awc ?? 30.3;
  const textureClass = soilData?.textureClass ?? 'Lempung Berliat (Clay Loam)';
  const bulkDensity = estimateBulkDensity(socBaseline);
  const moistureReserveMm = estimateCurrentMoistureReserve(awcVal, climateData?.rootZoneSoilMoisture ?? 0.38);

  // SVG Radial Gauge Calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finalBattery / 100) * circumference;

  return (
    <div id="soil-battery" className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-5 lg:p-6 flex flex-col justify-between gap-5 text-[#F1F3F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2C313A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[4px] bg-[#163A40] text-[#00C2CC]">
              <BatteryCharging className="w-4 h-4" />
            </span>
            <h2 className="text-base font-medium text-[#F1F3F5] tracking-tight">
              Baterai Tanah (Soil Battery Screening Score)
            </h2>
          </div>
          <p className="text-xs text-[#8A949E] mt-0.5">
            Model proyeksi kapasitas kesuburan tanah melalui pergiliran tanaman regeneratif
          </p>
        </div>

        {onExploreRotation && (
          <button
            type="button"
            onClick={onExploreRotation}
            className="text-xs font-mono text-[#00C2CC] hover:underline self-start sm:self-auto"
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
                className="stroke-[#2C313A]"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={isCharging ? 'stroke-[#009DA5]' : 'stroke-[#F87171]'}
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
              <span className="text-3xl font-bold text-[#F1F3F5] font-mono tracking-tight tabular-nums">
                {finalBattery}%
              </span>
              <span className="text-[11px] font-mono text-[#8A949E] uppercase tracking-wider">
                Screening Score
              </span>
              <span
                className={`mt-1 px-2 py-0.5 rounded-[3px] border font-mono text-[10px] flex items-center gap-0.5 ${
                  isCharging
                    ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]/40'
                    : 'bg-[#2D1B1E] text-[#F87171] border-[#7F1D1D]/40'
                }`}
              >
                {isCharging ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{isCharging ? `+${batteryDelta}% Charging` : `${batteryDelta}% Discharging`}</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-[#8A949E] text-center mt-2 font-mono">
            Baseline Awal Lahan: <strong className="text-[#F1F3F5] font-mono">{initialBattery}%</strong>
          </div>
        </div>

        {/* Right: Key Derived Agronomic Pillars (7 Col) */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* 1. Estimated Nitrogen Balance */}
          <div className="p-3.5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#8A949E] block font-mono">Estimasi Kontribusi N Biologis Kumulatif</span>
                <span className="text-sm font-medium text-[#F1F3F5] font-mono">
                  {formatKgPerHa(nitrogenBalance)}
                </span>
                <span className="text-[10px] text-[#8A949E] block mt-0.5">
                  Tidak berarti seluruh nitrogen langsung tersedia bagi tanaman.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#00C2CC] bg-[#163A40] px-2 py-1 rounded-[3px] border border-[#009DA5]/40 shrink-0">
              Fiksasi Biologis
            </span>
          </div>

          {/* 2. Model-based Water Saving Estimate */}
          <div className="p-3.5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#8A949E] block font-mono">Estimasi Penghematan Air Siklus</span>
                <span className="text-sm font-medium text-[#F1F3F5] font-mono">
                  Hingga {formatPercentage(waterSavings)} Efisiensi Air
                </span>
                <span className="text-[10px] text-[#8A949E] block mt-0.5">
                  Dibandingkan model baseline monokultur; bukan jaminan hasil lapangan.
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#00C2CC] bg-[#163A40] px-2 py-1 rounded-[3px] border border-[#009DA5]/40 shrink-0">
              vs Monokultur
            </span>
          </div>

          {/* 3. Soil Organic Carbon (SOC) Baseline */}
          <div className="p-3.5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-[#8A949E] block font-mono">Karbon Organik Tanah (SOC ISRIC)</span>
                <span className="text-sm font-medium text-[#F1F3F5] font-mono">
                  {socBaseline}% C-Organik (Lapisan 0-30cm)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#C1C7CD] bg-[#20242B] border border-[#2C313A] px-2 py-1 rounded-[3px] shrink-0">
              AWC: {formatMm(soilData?.awc ?? 30.3)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed ISRIC SoilGrids Physical & Chemical Profile (0-30cm) */}
      <div className="p-4 bg-[#16191E] rounded-[4px] border border-[#2C313A] flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-[#F1F3F5] uppercase tracking-wider block">
              Profil Fisika & Kimia Tanah Lapisan 0-30 cm (ISRIC SoilGrids v2.0)
            </span>
            <span className="text-[11px] text-[#8A949E]">
              Kelas Tekstur USDA: <strong className="text-[#F1F3F5]">{textureClass}</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-[3px] bg-[#20242B] border border-[#2C313A] text-xs font-mono text-[#00C2CC] self-start sm:self-auto">
            Cadangan Air Aktif: {moistureReserveMm} / {formatMm(awcVal)}
          </span>
        </div>

        {/* Stacked Soil Texture Bar (Sand / Silt / Clay) */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-3 rounded-[3px] overflow-hidden flex bg-[#20242B] border border-[#2C313A]">
            <div
              style={{ width: `${sandPct}%` }}
              className="bg-[#F59E0B] h-full transition-all"
              title={`Pasir (Sand): ${sandPct}%`}
            />
            <div
              style={{ width: `${siltPct}%` }}
              className="bg-[#0284C7] h-full transition-all"
              title={`Debu (Silt): ${siltPct}%`}
            />
            <div
              style={{ width: `${clayPct}%` }}
              className="bg-[#009DA5] h-full transition-all"
              title={`Liat (Clay): ${clayPct}%`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#C1C7CD] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" />
              <span>Pasir (Sand): <strong className="text-[#F1F3F5]">{sandPct}%</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]" />
              <span>Debu (Silt): <strong className="text-[#F1F3F5]">{siltPct}%</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#009DA5]" />
              <span>Liat (Clay): <strong className="text-[#F1F3F5]">{clayPct}%</strong></span>
            </span>
          </div>
        </div>

        {/* 4 Soil Chemical & Pedotransfer Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
            <span className="text-[10px] text-[#8A949E] block font-mono">Derajat Keasaman (pH H2O)</span>
            <span className="text-sm font-medium font-mono text-[#F1F3F5] mt-0.5 block">
              {phVal.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#00C2CC] font-mono">
              {phVal < 5.5 ? 'Masam' : phVal > 7.5 ? 'Alkalis' : 'Netral Optimal'}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
            <span className="text-[10px] text-[#8A949E] block font-mono">KTK / CEC Tanah</span>
            <span className="text-sm font-medium font-mono text-[#F1F3F5] mt-0.5 block">
              {cecVal.toFixed(1)} <span className="text-[10px] font-normal">cmol/kg</span>
            </span>
            <span className="text-[10px] text-[#00C2CC] font-mono">
              Retensi Kation Hara
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
            <span className="text-[10px] text-[#8A949E] block font-mono">Kerapatan Lindak (BD)</span>
            <span className="text-sm font-medium font-mono text-[#F1F3F5] mt-0.5 block">
              {bulkDensity.toFixed(2)} <span className="text-[10px] font-normal">g/cm3</span>
            </span>
            <span className={`text-[10px] font-mono ${bulkDensity > 1.45 ? 'text-[#F87171]' : 'text-[#00C2CC]'}`}>
              {bulkDensity > 1.45 ? 'Indikasi Padas Olah' : 'Porositas Baik'}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[#20242B] border border-[#2C313A]">
            <span className="text-[10px] text-[#8A949E] block font-mono">Kapasitas Air Tersedia</span>
            <span className="text-sm font-medium font-mono text-[#F1F3F5] mt-0.5 block">
              {formatMm(awcVal)}
            </span>
            <span className="text-[10px] text-[#8A949E] font-mono">
              Jeluk 0-30 cm
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Transparency Disclaimer */}
      <div className="p-3 bg-[#16191E] rounded-[4px] border border-[#2C313A] flex items-start gap-2 text-xs text-[#8A949E]">
        <Info className="w-4 h-4 text-[#009DA5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catatan Ilmiah:</strong> Skor Baterai Tanah adalah indikator <em>screening model</em> berbasis kaidah agronomi pergantian legum penambat nitrogen dan cover crop, bukan pengukuran laboratorium <em>real-time</em>.
        </p>
      </div>
    </div>
  );
}
