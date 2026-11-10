'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import {
  RefreshCw,
  Share2,
  Database,
  Sun,
  Moon,
  MapPin,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function TopHeader({
  onToggleMobileMenu
}: TopHeaderProps) {
  const pathname = usePathname();
  const {
    location,
    elevation_m,
    isFieldMode,
    toggleFieldMode,
    isLoadingBioData,
    fetchBioPhysicalData,
    provenance
  } = useTerraShaftStore();

  const badge = provenance.headerBadge;
  const prov = provenance;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E4EAE6] px-4 lg:px-8 py-3 sticky top-0 z-30 transition-colors shadow-xs">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Button & Greeting + Location */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl border border-[#E4EAE6] text-[#52605B] hover:bg-[#F5F7F4] shrink-0"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#17231F] tracking-tight whitespace-nowrap">
                Halo, Petani TerraShaft!
              </h1>
              {/* Dynamic Truthful Provenance Status Chip */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${badge.style}`}
                title={`${badge.sublabel} | NASA POWER: ${prov.nasaPower.mode.toUpperCase()} (${prov.nasaPower.observationPeriod}) | SoilGrids: ${prov.isricSoilGrids.mode.toUpperCase()} (${prov.isricSoilGrids.observationPeriod})`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                {badge.isVerifiedLive ? (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                ) : prov.overallMode === 'cached' ? (
                  <Clock className="w-3 h-3 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate max-w-[200px] sm:max-w-none">{badge.label}</span>
              </span>

              {!badge.isVerifiedLive && (
                <span className="text-[11px] text-[#7B8681] hidden 2xl:inline truncate max-w-[280px]">
                  · {badge.sublabel}
                </span>
              )}
            </div>

            {/* Selected Location Subtitle */}
            <div className="flex items-center gap-1.5 text-xs text-[#7B8681] mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#12A875] shrink-0" />
              <span className="font-medium text-[#52605B] truncate">
                {location.district ? `${location.district}, ${location.province || 'Indonesia'}` : location.placeName}
              </span>
              <span className="shrink-0">·</span>
              <span className="font-mono text-xs shrink-0">{elevation_m} m dpl</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Controls (Never wraps inside buttons) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Synchronize Telemetry Button */}
          <button
            type="button"
            onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
            disabled={isLoadingBioData}
            title="Sinkronisasi data biofisik NASA & SoilGrids"
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-[#E4EAE6] bg-white hover:bg-[#F5F7F4] text-[#52605B] transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBioData ? 'animate-spin text-[#12A875]' : ''}`} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleFieldMode}
            title="Alihkan Mode Gelap / Terang"
            className={`h-9 px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              isFieldMode
                ? 'bg-[#182520] text-[#34D399] border-[#22332C] shadow-xs'
                : 'bg-white border-[#E4EAE6] text-[#52605B] hover:bg-[#F5F7F4]'
            }`}
          >
            {isFieldMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#7B8681] shrink-0" />
            )}
            <span className="hidden md:inline">{isFieldMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          {/* Pustaka Tanaman Page Link */}
          <Link
            href="/crop-library"
            className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              pathname.startsWith('/crop-library')
                ? 'bg-[#E7F5EE] border-[#12A875] text-[#12A875]'
                : 'border-[#E4EAE6] bg-white hover:bg-[#F5F7F4] text-[#17231F]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#12A875] shrink-0" />
            <span className="hidden sm:inline">Pustaka</span>
          </Link>

          {/* Action Sheet Page Link */}
          <Link
            href="/action-sheet"
            className="h-9 px-4 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>Action Sheet</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
