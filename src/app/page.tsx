'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import PlanetFooter from '@/components/landing/PlanetFooter';
import {
  ArrowRight,
  Satellite,
  Layers,
  BatteryCharging,
  Bot,
  MapPin,
  Compass,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Droplets,
  Sprout,
  BarChart3,
  Globe2
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Cubic bezier easing matching antislop.ai.id (1 - (1 - t)^3)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const lenis = new Lenis({
      duration: 0.9,
      easing: easeOutCubic,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Only update React state when threshold boundary crosses (0 unnecessary renders)
    lenis.on('scroll', (e: { scroll: number }) => {
      const scrolled = e.scroll > 50;
      if (scrolled !== isScrolledRef.current) {
        isScrolledRef.current = scrolled;
        setIsScrolled(scrolled);
      }
    });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll handler for anchor links matching antislop easing
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -70, duration: 0.9 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const globalHotspots = [
    {
      name: 'Kupang Timur',
      country: 'Indonesia',
      climate: 'Semi-Arid Dryland',
      soil: 'Vertisol Clay 48%',
      crop: 'Corn · Soybean · Sorghum'
    },
    {
      name: 'Machakos County',
      country: 'Kenya',
      climate: 'East African Semi-Arid',
      soil: 'Sandy Clay Loam',
      crop: 'Drought Sorghum · Cowpea'
    },
    {
      name: 'Central Valley',
      country: 'California, USA',
      climate: 'Mediterranean Basin',
      soil: 'Alluvial Silt Loam',
      crop: 'Cover Crop · Alfalfa'
    },
    {
      name: 'Murray-Darling',
      country: 'Australia',
      climate: 'Temperate Arid Basin',
      soil: 'Red Chromosol',
      crop: 'Wheat · Chickpea'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#121417] text-[#F1F3F5] font-sans selection:bg-[#163A40] selection:text-[#00C2CC]">
      {/* 1. Top Marketing Header (Adaptive Antislop style) */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 lg:h-20 px-4 lg:px-10 flex items-center justify-between z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#121417]/90 backdrop-blur-md border-b border-[#242831]/80 shadow-lg'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/terrashaft-logo.png"
              alt="TerraShaft Orbital Agriculture"
              width={180}
              height={45}
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[13px] text-[#A6AFB8]">
            <a
              href="#capabilities"
              onClick={(e) => scrollToSection(e, 'capabilities')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Capabilities
            </a>
            <a
              href="#pathways"
              onClick={(e) => scrollToSection(e, 'pathways')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              4-Season Pathways
            </a>
            <a
              href="#science"
              onClick={(e) => scrollToSection(e, 'science')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Science & Data
            </a>
            <a
              href="#hotspots"
              onClick={(e) => scrollToSection(e, 'hotspots')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Global Hotspots
            </a>
            <Link href="/field-advisor" className="hover:text-[#00C2CC] transition-colors">
              Field Advisor AI
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-[13px] font-medium text-[#C1C7CD] hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/overview"
            className={`text-xs sm:text-[13px] font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              isScrolled
                ? 'px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-[4px] bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] shadow-xs'
                : 'px-3 py-1.5 text-[#00C2CC] hover:text-[#33D4DC] bg-transparent'
            }`}
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section: Fixed Underlay with Satellite Mosaic Video (Antislop Pattern) */}
      <section className="fixed inset-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden z-0 px-4 lg:px-10 pt-16 lg:pt-20 pb-8 pointer-events-auto">
        {/* Fullscreen Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none scale-105"
        >
          <source src="/videos/hero-satellite-grid.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Gradient Scrim Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-[#070A0F]/75 backdrop-brightness-[0.7]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-[#121417]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,15,0.7)_100%)] pointer-events-none" />

        {/* Content Container in Front of Video */}
        <div className="relative z-10 max-w-[1280px] mx-auto flex flex-col items-center text-center">
          {/* Headline Utama */}
          <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-white max-w-5xl leading-[1.12]">
            See Earth from Space. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0]">
              Regenerate Soil on the Ground.
            </span>
          </h1>

          {/* Subtitle contextualizing orbital satellite telemetry */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-[#C1C7CD] max-w-3xl leading-relaxed font-normal">
            Synthesizing daily satellite tile grids, NASA SMAP root-zone soil moisture telemetry, and ISRIC 0–30 cm pedology into climate-adaptive 4-season crop rotation pathways. Detecting moisture stress early to prevent crop failure across semi-arid frontiers.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/overview"
              className="px-6 py-3 rounded-[4px] bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#00C2CC]/25 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/field-map"
              className="px-6 py-3 rounded-[4px] bg-[#12161F]/90 hover:bg-[#1A1F26] border border-[#2E3540] hover:border-[#00C2CC]/60 text-sm font-medium text-white transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-[#00C2CC]" />
              <span>Explore GIS Field Map</span>
            </Link>

            <Link
              href="/data-sources"
              className="px-5 py-3 rounded-[4px] bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-sm font-medium text-[#C1C7CD] hover:text-white transition-colors"
            >
              Audit Data Provenance
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Overlapping Sheet (Curtain Effect / Fixed Underlay Transition - Antislop Pattern) */}
      <main className="relative z-10 bg-[#121417] mt-[100vh] mt-[100dvh] mt-[100svh] shadow-[0_-30px_60px_rgba(0,0,0,0.9)]">
        {/* Core Capabilities (4-Pillar Grid) */}
        <section id="capabilities" className="scroll-mt-24 py-20 lg:py-24 px-4 lg:px-10 border-t border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
              CORE CAPABILITIES
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F1F3F5]">
              Space-Grade Telemetry Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA3AE] mt-3 leading-relaxed">
              Bridging orbital satellite constellations, international pedotransfer models, and agronomic AI grounded in peer-reviewed scientific SOPs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-[6px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center mb-4">
                  <Satellite className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F3F5]">NASA Earth Telemetry</h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Direct assimilation of SMAP L4 (root-zone soil moisture), GPM IMERG (daily precipitation), CERES (solar irradiance), and MERRA-2.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#242831] text-[11px] font-mono text-[#00C2CC]">
                /api/nasa-climate
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-[6px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F3F5]">ISRIC Soil Physics (0-30cm)</h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Sand-silt-clay texture grading, Soil Organic Carbon (SOC), pH H2O, CEC, and bulk density calibrated by Wageningen University.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#242831] text-[11px] font-mono text-[#00C2CC]">
                /api/soil-profile
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-[6px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center mb-4">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F3F5]">The Soil Battery Engine</h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Intuitive Soil Battery dynamic: Monoculture drains soil reserves (-20%/season), while legumes and cover crops actively recharge fertility (+15%).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#242831] text-[11px] font-mono text-[#00C2CC]">
                Closed-Loop Model
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-[6px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[4px] bg-[#163A40] text-[#00C2CC] flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#F1F3F5]">Field Advisor AI (RAG)</h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Intelligent agronomic advisory grounded in real-time land telemetry and 11 verified benchmarks from BRIN, Balittanah, and FAO-56 standards.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#242831] text-[11px] font-mono text-[#00C2CC]">
                /field-advisor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4-Season Pathways Deep-Dive */}
      <section id="pathways" className="scroll-mt-24 py-20 px-4 lg:px-10 bg-[#16191E] border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
              3 OPTIMIZATION PATHWAYS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
              Choose Strategy Based on Farm Priorities
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA3AE] mt-2">
              The engine computes balanced trade-offs between cash profitability, soil battery longevity, and El Niño drought resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pathway A */}
            <div className="p-6 rounded-[6px] bg-[#121417] border border-[#282C34] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                  Pathway A
                </div>
                <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                  Max Soil Regeneration
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Restores degraded soil and breaks plow pans using deep-taproot cover crops (Sunn Hemp) and high-efficiency nitrogen-fixing legumes.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Fully recharged soil battery (+25% to +35%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Deep biomass injection and plow pan remediation</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Explore Pathway A Simulation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pathway B */}
            <div className="p-6 rounded-[6px] bg-[#121417] border border-[#00C2CC]/40 flex flex-col justify-between relative shadow-lg">
              <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#164E55]">
                DRYLAND RECOMMENDATION
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                  Pathway B
                </div>
                <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                  Drought Resilience
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Fortified against prolonged dry spells. Blocks water-intensive crops during peak drought, prioritizing grain sorghum and drought-tolerant legumes.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Zero crop failure risk (safe water deficit thresholds)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Up to 60% water savings versus monoculture</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Explore Pathway B Simulation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pathway C */}
            <div className="p-6 rounded-[6px] bg-[#121417] border border-[#282C34] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                  Pathway C
                </div>
                <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                  Cash-Flow Optimized
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Maximizes seasonal farmer cash revenue while keeping cumulative water deficit within safe tolerance limits to safeguard yields.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Highest economic profitability index</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Strategic rotation of high-market-value crops</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Explore Pathway C Simulation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quantitative Science & Physical Metrics Bar */}
      <section id="science" className="scroll-mt-24 py-14 bg-[#121417] border-b border-[#242831] px-4 lg:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center lg:text-left">
          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">1,296</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              4-Season Permutations
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Exhaustive permutation evaluation for every land coordinate
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">250m</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Soil Physics Resolution
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              ISRIC SoilGrids v2.0 root-zone layer (0–30 cm)
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#34D399]">+160 kg</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Natural N Fixation / Ha
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Legume root nodule bio-injection reducing synthetic fertilizer
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">40% - 60%</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Water Conservation
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Quantified water balance savings versus cereal monoculture
            </span>
          </div>
        </div>
      </section>

      {/* 6. Global Agricultural Hotspots */}
      <section id="hotspots" className="scroll-mt-24 py-20 px-4 lg:px-10 border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
                GLOBAL COVERAGE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
                Deployable Anywhere on Earth
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA3AE] mt-2">
                NASA and ISRIC satellite telemetry covers global terrestrial coordinates from -90° to +90° latitude.
              </p>
            </div>

            <Link
              href="/field-map"
              className="inline-flex items-center gap-1.5 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-semibold"
            >
              <span>Explore Global Satellite Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {globalHotspots.map((h, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[6px] bg-[#16191E] border border-[#282C34] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F1F3F5]">{h.name}</span>
                    <span className="text-[10.5px] font-mono text-[#8A949E]">{h.country}</span>
                  </div>
                  <div className="mt-3 flex flex-col gap-1 text-[11px] text-[#A6AFB8]">
                    <div>
                      <span className="text-[#6C757D]">Climate:</span> {h.climate}
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Soil:</span> {h.soil}
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Rotation:</span> {h.crop}
                    </div>
                  </div>
                </div>
                <Link
                  href="/field-map"
                  className="mt-4 pt-3 border-t border-[#242831] text-[11px] text-[#00C2CC] hover:underline flex items-center justify-between"
                >
                  <span>Explore AOI</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Planet.com Style Footer & Pre-Footer CTA */}
      <PlanetFooter />
    </main>
  </div>
);
}
