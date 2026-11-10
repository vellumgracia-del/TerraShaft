'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  RotateCw,
  BatteryCharging,
  Droplets,
  Database,
  Share2,
  Satellite,
  Sprout
} from 'lucide-react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { getOverallDisplayStatus } from '@/lib/provenance';

interface SidebarProps {
  onNavigate?: () => void;
}

export const NAV_ITEMS = [
  { id: 'overview', href: '/', label: 'Ringkasan Lahan', icon: LayoutDashboard, desc: 'Indikator biofisik & ringkasan' },
  { id: 'field-map', href: '/field-map', label: 'Peta Lahan', icon: MapPin, desc: 'Observasi spasial & koordinat' },
  { id: 'soil-battery', href: '/soil-battery', label: 'Baterai Tanah', icon: BatteryCharging, desc: 'Kapasitas kesuburan & hara' },
  { id: 'rotation-planner', href: '/rotation-planner', label: 'Rotasi 4 Musim', icon: RotateCw, desc: 'Skenario siklus tanam adaptif' },
  { id: 'water-balance', href: '/water-balance', label: 'Neraca Air', icon: Droplets, desc: 'Presipitasi vs kebutuhan ETc' },
  { id: 'crop-library', href: '/crop-library', label: 'Pustaka Tanaman', icon: Database, desc: 'Basis data varietas komoditas' },
  { id: 'action-sheet', href: '/action-sheet', label: 'Lembar Aksi (WA)', icon: Share2, desc: 'Ekspor poster panduan lapangan' },
  { id: 'data-sources', href: '/data-sources', label: 'Sumber Data', icon: Satellite, desc: 'Provenansi NASA & SoilGrids' }
];

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const prov = useTerraShaftStore((s) => s.provenance);
  const overallStatus = getOverallDisplayStatus(prov);

  return (
    <aside className="w-64 bg-white border-r border-[#E4EAE6] flex flex-col shrink-0 min-h-screen py-6 px-4 select-none">
      {/* Brand Identity */}
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#12A875] flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
          <Sprout className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#17231F] leading-tight flex items-center gap-1">
            TerraShaft
          </h1>
          <p className="text-xs text-[#7B8681] font-medium">Farm Intelligence</p>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] px-3 mb-2">
        Halaman Modul
      </div>
      <nav className="flex-1 flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#E7F5EE] text-[#12A875] font-semibold'
                  : 'text-[#52605B] hover:bg-[#F5F7F4] hover:text-[#17231F]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#12A875]' : 'text-[#7B8681]'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Truthful Data Provenance Status in Sidebar Footer */}
      <div className="p-3 bg-[#F5F7F4] border border-[#E4EAE6] rounded-2xl flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231F]">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              overallStatus.tone === 'success'
                ? 'bg-[#12A875]'
                : overallStatus.tone === 'info'
                ? 'bg-[#0284C7]'
                : overallStatus.tone === 'neutral'
                ? 'bg-[#7B8681]'
                : overallStatus.tone === 'error'
                ? 'bg-[#E11D48]'
                : 'bg-[#D97706]'
            }`}
          />
          <span className="truncate">{overallStatus.shortLabel}</span>
        </div>
        <p className="text-[11px] text-[#7B8681] leading-relaxed line-clamp-2">
          {overallStatus.detailText}
        </p>
      </div>
    </aside>
  );
}
