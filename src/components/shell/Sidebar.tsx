'use client';

import React from 'react';
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

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenCropLibrary: () => void;
  onOpenExportModal: () => void;
  isCropLibraryOpen?: boolean;
  isExportModalOpen?: boolean;
}

export default function Sidebar({
  activeSection,
  onNavigate,
  onOpenCropLibrary,
  onOpenExportModal,
  isCropLibraryOpen = false,
  isExportModalOpen = false
}: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Ringkasan Lahan', icon: LayoutDashboard },
    { id: 'field-map', label: 'Peta Lahan', icon: MapPin },
    { id: 'soil-battery', label: 'Baterai Tanah', icon: BatteryCharging },
    { id: 'rotation-planner', label: 'Rotasi 4 Musim', icon: RotateCw },
    { id: 'water-balance', label: 'Neraca Air', icon: Droplets },
    { id: 'crop-library', label: 'Pustaka Tanaman', icon: Database, isAction: true, onClick: onOpenCropLibrary, isActive: isCropLibraryOpen },
    { id: 'action-sheet', label: 'Lembar Aksi (WA)', icon: Share2, isAction: true, onClick: onOpenExportModal, isActive: isExportModalOpen },
    { id: 'data-sources', label: 'Sumber Data', icon: Satellite }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E4EAE6] flex flex-col shrink-0 min-h-screen py-6 px-4 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#12A875] flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
          <Sprout className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#17231F] leading-tight flex items-center gap-1">
            TerraShaft
          </h1>
          <p className="text-xs text-[#7B8681] font-medium">Farm Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] px-3 mb-2">
        Menu Utama
      </div>
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive !== undefined ? item.isActive : activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isAction && item.onClick) {
                  item.onClick();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#E7F5EE] text-[#12A875] font-semibold'
                  : 'text-[#52605B] hover:bg-[#F5F7F4] hover:text-[#17231F]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#12A875]' : 'text-[#7B8681]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Scientific Standard Badge in Footer */}
      <div className="p-3 bg-[#F5F7F4] border border-[#E4EAE6] rounded-2xl flex flex-col gap-1 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17231F]">
          <span className="w-2 h-2 rounded-full bg-[#12A875]" />
          <span>NASA & ISRIC Ready</span>
        </div>
        <p className="text-[11px] text-[#7B8681] leading-relaxed">
          Eksplorasi skenario adaptif berbasis biofisik satelit dan model agronomi.
        </p>
      </div>
    </aside>
  );
}
