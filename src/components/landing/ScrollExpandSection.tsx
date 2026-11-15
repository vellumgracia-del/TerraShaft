'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAppI18n } from '@/lib/i18n';

export default function ScrollExpandSection() {
  const { isEn } = useAppI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = rect.height;
      const windowHeight = window.innerHeight;
      const span = trackHeight - windowHeight;

      if (span <= 0) return;

      const rawP = -rect.top / span;
      const clampedP = Math.min(Math.max(rawP, 0), 1);
      setProgress(clampedP);

      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 110);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Hermite smoothstep curve: e = p^2 * (3 - 2p)
  const e = progress * progress * (3 - 2 * progress);

  // 1. Scale Window vs Counter-Scale Media
  // Card outer scales from 0.38 (x) and 0.54 (y) up to 1.0 (fullscreen)
  const sx = 0.38 + (1 - 0.38) * e;
  const sy = 0.54 + (1 - 0.54) * e;

  // Counter-scale media with subtle zoom to avoid distorting background
  const zoom = 1.08 - 0.08 * e;
  const counterScaleX = (1 / sx) * zoom;
  const counterScaleY = (1 / sy) * zoom;

  // 2. Border Radius Morph: 24px -> 0px
  const borderRadius = Math.round(24 * (1 - e));

  // 3. Title Fade & Lift: p in [0.4, 0.88]
  let titleOpacity = 1;
  let titleTranslateY = 0;
  if (progress >= 0.4) {
    const t = Math.min((progress - 0.4) / (0.88 - 0.4), 1);
    titleOpacity = 1 - t;
    titleTranslateY = -28 * t;
  }

  // 4. Content Fade-In: p in [0.68, 1.0]
  let contentOpacity = 0;
  let contentTranslateY = 18;
  if (progress >= 0.68) {
    const c = Math.min((progress - 0.68) / (1.0 - 0.68), 1);
    contentOpacity = c;
    contentTranslateY = 18 * (1 - c);
  }

  // 5. Spotlight Lock & Deferred Blur: p >= 0.85
  const enableDeferredBlur = progress >= 0.85 && !isScrolling;

  // Scroll indicator hint at bottom (fades out as soon as user scrolls)
  const scrollHintOpacity = Math.max(1 - progress * 4, 0);

  return (
    <div
      id="pathways"
      ref={trackRef}
      className="relative w-full h-[250vh] bg-[#070A0F] scroll-mt-24"
    >
      {/* Sticky Stage Viewport (100dvh) */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center select-none">
        {/* Expanding Card Window */}
        <div
          className="relative w-full h-full max-w-[1920px] overflow-hidden origin-center will-change-transform shadow-2xl"
          style={{
            transform: `scale(${sx}, ${sy})`,
            borderRadius: `${borderRadius}px`,
          }}
        >
          {/* Background Image Container with Counter-Scale Anti-Distortion */}
          <div
            className="absolute inset-0 w-full h-full will-change-transform"
            style={{
              transform: `scale(${counterScaleX}, ${counterScaleY})`,
              transformOrigin: 'center center',
            }}
          >
            <Image
              src="/images/scroll-expand-bg.jpg"
              alt="Deep Moody Oceanic Telemetry Atmosphere"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Dark vignette scrim for maximum text legibility */}
            <div className="absolute inset-0 bg-[#070A0F]/65" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070A0F]/60 to-[#070A0F]/90" />
          </div>

          {/* Fullscreen Expanded State: 3 Optimization Pathways */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 lg:p-12 z-20 pointer-events-auto"
            style={{
              opacity: contentOpacity,
              transform: `translate3d(0, ${contentTranslateY}px, 0)`,
              pointerEvents: progress >= 0.75 ? 'auto' : 'none',
            }}
          >
            <div
              className={`max-w-[1280px] w-full mx-auto flex flex-col gap-8 transition-all duration-300 ${
                enableDeferredBlur ? 'backdrop-blur-md' : 'backdrop-blur-none'
              }`}
            >
              {/* Header */}
              <div className="max-w-2xl text-left">
                <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
                  {isEn ? '3 OPTIMIZATION PATHWAYS' : '3 JALUR OPTIMASI'}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F1F3F5] tracking-tight">
                  {isEn ? 'Choose Strategy Based on Farm Priorities' : 'Pilih Strategi Berdasarkan Prioritas Lahan'}
                </h2>
                <p className="text-xs sm:text-sm text-[#9BA3AE] mt-2 leading-relaxed">
                  {isEn
                    ? 'The engine computes balanced trade-offs between cash profitability, soil battery longevity, and El Niño drought resilience.'
                    : 'Mesin menghitung keseimbangan antara profitabilitas tunai, ketahanan baterai tanah, dan daya tahan kekeringan El Nino.'}
                </p>
              </div>

              {/* 3 Pathway Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Pathway A */}
                <div className="p-6 rounded-[8px] bg-[#10141A]/90 border border-[#282C34] hover:border-[#00C2CC]/40 transition-all flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                      {isEn ? 'Pathway A' : 'Jalur A'}
                    </div>
                    <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                      {isEn ? 'Max Soil Regeneration' : 'Regenerasi Tanah Maksimal'}
                    </h3>
                    <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                      {isEn
                        ? 'Restores degraded soil and breaks plow pans using deep-taproot cover crops (Sunn Hemp) and high-efficiency nitrogen-fixing legumes.'
                        : 'Memulihkan tanah terdegradasi dan memecah lapisan padas dengan tanaman penutup berakar tunggang dalam (Orok-orok) serta legum penambat nitrogen.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#282C34]/60 flex flex-col gap-2.5 text-xs text-[#C1C7CD]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Fully recharged soil battery (+25% to +35%)' : 'Pengisian ulang baterai tanah penuh (+25% hingga +35%)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Deep biomass injection and plow pan remediation' : 'Injeksi biomassa dalam dan perbaikan lapisan padas'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/rotation-planner"
                    className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1 group"
                  >
                    <span>{isEn ? 'Explore Pathway A Simulation' : 'Jelajahi Simulasi Jalur A'}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Pathway B */}
                <div className="p-6 rounded-[8px] bg-[#10141A]/95 border border-[#00C2CC]/60 flex flex-col justify-between relative shadow-2xl shadow-[#00C2CC]/10">
                  <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#164E55]">
                    {isEn ? 'DRYLAND RECOMMENDATION' : 'REKOMENDASI LAHAN KERING'}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                      {isEn ? 'Pathway B' : 'Jalur B'}
                    </div>
                    <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                      {isEn ? 'Drought Resilience' : 'Ketahanan Kekeringan'}
                    </h3>
                    <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                      {isEn
                        ? 'Fortified against prolonged dry spells. Blocks water-intensive crops during peak drought, prioritizing grain sorghum and drought-tolerant legumes.'
                        : 'Diperkuat untuk menghadapi kemarau panjang. Menghindari tanaman boros air saat puncak kekeringan, memprioritaskan sorgum biji dan legum tahan kering.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#00C2CC]/20 flex flex-col gap-2.5 text-xs text-[#C1C7CD]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Zero crop failure risk (safe water deficit thresholds)' : 'Risiko gagal panen minimal (ambang defisit air aman)'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Up to 60% water savings versus monoculture' : 'Hemat air hingga 60% dibanding monokultur'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/rotation-planner"
                    className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1 group"
                  >
                    <span>{isEn ? 'Explore Pathway B Simulation' : 'Jelajahi Simulasi Jalur B'}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Pathway C */}
                <div className="p-6 rounded-[8px] bg-[#10141A]/90 border border-[#282C34] hover:border-[#00C2CC]/40 transition-all flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                      {isEn ? 'Pathway C' : 'Jalur C'}
                    </div>
                    <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                      {isEn ? 'Cash-Flow Optimized' : 'Optimasi Arus Kas'}
                    </h3>
                    <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                      {isEn
                        ? 'Maximizes seasonal farmer cash revenue while keeping cumulative water deficit within safe tolerance limits to safeguard yields.'
                        : 'Memaksimalkan pendapatan tunai musiman petani sambil menjaga defisit air kumulatif tetap dalam batas toleransi aman untuk melindungi hasil panen.'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#282C34]/60 flex flex-col gap-2.5 text-xs text-[#C1C7CD]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Highest economic profitability index' : 'Indeks profitabilitas ekonomi tertinggi'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#00C2CC] shrink-0 mt-1.5" />
                        <span className="leading-snug">
                          {isEn ? 'Strategic rotation of high-market-value crops' : 'Rotasi strategis komoditas bernilai pasar tinggi'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/rotation-planner"
                    className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1 group"
                  >
                    <span>{isEn ? 'Explore Pathway C Simulation' : 'Jelajahi Simulasi Jalur C'}</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Initial Headline State: Large Fixed-Scale Title Overlapping and Extending Past Card Borders */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none z-10"
          style={{
            opacity: titleOpacity,
            transform: `translate3d(0, ${titleTranslateY}px, 0)`,
          }}
        >
          <h2 className="text-3xl sm:text-[clamp(1.75rem,4.2vw,4.5rem)] font-black text-white tracking-tight leading-none text-center whitespace-normal sm:whitespace-nowrap drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] max-w-[90vw]">
            {isEn ? 'Observe. Simulate. Harvest.' : 'Amati. Simulasikan. Panen.'}
          </h2>

          {/* Scroll indicator hint at bottom of viewport */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[11px] font-mono tracking-widest text-[#8A949E] transition-opacity duration-300"
            style={{ opacity: scrollHintOpacity }}
          >
            <span>{isEn ? 'SCROLL' : 'GULIR'}</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#00C2CC]" />
          </div>
        </div>
      </div>
    </div>
  );
}
