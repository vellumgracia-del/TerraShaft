'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  RefreshCw,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function TopHeader({
  onToggleMobileMenu
}: TopHeaderProps) {
  const {
    location,
    elevation_m,
    isLoadingBioData,
    fetchBioPhysicalData,
    provenance
  } = useTerraShaftStore();

  const badge = provenance.headerBadge;
  const shortPlace = location.district || location.placeName.split(',')[0] || 'Kupang Timur';

  return (
    <header className="h-16 bg-[#121417] border-b border-[#282C34] px-4 lg:px-6 sticky top-0 z-40 select-none flex items-center justify-between text-[#F1F3F5] transition-all">
      {/* Left: Brand Mark + Divider + Data Module Selector */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-[5px] text-[#C1C7CD] hover:bg-[#20242B] hover:text-white shrink-0"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="flex items-center shrink-0 group py-1">
          {/* Official TerraShaft Orbital Agriculture Logo: Prominent & High Clarity */}
          <Image
            src="/terrashaft-logo.png"
            alt="TerraShaft Orbital Agriculture"
            width={200}
            height={50}
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        <div className="h-7 w-px bg-[#282C34] mx-1 sm:mx-1.5 shrink-0" />

        {/* Active Workspace / Data Switcher Pill */}
        <Link
          href="/field-map"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-[#1C2026] hover:bg-[#242931] border border-[#2C313A] text-xs sm:text-[13px] font-medium text-[#F1F3F5] transition-colors truncate"
          title={`AOI Aktif: ${location.placeName} (${location.lat.toFixed(4)}°, ${location.lon.toFixed(4)}° | ${elevation_m}m dpl)`}
        >
          <span className="w-4 h-4 rounded-[3px] bg-[#0284C7] flex items-center justify-center text-white shrink-0">
            <LayoutGrid className="w-2.5 h-2.5" />
          </span>
          <span className="font-semibold text-white">Data</span>
          <span className="hidden md:inline text-[#8A949E] font-normal truncate max-w-[240px]">
            · {shortPlace} ({location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°)
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A949E] shrink-0" />
        </Link>
      </div>

      {/* Right: Minimal Planet Utility Toolbar */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live Telemetry Sync Refresh Button (Icon Only) */}
        <button
          type="button"
          onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
          disabled={isLoadingBioData}
          title={isLoadingBioData ? 'Menyinkronkan telemetri satelit...' : `Sinkronisasi telemetri satelit (${badge?.text || 'NASA POWER & ISRIC SoilGrids'})`}
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors disabled:opacity-50"
          aria-label="Sinkronisasi telemetri satelit"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingBioData ? 'animate-spin text-[#00C2CC]' : 'text-[#C1C7CD] hover:text-white'}`} />
        </button>

        {/* Notifications / Telemetry Provenance */}
        <Link
          href="/data-sources"
          title="Status Telemetri & Provenansi Data"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full absolute top-2.5 right-2.5 bg-[#00C2CC]" />
        </Link>

        {/* Help / Scientific Documentation */}
        <Link
          href="/data-sources"
          title="Dokumentasi Ilmiah & Sumber Satelit"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* Settings / Workbench Preference */}
        <button
          type="button"
          title="Pengaturan Workbench Planet"
          className="w-9 h-9 rounded-[5px] inline-flex items-center justify-center text-[#C1C7CD] hover:text-white hover:bg-[#20242B] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar Badge with Solid Color & Text Placeholder (Planet Style) */}
        <Link
          href="/action-sheet"
          title="Profil Pengguna & Lembar Ekspor"
          className="w-8 h-8 rounded-full bg-[#42CADB] hover:bg-[#52D8E8] text-[#121417] font-bold text-xs inline-flex items-center justify-center ml-1 transition-all select-none shadow-xs shrink-0"
        >
          <span>RI</span>
        </Link>
      </div>
    </header>
  );
}
