'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Droplets,
  BatteryCharging,
  RotateCw,
  AlertTriangle,
  Sprout,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatMm, formatNumber, getWaterStatusDetails } from '@/lib/formatters';
import { getNasaSmapDisplayStatus } from '@/lib/provenance';

export default function SummaryMetricCards() {
  const { climateData, plans, selectedPathway, provenance, isLoadingBioData } = useTerraShaftStore();
  const prov = provenance;
  const smapStatus = getNasaSmapDisplayStatus(prov);

  const currentPlan = plans ? plans[selectedPathway] : null;

  // 1. Root-Zone Soil Moisture (NASA SMAP GWETROOT)
  const gwetroot = climateData?.rootZoneSoilMoisture ?? 0.38;
  const isCriticalMoisture = gwetroot < 0.25;
  const isWatchMoisture = gwetroot >= 0.25 && gwetroot < 0.45;
  const moistureStatus = isCriticalMoisture ? 'Kritis' : isWatchMoisture ? 'Waspada' : 'Memadai';
  const moistureColor = isCriticalMoisture
    ? 'text-[#E11D48] bg-[#FDEAEA] border-[#FECDD3]'
    : isWatchMoisture
    ? 'text-[#D97706] bg-[#FFF4D8] border-[#FDE68A]'
    : 'text-[#12A875] bg-[#E7F5EE] border-[#A7F3D0]';

  // 2. Soil Battery
  const initialBattery = currentPlan?.initialBatteryScore ?? 63;
  const finalBattery = currentPlan?.soilBatteryScore ?? 63;
  const batteryDelta = finalBattery - initialBattery;
  const isCharging = batteryDelta >= 0;

  // 3. Active Pathway
  const pathwayTitle = currentPlan?.title ?? 'Max Soil Regeneration';
  const pathwayScore = currentPlan?.compositeScore ?? 66;

  // 4. Water Risk (Max Seasonal Deficit)
  let maxDeficit = 0;
  if (currentPlan && currentPlan.seasons) {
    maxDeficit = Math.max(...currentPlan.seasons.map((s) => s.waterDeficit_mm), 0);
  }
  const waterDetails = getWaterStatusDetails(maxDeficit);
  const waterRiskColor = maxDeficit > 100
    ? 'text-[#E11D48] bg-[#FDEAEA]'
    : maxDeficit > 40
    ? 'text-[#D97706] bg-[#FFF4D8]'
    : 'text-[#12A875] bg-[#E7F5EE]';

  // 5. Recommended Crop (Season 1 / Current)
  const season1Crop = currentPlan?.seasons?.[0]?.crop;
  const season1Name = season1Crop?.name ?? 'Orok-orok';
  const season1Variety = season1Crop?.recommended_variety ?? 'Varietas Lokal';
  const season1Water = season1Crop?.water_requirement_mm ?? 150;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Kelembapan Zona Akar */}
      <div className="agri-card p-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7B8681]">Air Zona Akar</span>
          <span className="p-2 rounded-xl bg-[#EAF5F4] text-[#0284C7]">
            <Droplets className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#17231F] tabular-nums">
              {formatNumber(gwetroot, 2)}
            </span>
            <span className="text-xs text-[#7B8681]">/ 1.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${moistureColor}`}>
              {isLoadingBioData ? 'Menunggu API' : moistureStatus}
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-mono truncate max-w-[120px]" title={smapStatus.detailText}>
              {smapStatus.shortLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Baterai Tanah */}
      <div className="agri-card p-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7B8681]">Baterai Tanah</span>
          <span className="p-2 rounded-xl bg-[#E7F5EE] text-[#12A875]">
            <BatteryCharging className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#17231F] tabular-nums">
              {finalBattery}%
            </span>
            <span className="text-xs text-[#7B8681]">skor</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-0.5 ${
                isCharging ? 'bg-[#E7F5EE] text-[#12A875]' : 'bg-[#FDEAEA] text-[#E11D48]'
              }`}
            >
              {isCharging ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{isCharging ? `+${batteryDelta}% Charging` : `${batteryDelta}% Discharging`}</span>
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-mono">Awal: {initialBattery}%</span>
          </div>
        </div>
      </div>

      {/* 3. Skenario Rotasi Aktif */}
      <div className="agri-card p-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7B8681]">Skenario Rotasi</span>
          <span className="p-2 rounded-xl bg-[#EAF5F4] text-[#0284C7]">
            <RotateCw className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-base font-bold text-[#17231F] truncate" title={pathwayTitle}>
            Jalur {selectedPathway}: {pathwayTitle.split(' ')[0]}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F5EE] text-[#12A875]">
              Skor {pathwayScore}/100
            </span>
            <span className="text-[10px] text-[#9CA3AF]">Komposit</span>
          </div>
        </div>
      </div>

      {/* 4. Risiko Defisit Air */}
      <div className="agri-card p-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7B8681]">Defisit Air Puncak</span>
          <span className="p-2 rounded-xl bg-[#FFF4D8] text-[#D97706]">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#17231F] tabular-nums">
              {formatMm(maxDeficit)}
            </span>
            <span className="text-xs text-[#7B8681]">/ musim</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${waterRiskColor}`}>
              {waterDetails.label}
            </span>
            <span className="text-[10px] text-[#9CA3AF]">Threshold 100 mm</span>
          </div>
        </div>
      </div>

      {/* 5. Rekomendasi Musim Berjalan */}
      <div className="agri-card p-4 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#7B8681]">Rekomendasi Musim 1</span>
          <span className="p-2 rounded-xl bg-[#E7F5EE] text-[#12A875]">
            <Sprout className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-base font-bold text-[#17231F] truncate" title={season1Name}>
            {season1Name}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-[#52605B] truncate max-w-[120px]" title={season1Variety}>
              {season1Variety}
            </span>
            <span className="text-[10px] text-[#7B8681] font-mono">{formatMm(season1Water)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
