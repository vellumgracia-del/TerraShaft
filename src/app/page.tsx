'use client';

import React from 'react';
import Link from 'next/link';
import SummaryMetricCards from '@/components/overview/SummaryMetricCards';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  Search,
  Rss,
  MapPin,
  FileText,
  Layers,
  Database,
  LayoutGrid,
  Share2,
  Info,
  ArrowUpRight
} from 'lucide-react';
import {
  formatMm,
  formatKgPerHa,
  getStructuredSeason,
  getWaterStatusDetails
} from '@/lib/formatters';

export default function HomePage() {
  const {
    location,
    elevation_m,
    climateData,
    soilData,
    crops,
    plans,
    selectedPathway,
    setSelectedPathway,
    provenance
  } = useTerraShaftStore();

  const currentPlan = plans ? plans[selectedPathway] : null;
  const pathwayButtons: Array<{ id: 'A' | 'B' | 'C'; label: string }> = [
    { id: 'A', label: 'Pathway A · Max Soil' },
    { id: 'B', label: 'Pathway B · Drought Guard' },
    { id: 'C', label: 'Pathway C · Cash Flow' }
  ];

  const addDataWorkflows = [
    {
      href: '/field-map',
      icon: Search,
      title: 'Search and locate AOI',
      hasInfo: true,
      sublabel: `Nominatim & DEM API · ${location.placeName.split(',')[0]} (${elevation_m}m dpl)`
    },
    {
      href: '/data-sources',
      icon: Rss,
      title: 'Subscribe to telemetry',
      hasInfo: true,
      sublabel: 'Subscriptions API · NASA POWER & ISRIC SoilGrids v2.0'
    },
    {
      href: '/crop-library',
      icon: MapPin,
      title: 'Areas of interest & crop varieties',
      hasInfo: false,
      sublabel: `Crop Library API · ${crops.length} varietas tanaman terdaftar`
    }
  ];

  const deliveryWorkflows = [
    {
      href: '/rotation-planner',
      icon: FileText,
      title: '4-Season rotation orders',
      sublabel: `Optimization API · Jalur ${selectedPathway} (${currentPlan?.title ?? 'Max Soil Regeneration'})`
    },
    {
      href: '/soil-battery',
      icon: Layers,
      title: 'Soil battery subscriptions',
      sublabel: `Pedotransfer 0-30cm API · Skor ${currentPlan?.soilBatteryScore ?? 100}% (${soilData?.textureClass?.split('(')[0]?.trim() || 'Sandy Clay Loam'})`
    },
    {
      href: '/water-balance',
      icon: Database,
      title: 'Data collections (Hydrology & ET0)',
      sublabel: `NASA POWER Data, Public DEM, Hargreaves ET0 (${climateData?.annualRainfall_mm ?? 1113} mm/yr)`
    },
    {
      href: '/field-map',
      icon: LayoutGrid,
      title: 'Mosaics & satellite basemaps',
      sublabel: 'Basemaps API · OpenStreetMap & Esri World Imagery'
    },
    {
      href: '/action-sheet',
      icon: Share2,
      title: 'Destinations & field action sheet',
      sublabel: 'Destinations API · Poster PNG 1080x1350 & WhatsApp Advisory'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
      {/* LEFT COLUMN: DATA WORKFLOWS (Planet Insights Platform Layout) */}
      <div className="lg:col-span-5 lg:pr-10 lg:border-r lg:border-[#2C313A] flex flex-col gap-7">
        <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
          DATA WORKFLOWS
        </div>

        {/* Group 1: Add data */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-[15px] font-medium text-[#F1F3F5]">Add data</h2>
            <p className="text-[13px] text-[#9BA3AE] mt-1 leading-relaxed">
              After you select field AOIs, configure satellite telemetry feeds for soil and climate products or register local crop varieties.
            </p>
          </div>

          <div className="rounded-[4px] border border-[#2C313A] bg-[#20242B] divide-y divide-[#2C313A] overflow-hidden">
            {addDataWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#262B33] transition-colors group"
                >
                  <Icon className="w-5 h-5 text-[#C1C7CD] group-hover:text-white shrink-0 stroke-[1.75]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-medium text-[#F1F3F5] group-hover:text-white">
                        {item.title}
                      </span>
                      {item.hasInfo && (
                        <Info className="w-3.5 h-3.5 text-[#8A949E] shrink-0" />
                      )}
                    </div>
                    <p className="text-[12px] text-[#8A949E] truncate mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Group 2: View data delivery */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-[15px] font-medium text-[#F1F3F5]">View data delivery</h2>
            <p className="text-[13px] text-[#9BA3AE] mt-1 leading-relaxed">
              Manage your agronomic simulations and soil profiles. Kick off multi-season water balance analysis in data collections.
            </p>
          </div>

          <div className="rounded-[4px] border border-[#2C313A] bg-[#20242B] divide-y divide-[#2C313A] overflow-hidden">
            {deliveryWorkflows.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#262B33] transition-colors group"
                >
                  <Icon className="w-5 h-5 text-[#C1C7CD] group-hover:text-white shrink-0 stroke-[1.75]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium text-[#F1F3F5] group-hover:text-white">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#8A949E] truncate mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: YOUR DATA PRODUCTS & ACTIVE TELEMETRY */}
      <div className="lg:col-span-7 lg:pl-10 flex flex-col gap-7">
        {/* Top Section: YOUR DATA PRODUCTS (Planet Card Style) */}
        <div className="flex flex-col gap-3.5">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
            YOUR DATA PRODUCTS (2)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Card 1: Active Satellite & Soil Telemetry Feed */}
            <Link
              href="/data-sources"
              className="rounded-[4px] border border-[#343942] hover:border-[#009DA5] bg-[#20242B] p-4 flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13.5px] font-medium text-[#F1F3F5] leading-snug">
                  NASA POWER & ISRIC SoilGrids Monitoring
                  <div className="text-[12.5px] text-[#C1C7CD] font-normal mt-0.5 truncate">
                    AOI: {location.placeName}
                  </div>
                </div>
                <Info className="w-4 h-4 text-[#9BA3AE] shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between text-[11.5px] font-mono text-[#8A949E] pt-1">
                <span>2025-01-01 to 2025-12-31</span>
                <span className="text-[#00C2CC]">{provenance.overallMode.toUpperCase()}</span>
              </div>
            </Link>

            {/* Product Card 2: Active Combinatorial Rotation Plan */}
            <Link
              href="/rotation-planner"
              className="rounded-[4px] border border-[#343942] hover:border-[#009DA5] bg-[#20242B] p-4 flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13.5px] font-medium text-[#F1F3F5] leading-snug">
                  4-Season Combinatorial Rotation (Pathway {selectedPathway})
                  <div className="text-[12.5px] text-[#C1C7CD] font-normal mt-0.5 truncate">
                    {currentPlan?.title ?? 'Max Soil Regeneration'} (Skor {currentPlan?.compositeScore ?? 89}/100)
                  </div>
                </div>
                <Info className="w-4 h-4 text-[#9BA3AE] shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between text-[11.5px] font-mono text-[#8A949E] pt-1">
                <span>
                  Battery {currentPlan?.initialBatteryScore ?? 63}% to {currentPlan?.soilBatteryScore ?? 100}%
                </span>
                <span className="text-[#00C2CC]">
                  {formatKgPerHa(currentPlan?.netNitrogenDelta ?? 370)}
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Middle Section: BIOPHYSICAL TELEMETRY LEDGER */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
              ACTIVE AOI BIOPHYSICAL TELEMETRY ({location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°)
            </span>
            <Link
              href="/field-map"
              className="text-[12px] text-[#00C2CC] hover:underline inline-flex items-center gap-1"
            >
              <span>Change AOI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <SummaryMetricCards />
        </div>

        {/* Bottom Section: 4-SEASON ROTATION MATRIX */}
        {currentPlan && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
                4-SEASON ROTATION SCHEDULE ({currentPlan.title.toUpperCase()})
              </span>

              <div className="inline-flex items-center rounded-[4px] border border-[#2C313A] bg-[#16191E] p-0.5 text-xs">
                {pathwayButtons.map((pw) => {
                  const isSelected = selectedPathway === pw.id;
                  return (
                    <button
                      key={pw.id}
                      type="button"
                      onClick={() => setSelectedPathway(pw.id)}
                      className={`px-2.5 py-1 rounded-[3px] text-[11.5px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#163A40] text-[#F1F3F5] border border-[#009DA5]/50'
                          : 'text-[#8A949E] hover:text-[#F1F3F5]'
                      }`}
                    >
                      {pw.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[4px] border border-[#2C313A] bg-[#20242B] divide-y divide-[#2C313A] overflow-hidden">
              {currentPlan.seasons.map((season) => {
                const sInfo = getStructuredSeason(season.seasonIndex);
                const waterInfo = getWaterStatusDetails(season.waterDeficit_mm);
                return (
                  <div
                    key={season.seasonIndex}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#262B33] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#00C2CC]">
                          {sInfo.seasonLabel} ({sInfo.monthRange})
                        </span>
                        <span className="text-[#6E7781]">·</span>
                        <span className="text-[13.5px] font-medium text-[#F1F3F5]">
                          {season.crop.name}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#8A949E] mt-0.5">
                        Varietas: {season.crop.recommended_variety || ' Unggul Lokal'} · Durasi {season.crop.growth_duration_days} hari
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[12px] font-mono shrink-0">
                      <div className="text-right">
                        <span className="text-[#8A949E] block text-[10.5px]">Defisit Air</span>
                        <span className={waterInfo.colorClass}>{formatMm(season.waterDeficit_mm)}</span>
                      </div>
                      <div className="text-right min-w-[90px]">
                        <span className="text-[#8A949E] block text-[10.5px]">Neraca Tanah</span>
                        <span className="text-[#00C2CC]">
                          {season.batteryDelta_pct >= 0 ? `+${season.batteryDelta_pct}%` : `${season.batteryDelta_pct}%`} ({formatKgPerHa(season.nitrogenDelta_kg_ha)})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
