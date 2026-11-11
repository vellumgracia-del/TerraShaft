'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import FourSeasonRotationCard from '@/components/rotation/FourSeasonRotationCard';

const PathwayRadarComparison = dynamic(
  () => import('@/components/rotation/PathwayRadarComparison'),
  { ssr: false }
);

export default function RotationPlannerPage() {
  return (
    <section className="flex flex-col gap-6">
      <FourSeasonRotationCard />
      <PathwayRadarComparison />
    </section>
  );
}
