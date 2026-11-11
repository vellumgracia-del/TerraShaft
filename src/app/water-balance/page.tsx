'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WaterBalanceCard = dynamic(() => import('@/components/water/WaterBalanceCard'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#20242B] border border-[#2C313A] rounded-[4px] p-12 flex items-center justify-center text-xs text-[#8A949E]">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-[#009DA5] border-t-transparent rounded-full animate-spin" />
        <span>Memuat Analisis Neraca Air Lahan...</span>
      </div>
    </div>
  )
});

export default function WaterBalancePage() {
  return (
    <section className="flex flex-col gap-4">
      <WaterBalanceCard />
    </section>
  );
}
