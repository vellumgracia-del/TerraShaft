'use client';

import React from 'react';
import { Globe2, ShieldCheck, AlertTriangle, Compass } from 'lucide-react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { useAppI18n } from '@/lib/i18n';

export const GLOBAL_BENCHMARK_SITES = [
  {
    id: 'kupang_id',
    labelEn: 'Kupang Timur, Indonesia',
    labelId: 'Kupang Timur, NTT (Indonesia)',
    lat: -10.1542,
    lon: 123.821,
    elevation: 85,
    country: 'Indonesia',
    countryCode: 'ID',
    province: 'Nusa Tenggara Timur',
    district: 'Kupang Timur'
  },
  {
    id: 'ames_us',
    labelEn: 'Ames, Iowa (US Midwest)',
    labelId: 'Ames, Iowa (AS Midwest)',
    lat: 42.0308,
    lon: -93.6319,
    elevation: 287,
    country: 'United States',
    countryCode: 'US',
    province: 'Iowa',
    district: 'Story County'
  },
  {
    id: 'machakos_ke',
    labelEn: 'Machakos, Kenya (East Africa)',
    labelId: 'Machakos, Kenya (Afrika Timur)',
    lat: -1.5177,
    lon: 37.2634,
    elevation: 1620,
    country: 'Kenya',
    countryCode: 'KE',
    province: 'Machakos County',
    district: 'Machakos'
  },
  {
    id: 'anantapur_in',
    labelEn: 'Anantapur, India (Deccan Semi-Arid)',
    labelId: 'Anantapur, India (Semi-Arid Deccan)',
    lat: 14.6819,
    lon: 77.6006,
    elevation: 335,
    country: 'India',
    countryCode: 'IN',
    province: 'Andhra Pradesh',
    district: 'Anantapur'
  },
  {
    id: 'petrolina_br',
    labelEn: 'Petrolina, Brazil (Semi-Arid Northeast)',
    labelId: 'Petrolina, Brasil (Timur Laut Semi-Arid)',
    lat: -9.3891,
    lon: -40.5027,
    elevation: 376,
    country: 'Brazil',
    countryCode: 'BR',
    province: 'Pernambuco',
    district: 'Petrolina'
  },
  {
    id: 'meknes_ma',
    labelEn: 'Meknes, Morocco (Archetype Fallback Test)',
    labelId: 'Meknes, Maroko (Uji Fallback Arketipe)',
    lat: 33.8935,
    lon: -5.5473,
    elevation: 549,
    country: 'Morocco',
    countryCode: 'MA',
    province: 'Fes-Meknes',
    district: 'Meknes'
  }
];

export default function AgroecologicalProfileCard() {
  const { agroecologicalProfile, localizedCultivars, location, setLocation, isLoadingBioData } =
    useTerraShaftStore();
  const { t, locale, isEn } = useAppI18n();

  const verifiedCount = localizedCultivars.filter(r => !r.is_archetype_fallback).length;
  const fallbackCount = localizedCultivars.filter(r => r.is_archetype_fallback).length;

  return (
    <section className="bg-[#1D2128] border border-[#2C313A] rounded-[6px] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#2C313A] pb-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[5px] bg-[#163A40] text-[#00C2CC] border border-[#009DA5]/40 shrink-0 mt-0.5">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#F1F3F5]">
              {t('aez.panelTitle')}
            </h2>
            <p className="text-xs text-[#9BA3AE] mt-0.5">
              {agroecologicalProfile.country} ({agroecologicalProfile.country_code}) ·{' '}
              <span className="text-[#00C2CC] font-medium capitalize">
                {agroecologicalProfile.agroecological_zone}
              </span>{' '}
              · {agroecologicalProfile.macro_region}
            </p>
          </div>
        </div>

        {/* Cultivar Verification Summary Pill */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          {verifiedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#064E3B]/70 text-[#34D399] border border-[#047857]/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              {verifiedCount} {isEn ? 'Verified Regional Cultivars' : 'Kultivar Lokal Terverifikasi'}
            </span>
          )}
          {fallbackCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#3B2E14] text-[#FBBF24] border border-[#92400E]/60">
              <AlertTriangle className="w-3.5 h-3.5" />
              {fallbackCount} {isEn ? 'Species Archetype Fallbacks' : 'Fallback Arketipe Spesies'}
            </span>
          )}
        </div>
      </div>

      {/* Normalized AEZ Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.country')}</div>
          <div className="font-semibold text-[#F1F3F5] mt-1 truncate">
            {agroecologicalProfile.country} ({agroecologicalProfile.country_code})
          </div>
        </div>
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.zone')}</div>
          <div className="font-semibold text-[#00C2CC] mt-1 capitalize truncate">
            {agroecologicalProfile.agroecological_zone}
          </div>
        </div>
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.elevationBand')}</div>
          <div className="font-semibold text-[#F1F3F5] mt-1 truncate">
            {agroecologicalProfile.elevation_m} m ({agroecologicalProfile.elevation_band.split(' ')[0]})
          </div>
        </div>
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.gddAnnual')}</div>
          <div className="font-semibold text-[#F1F3F5] mt-1">
            {agroecologicalProfile.growing_degree_days_annual.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')} °C·d
          </div>
        </div>
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.dryMonths')}</div>
          <div className="font-semibold text-[#F1F3F5] mt-1">
            {t('aez.dryMonthsCount', { count: agroecologicalProfile.dry_season_months.length })}
          </div>
        </div>
        <div className="bg-[#15181D] border border-[#282C34] rounded-[5px] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[#8A949E]">{t('aez.photoperiod')}</div>
          <div className="font-semibold text-[#F1F3F5] mt-1 truncate" title={agroecologicalProfile.photoperiod_class}>
            {agroecologicalProfile.hemisphere} · {agroecologicalProfile.photoperiod_class.split('-')[0]}
          </div>
        </div>
      </div>

      {/* Guardrail Notice */}
      <div className="flex items-start gap-2.5 px-3 py-2 bg-[#16191E] border border-[#282C34] rounded-[5px] text-[11px] text-[#A6AFB8]">
        <ShieldCheck className="w-4 h-4 text-[#00C2CC] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#E1E4EA]">{t('aez.cultivarGuardrail')}: </span>
          <span>{t('aez.cultivarGuardrailDesc', { country: agroecologicalProfile.country })}</span>
        </div>
      </div>

      {/* Global Benchmark Switcher for Demo & Validation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9BA3AE]">
          <Compass className="w-3.5 h-3.5 text-[#00C2CC]" />
          <span>{t('overview.benchmarksTitle')}:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GLOBAL_BENCHMARK_SITES.map(site => {
            const isActive =
              Math.abs(location.lat - site.lat) < 0.05 &&
              Math.abs(location.lon - site.lon) < 0.05;
            return (
              <button
                key={site.id}
                type="button"
                disabled={isLoadingBioData}
                onClick={() =>
                  setLocation(site.lat, site.lon, isEn ? site.labelEn : site.labelId, site.elevation, {
                    country: site.country,
                    countryCode: site.countryCode,
                    province: site.province,
                    district: site.district
                  })
                }
                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
                  isActive
                    ? 'bg-[#163A40] text-[#00C2CC] border-[#009DA5]'
                    : 'bg-[#15181D] text-[#C1C7CD] border-[#282C34] hover:border-[#4B5563] hover:text-white'
                }`}
              >
                {isEn ? site.labelEn : site.labelId}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
