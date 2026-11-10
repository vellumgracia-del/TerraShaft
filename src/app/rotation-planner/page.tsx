'use client';

import React from 'react';
import FourSeasonRotationCard from '@/components/rotation/FourSeasonRotationCard';

export default function RotationPlannerPage() {
  return (
    <section className="flex flex-col gap-4">
      <FourSeasonRotationCard />
    </section>
  );
}
