'use client';

import React from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { useAppI18n, localizeCropName } from '@/lib/i18n';
import { formatMm, formatNumber, getWaterStatusDetails } from '@/lib/formatters';
import { getNasaSmapDisplayStatus } from '@/lib/provenance';

export default function SummaryMetricCards() {
  const { climateData, soilData, plans, selectedPathway, provenance, isLoadingBioData } = useTerraShaftStore();
  const { locale, isEn } = useAppI18n();
  const smapStatus = getNasaSmapDisplayStatus(provenance);
  const currentPlan = plans ? plans[selectedPathway] : null;

  // 1. Root-Zone Soil Moisture (NASA SMAP GWETROOT)
  const gwetroot = climateData?.rootZoneSoilMoisture ?? 0.38;
  const isCriticalMoisture = gwetroot < 0.25;
  const isWatchMoisture = gwetroot >= 0.25 && gwetroot < 0.45;
  const moistureStatus = isEn
    ? isCriticalMoisture ? 'Critical Deficit' : isWatchMoisture ? 'Watch' : 'Adequate'
    : isCriticalMoisture ? 'Defisit Kritis' : isWatchMoisture ? 'Waspada' : 'Memadai';
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
  const waterDetails = getWaterStatusDetails(maxDeficit, locale);

  // 5. Recommended Crop (Season 1)
  const season1Crop = currentPlan?.seasons?.[0]?.crop;
  const season1Name = season1Crop ? localizeCropName(season1Crop, locale) : isEn ? 'Maize (Corn)' : 'Jagung Hibrida';
  const season1Variety = season1Crop?.recommended_variety ?? (isEn ? 'Pending localization' : 'Menunggu lokalisasi');
  const season1Water = season1Crop?.water_requirement_mm ?? 450;

  return (
    <div className="bg-[#2C313A] border border-[#2C313A] rounded-[4px] overflow-hidden text-[#F1F3F5]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
        {/* 1. Kelembapan Zona Akar */}
        <div className="bg-[#20242B] p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#8A949E]" title={smapStatus.detailText}>
            <span className="whitespace-nowrap">{isEn ? 'Root-Zone Wetness (GWETROOT)' : 'Kelembapan Zona Akar (GWETROOT)'}</span>
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
              title={`NASA POWER GWETROOT (model-assimilated): ${formatNumber(gwetroot, 2)}`}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#8A949E] pt-0.5 whitespace-nowrap">
            <span className="text-[#C1C7CD]">
              {isLoadingBioData ? 'Syncing...' : moistureStatus}
            </span>
            <span className="font-mono" title={smapStatus.longLabel}>
              {smapStatus.isOfficialApiResponse ? 'NASA POWER GWETROOT (Model)' : smapStatus.shortLabel}
            </span>
          </div>
        </div>

        {/* 2. Baterai Tanah */}
        <div className="bg-[#20242B] p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#8A949E] whitespace-nowrap">
            <span>{isEn ? 'Soil Battery Projection' : 'Proyeksi Baterai Tanah'}</span>
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
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#8A949E] pt-0.5 whitespace-nowrap">
            <span>{isEn ? 'Base:' : 'Basis:'} {initialBattery}%</span>
            <span className="font-mono text-[#E06C75]" title={isEn ? 'Continuous monoculture baseline' : 'Jika monokultur terus menerus'}>
              {isEn ? 'Monoculture: 10%' : 'Monokultur: 10%'}
            </span>
          </div>
        </div>

        {/* 3. Kapasitas Air Tanah (ISRIC SoilGrids) */}
        <div className="bg-[#20242B] p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#8A949E] whitespace-nowrap">
            <span>{isEn ? 'Available Water (AWC)' : 'Air Tersedia (AWC)'}</span>
            <span className="font-mono text-[11px] text-[#8A949E]">ISRIC v2.0</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {formatNumber(awcVal, 1)}
            </span>
            <span className="text-xs font-mono text-[#8A949E]">mm</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#8A949E] pt-1 whitespace-nowrap">
            <span className="truncate text-[#C1C7CD]" title={soilData?.textureClass}>
              {textureLabel}
            </span>
            <span className="font-mono shrink-0">SOC {soilData?.soc ?? 1.2}%</span>
          </div>
        </div>

        {/* 4. Defisit Air Puncak */}
        <div className="bg-[#20242B] p-4 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#8A949E] whitespace-nowrap">
            <span>{isEn ? 'Peak Seasonal Deficit' : 'Defisit Air Puncak'}</span>
            <span className="font-mono text-[11px] text-[#8A949E]">{isEn ? 'ETc vs Rain' : 'ETc vs Hujan'}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-[#F1F3F5] tabular-nums">
              {formatMm(maxDeficit)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#8A949E] pt-1 whitespace-nowrap">
            <span className="text-[#C1C7CD]">{waterDetails.label}</span>
            <span className="font-mono">{isEn ? 'Limit 100mm' : 'Batas 100mm'}</span>
          </div>
        </div>

        {/* 5. Komoditas Musim 1 */}
        <div className="bg-[#20242B] p-4 flex flex-col justify-between gap-2.5 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 text-xs text-[#8A949E] whitespace-nowrap">
            <span>{isEn ? 'Primary Season Crop' : 'Komoditas Musim 1'}</span>
            <span className="font-mono text-[11px] text-[#8A949E]">{isEn ? 'Season 1' : 'Musim 1'}</span>
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
