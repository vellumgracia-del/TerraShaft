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
    <header className="bg-white/98 backdrop-blur-md border-b border-[#E4EAE6] px-4 lg:px-8 py-3.5 sticky top-0 z-30 transition-colors shadow-xs">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Button & Greeting + Location */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl border border-[#E4EAE6] text-[#52605B] hover:bg-[#F5F7F4]"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-[#17231F] tracking-tight">
                Halo, Petani TerraShaft!
              </h1>
              {/* Dynamic Truthful Provenance Status Chip */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.style}`}
                title={`NASA POWER: ${prov.nasaPower.mode.toUpperCase()} (${prov.nasaPower.observationPeriod}) | SoilGrids: ${prov.isricSoilGrids.mode.toUpperCase()} (${prov.isricSoilGrids.observationPeriod})`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.isVerifiedLive ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : prov.overallMode === 'cached' ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                <span>{badge.label}</span>
              </span>

              {!badge.isVerifiedLive && (
                <span className="text-[11px] text-[#7B8681] hidden lg:inline">
                  · {badge.sublabel}
                </span>
              )}
            </div>

            {/* Selected Location Subtitle */}
            <div className="flex items-center gap-1.5 text-xs text-[#7B8681] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#12A875] shrink-0" />
              <span className="font-medium text-[#52605B]">
                {location.district ? `${location.district}, ${location.province || 'Indonesia'}` : location.placeName}
              </span>
              <span>·</span>
              <span className="font-mono text-xs">{elevation_m} m dpl</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2">
          {/* Synchronize Telemetry Button */}
          <button
            type="button"
            onClick={() => fetchBioPhysicalData(location.lat, location.lon)}
            disabled={isLoadingBioData}
            title="Sinkronisasi data biofisik NASA & SoilGrids"
            className="p-2 rounded-xl border border-[#E4EAE6] bg-white hover:bg-[#F5F7F4] text-[#52605B] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBioData ? 'animate-spin text-[#12A875]' : ''}`} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleFieldMode}
            title="Alihkan Mode Gelap / Terang"
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isFieldMode
                ? 'bg-[#182520] text-[#34D399] border-[#22332C] shadow-xs'
                : 'bg-white border-[#E4EAE6] text-[#52605B] hover:bg-[#F5F7F4]'
            }`}
          >
            {isFieldMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[#7B8681]" />}
            <span className="hidden md:inline">{isFieldMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          {/* Pustaka Tanaman Page Link */}
          <Link
            href="/crop-library"
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              pathname.startsWith('/crop-library')
                ? 'bg-[#E7F5EE] border-[#12A875] text-[#12A875]'
                : 'border-[#E4EAE6] bg-white hover:bg-[#F5F7F4] text-[#17231F]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#12A875]" />
            <span className="hidden sm:inline">Pustaka</span>
          </Link>

          {/* Action Sheet Page Link */}
          <Link
            href="/action-sheet"
            className="px-4 py-2 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Action Sheet</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
