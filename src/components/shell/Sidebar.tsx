'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Search,
  Rss,
  Pentagon,
  FileText,
  Layers,
  Database,
  Share2,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NAV_ITEMS = [
  {
    id: 'overview',
    href: '/overview',
    label: 'Overview',
    icon: LayoutGrid,
    desc: 'Alur kerja spasial, telemetri aktif & ringkasan rotasi',
    apiLabel: 'Workspace Overview',
    group: 'root'
  },
  {
    id: 'field-map',
    href: '/field-map',
    label: 'Search and AOI',
    icon: Search,
    desc: 'Cari lokasi global, geser pin koordinat & elevasi DEM',
    apiLabel: 'Nominatim & DEM API',
    group: 'add_data'
  },
  {
    id: 'data-sources',
    href: '/data-sources',
    label: 'Subscribe to telemetry',
    icon: Rss,
    desc: 'Status koneksi satelit NASA POWER & ISRIC SoilGrids v2.0',
    apiLabel: 'NASA POWER & SoilGrids API',
    group: 'add_data'
  },
  {
    id: 'crop-library',
    href: '/crop-library',
    label: 'Areas & crop varieties',
    icon: Pentagon,
    desc: 'Katalog parameter fisiologis tanaman & input varietas lokal',
    apiLabel: 'Crop Library API',
    group: 'add_data'
  },
  {
    id: 'rotation-planner',
    href: '/rotation-planner',
    label: '4-Season rotation',
    icon: FileText,
    desc: 'Optimasi siklus tanam 4 musim, radar 5-sumbu & log audit',
    apiLabel: 'Combinatorial Engine',
    group: 'delivery'
  },
  {
    id: 'soil-battery',
    href: '/soil-battery',
    label: 'Soil battery (0-30cm)',
    icon: Layers,
    desc: 'Profil tekstur pasir-debu-liat, SOC, pH, KTK & neraca N',
    apiLabel: 'Pedotransfer 0-30cm API',
    group: 'delivery'
  },
  {
    id: 'water-balance',
    href: '/water-balance',
    label: 'Water collections',
    icon: Database,
    desc: 'Kurva presipitasi bulanan vs evapotranspirasi Hargreaves ET0',
    apiLabel: 'Hydrology & ET0 API',
    group: 'delivery'
  },
  {
    id: 'field-advisor',
    href: '/field-advisor',
    label: 'Field Advisor AI',
    icon: Sparkles,
    desc: 'Konsultasi agronomi berbasis telemetri lahan riil & rujukan pustaka SOP',
    apiLabel: 'RAG Agronomist Copilot API',
    group: 'delivery'
  },
  {
    id: 'action-sheet',
    href: '/action-sheet',
    label: 'Destinations & export',
    icon: Share2,
    desc: 'Cetak poster panduan lapangan 1080x1350px & distribusi WA',
    apiLabel: 'Destinations & Export API',
    group: 'delivery'
  }
];

export default function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();

  const rootItems = NAV_ITEMS.filter((i) => i.group === 'root');
  const addDataItems = NAV_ITEMS.filter((i) => i.group === 'add_data');
  const deliveryItems = NAV_ITEMS.filter((i) => i.group === 'delivery');

  const renderNavItem = (item: (typeof NAV_ITEMS)[number]) => {
    const Icon = item.icon;
    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] transition-colors ${
          isActive
            ? 'bg-[#163A40] text-[#F1F3F5] font-medium'
            : 'text-[#C1C7CD] hover:bg-[#1F242B] hover:text-white font-normal'
        } ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 ${
            isActive ? 'text-[#00C2CC]' : 'text-[#9BA3AE]'
          }`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-14' : 'w-56'
      } bg-[#16191E] border-r border-[#282C34] flex flex-col shrink-0 h-full select-none text-[#C1C7CD] transition-all duration-150`}
    >
      {/* Top Collapse Button matching Planet Insights Platform (tab style) */}
      {onToggleCollapse && (
        <div className={`flex items-center ${collapsed ? 'justify-center pt-2 pb-1' : 'justify-end'} select-none`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            className={`group inline-flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:ring-0 ${
              collapsed
                ? 'w-9 h-7 rounded-[3px] bg-[#20252D] hover:bg-[#2A303A] text-[#9BA3AE] hover:text-white border border-[#282C34]'
                : 'h-7 px-2.5 rounded-bl-[4px] bg-[#20252D] hover:bg-[#2A303A] text-[#9BA3AE] hover:text-white border-l border-b border-[#282C34]'
            }`}
          >
            {collapsed ? (
              /* Expand Icon: 3 horizontal bars + chevron right */
              <svg
                className="w-3.5 h-3.5 text-[#9BA3AE] group-hover:text-white transition-colors"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <rect x="2" y="3.5" width="7" height="1.5" rx="0.75" />
                <rect x="2" y="7.25" width="7" height="1.5" rx="0.75" />
                <rect x="2" y="11" width="7" height="1.5" rx="0.75" />
                <path
                  d="M10.5 4.5L14 8L10.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            ) : (
              /* Collapse Icon: 3 horizontal bars + chevron left (matches Planet.com) */
              <svg
                className="w-3.5 h-3.5 text-[#9BA3AE] group-hover:text-white transition-colors"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <rect x="2" y="3.5" width="7" height="1.5" rx="0.75" />
                <rect x="2" y="7.25" width="7" height="1.5" rx="0.75" />
                <rect x="2" y="11" width="7" height="1.5" rx="0.75" />
                <path
                  d="M13.5 4.5L10 8L13.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      <div className={`p-2.5 ${collapsed ? 'pt-1' : 'pt-2'} flex-1 flex flex-col gap-5 overflow-y-auto`}>
        {/* Root Overview Item */}
        <nav className="flex flex-col gap-1">
          {rootItems.map(renderNavItem)}
        </nav>

        {/* ADD DATA Group */}
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#8A949E] px-3 mb-1">
              ADD DATA
            </div>
          )}
          <nav className="flex flex-col gap-0.5">
            {addDataItems.map(renderNavItem)}
          </nav>
        </div>

        {/* VIEW DATA DELIVERY Group */}
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#8A949E] px-3 mb-1">
              VIEW DATA DELIVERY
            </div>
          )}
          <nav className="flex flex-col gap-0.5">
            {deliveryItems.map(renderNavItem)}
          </nav>
        </div>
      </div>
    </aside>
  );
}
