'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SoilBatteryCard from '@/components/soil/SoilBatteryCard';

export default function SoilBatteryPage() {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-4">
      <SoilBatteryCard onExploreRotation={() => router.push('/rotation-planner')} />
    </section>
  );
}
