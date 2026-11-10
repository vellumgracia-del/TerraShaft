'use client';

import React from 'react';
import Link from 'next/link';
import SummaryMetricCards from '@/components/overview/SummaryMetricCards';
import { NAV_ITEMS } from '@/components/shell/Sidebar';
import { LayoutDashboard, ArrowRight, Compass } from 'lucide-react';

export default function HomePage() {
  const moduleCards = NAV_ITEMS.filter((item) => item.href !== '/');

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#17231F] flex items-center gap-1.5 uppercase tracking-wider">
              <LayoutDashboard className="w-4 h-4 text-[#12A875]" />
              Ringkasan Indikator Biofisik & Rekomendasi
            </h2>
            <p className="text-xs text-[#7B8681]">
              Metrik agro-klimatologi satelit NASA SMAP dan profil tanah ISRIC SoilGrids
            </p>
          </div>
          <Link
            href="/field-map"
            className="px-3.5 py-2 rounded-xl bg-[#12A875] hover:bg-[#0E9365] text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Buka Peta & Pilih Lokasi</span>
          </Link>
        </div>

        <SummaryMetricCards />
      </section>

      {/* Dedicated Module Directory Cards */}
      <section className="flex flex-col gap-3 pt-2">
        <div>
          <h3 className="text-xs font-bold text-[#52605B] uppercase tracking-wider">
            Direktori Halaman Khusus (Per-Modul)
          </h3>
          <p className="text-xs text-[#7B8681]">
            Pilih halaman spesifik untuk membuka analisis mendalam tanpa perlu menggulir satu halaman panjang
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {moduleCards.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="agri-card p-5 flex flex-col justify-between gap-4 hover:border-[#12A875] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E7F5EE] text-[#12A875] flex items-center justify-center shrink-0 group-hover:bg-[#12A875] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#12A875] group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#17231F] group-hover:text-[#12A875] transition-colors">
                    {mod.label}
                  </h4>
                  <p className="text-xs text-[#7B8681] mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
