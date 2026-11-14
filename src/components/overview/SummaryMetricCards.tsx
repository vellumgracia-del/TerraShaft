'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { Info } from 'lucide-react';
import { formatMm, formatNumber, getWaterStatusDetails } from '@/lib/formatters';
import { getNasaSmapDisplayStatus } from '@/lib/provenance';

export default function SummaryMetricCards() {
  const { climateData, soilData, plans, selectedPathway, provenance, isLoadingBioData } = useTerraShaftStore();
  const smapStatus = getNasaSmapDisplayStatus(provenance);
  const currentPlan = plans ? plans[selectedPathway] : null;

  // 1. Root-Zone Soil Moisture (NASA SMAP GWETROOT)
  const gwetroot = climateData?.rootZoneSoilMoisture ?? 0.38;
  const isCriticalMoisture = gwetroot < 0.25;
  const isWatchMoisture = gwetroot >= 0.25 && gwetroot < 0.45;
  const moistureStatus = isCriticalMoisture ? 'Defisit Kritis' : isWatchMoisture ? 'Waspada' : 'Memadai';
  const moistureDot = isCriticalMoisture
    ? 'bg-[#FB7185]'
    : isWatchMoisture
    ? 'bg-[#FBBF24]'
    : 'bg-[#00C2CC]';

  // 2. Soil Battery
  const initialBattery = currentPlan?.initialBatteryScore ?? 63;
  const finalBattery = currentPlan?.soilBatteryScore ?? 63;
  const batteryDelta = finalBattery - initialBattery;
  const isCharging = batteryDelta >= 0;

  // 3. Soil AWC & Texture (ISRIC SoilGrids)
  const awcVal = soilData?.awc ?? 27.8;
  const textureLabel = soilData?.textureClass?.split('(')[0]?.trim() || 'Lempung Liat';

  // 4. Water Risk (Max Seasonal Deficit)
  let maxDeficit = 0;
  if (currentPlan && currentPlan.seasons) {
    maxDeficit = Math.max(...currentPlan.seasons.map((s) => s.waterDeficit_mm), 0);
  }
  const waterDetails = getWaterStatusDetails(maxDeficit);

  // 5. Recommended Crop (Season 1)
  const season1Crop = currentPlan?.seasons?.[0]?.crop;
  const season1Name = season1Crop?.name ?? 'Jagung Hibrida';
  const season1Variety = season1Crop?.recommended_variety ?? 'Bisi-18 / Pioneer';
  const season1Water = season1Crop?.water_requirement_mm ?? 450;

  return (
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] overflow-hidden text-[#F1F3F5]">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#2C313A]">
        {/* 1. Kelembapan Zona Akar */}
        <div className="p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A949E]">
            <span>Root-Zone Wetness (SMAP)</span>
            <span title={smapStatus.detailText}>
              <Info className="w-3.5 h-3.5 text-[#6E7781]" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {formatNumber(gwetroot, 2)}
            </span>
            <span className="text-xs font-mono text-[#8A949E]">/ 1.00</span>
          </div>
          {/* Micro Progress Bar */}
          <div className="w-full bg-[#16191E] h-1.5 rounded-full overflow-hidden flex my-0.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${moistureDot}`}
              style={{ width: `${Math.min(Math.max(gwetroot * 100, 5), 100)}%` }}
              title={`SMAP L4 GWETROOT: ${formatNumber(gwetroot, 2)}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A949E] pt-0.5">
            <span className="inline-flex items-center gap-1.5 text-[#C1C7CD]">
              <span className={`w-1.5 h-1.5 rounded-full ${moistureDot}`} />
              <span>{isLoadingBioData ? 'Syncing...' : moistureStatus}</span>
            </span>
            <span className="font-mono">{smapStatus.shortLabel}</span>
          </div>
        </div>

        {/* 2. Baterai Tanah */}
        <div className="p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A949E]">
            <span>Soil Battery Projection</span>
            <span className="font-mono text-[11px] text-[#8A949E]">0-30cm</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {finalBattery}%
            </span>
            <span
              className={`text-xs font-mono font-medium ${
                isCharging ? 'text-[#00C2CC]' : 'text-[#FB7185]'
              }`}
            >
              {isCharging ? `+${batteryDelta}%` : `${batteryDelta}%`}
            </span>
          </div>
          {/* Micro Contrast Progress Bar */}
          <div className="w-full bg-[#16191E] h-1.5 rounded-full overflow-hidden flex my-0.5" title={`Rotasi Adaptif: ${finalBattery}% vs Monokultur: 10%`}>
            <div
              className="h-full bg-[#00C2CC] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(Math.max(finalBattery, 5), 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A949E] pt-0.5">
            <span>Base: {initialBattery}%</span>
            <span className="font-mono text-[#E06C75]" title="Jika monokultur terus menerus">
              Monokultur: 10%
            </span>
          </div>
        </div>

        {/* 3. Kapasitas Air Tanah (ISRIC SoilGrids) */}
        <div className="p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A949E]">
            <span>Available Water (AWC)</span>
            <span className="font-mono text-[11px] text-[#8A949E]">ISRIC v2.0</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {formatNumber(awcVal, 1)}
            </span>
            <span className="text-xs font-mono text-[#8A949E]">mm</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A949E] pt-1">
            <span className="truncate max-w-[140px] text-[#C1C7CD]" title={soilData?.textureClass}>
              {textureLabel}
            </span>
            <span className="font-mono">SOC {soilData?.soc ?? 1.2}%</span>
          </div>
        </div>

        {/* 4. Defisit Air Puncak */}
        <div className="p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A949E]">
            <span>Peak Seasonal Deficit</span>
            <span className="font-mono text-[11px] text-[#8A949E]">ETc vs Rain</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {formatMm(maxDeficit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A949E] pt-1">
            <span className="text-[#C1C7CD]">{waterDetails.label}</span>
            <span className="font-mono">Limit 100mm</span>
          </div>
        </div>

        {/* 5. Komoditas Musim 1 */}
        <div className="p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A949E]">
            <span>Primary Season Crop</span>
            <span className="font-mono text-[11px] text-[#8A949E]">Musim 1</span>
          </div>
          <div className="text-base font-semibold text-[#F1F3F5] truncate" title={season1Name}>
            {season1Name}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8A949E] pt-1 gap-2">
            <span className="truncate text-[#C1C7CD]" title={season1Variety}>
              {season1Variety}
            </span>
            <span className="font-mono shrink-0">{formatMm(season1Water)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
