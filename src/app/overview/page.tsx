'use client';

import React from 'react';
import Link from 'next/link';
import SummaryMetricCards from '@/components/overview/SummaryMetricCards';
import AgroecologicalProfileCard from '@/components/overview/AgroecologicalProfileCard';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { useAppI18n, localizeCropName, localizePathwayCopy } from '@/lib/i18n';
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
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import {
  formatMm,
  formatKgPerHa,
  getStructuredSeason,
  getWaterStatusDetails
} from '@/lib/formatters';

const AOI_PRESETS = [
  {
    name: 'Kupang Timur',
    full: 'Kupang Timur, Kab. Kupang, Nusa Tenggara Timur',
    lat: -10.1542,
    lon: 123.8210,
    elevation: 85
  },
  {
    name: 'Sumba Timur',
    full: 'Pandawai, Kab. Sumba Timur, NTT',
    lat: -9.6541,
    lon: 120.2642,
    elevation: 60
  },
  {
    name: 'Camplong',
    full: 'Camplong, Fatuleu, Kab. Kupang, NTT',
    lat: -10.0381,
    lon: 123.9215,
    elevation: 180
  },
  {
    name: 'Gunungkidul',
    full: 'Playen, Kab. Gunungkidul, D.I. Yogyakarta',
    lat: -7.9656,
    lon: 110.6012,
    elevation: 220
  },
  {
    name: 'Indramayu',
    full: 'Kandanghaur, Kab. Indramayu, Jawa Barat',
    lat: -6.3275,
    lon: 108.3242,
    elevation: 12
  }
];

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
    setLocation,
    provenance,
    agroecologicalProfile
  } = useTerraShaftStore();
  const { locale, isEn } = useAppI18n();

  const currentPlan = plans ? plans[selectedPathway] : null;
  const activePathwayCopy = localizePathwayCopy(selectedPathway, locale);
  const pathwayButtons: Array<{ id: 'A' | 'B' | 'C'; label: string }> = isEn
    ? [
        { id: 'A', label: 'Pathway A · Max Soil' },
        { id: 'B', label: 'Pathway B · Drought Guard' },
        { id: 'C', label: 'Pathway C · Cash Flow' }
      ]
    : [
        { id: 'A', label: 'Jalur A · Tanah' },
        { id: 'B', label: 'Jalur B · Kekeringan' },
        { id: 'C', label: 'Jalur C · Arus Kas' }
      ];

  // Dynamic single-line AI field briefing grounded in active soil, moisture & regional cultivar resolution
  const isClayRich = (soilData?.clay ?? 48) > 35;
  const isDroughtRisk = (climateData?.rootZoneSoilMoisture ?? 0.38) < 0.35;
  const activeDryCrop = currentPlan?.seasons?.[3]?.crop ?? crops[0];
  const dryCropLabel = activeDryCrop
    ? `${localizeCropName(activeDryCrop, locale)} (${activeDryCrop.recommended_variety || 'Archetype'})`
    : 'Sorghum / Legume';

  const aiBriefText = isEn
    ? isClayRich
      ? `Heavy clay fraction (${soilData?.clay ?? 48}%) in ${agroecologicalProfile.agroecological_zone}: pair deep-rooted ${dryCropLabel} with cover legumes to mitigate cracking and preserve capillary moisture.`
      : isDroughtRisk
      ? `Low NASA POWER GWETROOT (${climateData?.rootZoneSoilMoisture ?? 0.38}, model-assimilated): prioritize drought-resilient ${dryCropLabel} to safeguard seasonal water balance.`
      : `Soil AWC (${soilData?.awc ?? 27.8} mm) in ${agroecologicalProfile.country} supports balanced 4-season cereal-legume cycling with ${dryCropLabel}.`
    : isClayRich
    ? `Fraksi liat ${soilData?.clay ?? 48}% pada zona ${agroecologicalProfile.agroecological_zone}: padukan ${dryCropLabel} berakar dalam dengan rotasi legum untuk menjaga kelembapan kapiler.`
    : isDroughtRisk
    ? `Indikator NASA POWER GWETROOT rendah (${climateData?.rootZoneSoilMoisture ?? 0.38}, model-assimilated): prioritaskan ${dryCropLabel} untuk menjaga neraca air musiman.`
    : `Kapasitas simpan air AWC (${soilData?.awc ?? 27.8} mm) di ${agroecologicalProfile.country} mendukung suksesi 4 musim berimbang antara sereal dan legum.`;

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
                  {isEn ? '4-Season Combinatorial Rotation' : 'Rotasi Kombinatorial 4 Musim'} ({isEn ? `Pathway ${selectedPathway}` : `Jalur ${selectedPathway}`})
                  <div className="text-[12.5px] text-[#C1C7CD] font-normal mt-0.5 truncate">
                    {activePathwayCopy.title} ({isEn ? 'Score' : 'Skor'} {currentPlan?.compositeScore ?? 89}/100)
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

        {/* AI Field Advisor Diagnosis Strip (Concise, single-line alert) */}
        <div className="p-3.5 rounded-[4px] bg-[#16191E] border border-[#2C313A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-[3px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F1F3F5]">Field Advisor AI Diagnosis</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#20242B] text-[#00C2CC] border border-[#00C2CC]/30">RAG BRIN & FAO-56</span>
              </div>
              <p className="text-xs text-[#9BA3AE] mt-0.5 leading-relaxed">
                {aiBriefText}
              </p>
            </div>
          </div>

          <Link
            href="/field-advisor"
            className="inline-flex items-center gap-1 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium shrink-0 self-end sm:self-center"
          >
            <span>{isEn ? 'Ask AI Advisor' : 'Konsultasi AI'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Middle Section: BIOPHYSICAL TELEMETRY LEDGER */}
        <div className="flex flex-col gap-3">
          {/* Header with Quick AOI Presets Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
                ACTIVE AOI TELEMETRY ({location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°)
              </span>
              <div className="text-[11.5px] text-[#8A949E] truncate">
                {location.placeName.split(',')[0]} · {elevation_m}m dpl
              </div>
            </div>

            {/* Quick Preset Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {AOI_PRESETS.map((p) => {
                const isActive = location.placeName.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setLocation(p.lat, p.lon, p.full, p.elevation)}
                    className={`px-2.5 py-1 rounded-[3px] text-[11px] font-mono whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#163A40] text-[#00C2CC] border border-[#00C2CC]/40 font-medium shadow-xs'
                        : 'bg-[#20242B] text-[#8A949E] hover:text-[#F1F3F5] hover:bg-[#282F3A] border border-[#2C313A]'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sensor Constellation Ribbon (Verified Live Sources Only) */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#16191E] border border-[#2C313A] rounded-[3px] text-[11px] font-mono text-[#8A949E]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C2CC] animate-pulse" />
              <span className="text-[#C1C7CD] font-medium">{isEn ? 'Live Feeds:' : 'Telemetri:'}</span>
              <span className="text-[#F1F3F5]">NASA POWER (ET0 & GWETROOT)</span>
              <span className="text-[#3E4552]">·</span>
              <span className="text-[#F1F3F5]">ISRIC SoilGrids v2.0</span>
              <span className="text-[#3E4552]">·</span>
              <span className="text-[#F1F3F5]">Open-Meteo DEM ({elevation_m}m)</span>
            </div>
            <Link href="/data-sources" className="text-[#00C2CC] hover:underline flex items-center gap-1 font-sans text-[11px]">
              <span>{isEn ? 'Provenance & Catalog' : 'Provenansi & Katalog'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <SummaryMetricCards />
          <AgroecologicalProfileCard />
        </div>

        {/* Bottom Section: 4-SEASON ROTATION MATRIX */}
        {currentPlan && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#C1C7CD]">
                {isEn ? '4-SEASON ROTATION SCHEDULE' : 'JADWAL ROTASI 4 MUSIM'} ({activePathwayCopy.title.toUpperCase()})
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
                const sInfo = getStructuredSeason(season.seasonIndex, season.seasonName, season.monthRange, locale);
                const waterInfo = getWaterStatusDetails(season.waterDeficit_mm, locale);
                const res = season.crop.cultivar_resolution;
                const isFallback = res?.is_archetype_fallback ?? false;
                return (
                  <div
                    key={season.seasonIndex}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#262B33] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#00C2CC]">
                          {sInfo.seasonLabel} ({sInfo.monthRange})
                        </span>
                        <span className="text-[#6E7781]">·</span>
                        <span className="text-[13.5px] font-medium text-[#F1F3F5]">
                          {localizeCropName(season.crop, locale)}
                        </span>
                        {season.crop.scientific_name && (
                          <span className="text-[11px] italic text-[#8A949E]">
                            ({season.crop.scientific_name})
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#8A949E] mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>
                          {isEn ? 'Cultivar:' : 'Kultivar:'}{' '}
                          <span className="text-[#C1C7CD]">
                            {season.crop.recommended_variety || (isEn ? 'Phenotype Archetype' : 'Arketipe Fenotipe')}
                          </span>
                        </span>
                        <span className="text-[#3E4552]">·</span>
                        <span>{season.crop.growth_duration_days} {isEn ? 'days' : 'hari'}</span>
                        {res && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isFallback
                                ? 'bg-[#3B2E14] text-[#FBBF24] border-[#92400E]/60'
                                : 'bg-[#064E3B]/60 text-[#34D399] border-[#047857]/60'
                            }`}
                          >
                            {isFallback
                              ? isEn ? 'Archetype Fallback' : 'Fallback Arketipe'
                              : `${res.cultivar.country_or_region_of_release[0]} · ${Math.round(res.confidence_score * 100)}%`}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[12px] font-mono shrink-0">
                      <div className="text-right">
                        <span className="text-[#8A949E] block text-[10.5px]">
                          {isEn ? 'Water Deficit' : 'Defisit Air'}
                        </span>
                        <span className={waterInfo.colorClass}>{formatMm(season.waterDeficit_mm)}</span>
                      </div>
                      <div className="text-right min-w-[90px]">
                        <span className="text-[#8A949E] block text-[10.5px]">
                          {isEn ? 'Soil Delta' : 'Neraca Tanah'}
                        </span>
                        <span className="text-[#00C2CC]">
                          {season.batteryDelta_pct >= 0 ? `+${season.batteryDelta_pct}%` : `${season.batteryDelta_pct}%`} ({formatKgPerHa(season.nitrogenDelta_kg_ha)})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11.5px] text-[#8A949E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C2CC]" />
                <span>
                  {isEn
                    ? 'Adaptive 4-season schedule optimized for water resilience, AEZ zoning & soil recovery'
                    : 'Jadwal 4 musim adaptif teroptimasi untuk ketahanan air, zonasi AEZ & pemulihan hara'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/action-sheet"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#20242B] hover:bg-[#282F3A] border border-[#2C313A] text-xs font-medium text-[#F1F3F5] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00C2CC]" />
                  <span>{isEn ? 'Export Action Sheet' : 'Cetak Action Sheet'}</span>
                </Link>
                <Link
                  href="/field-advisor"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#163A40] hover:bg-[#1C474F] text-[#00C2CC] border border-[#00C2CC]/40 text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Ask AI Advisor' : 'Tanya AI Advisor'}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
