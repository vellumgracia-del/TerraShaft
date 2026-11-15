'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import PlanetFooter from '@/components/landing/PlanetFooter';
import ScrollExpandSection from '@/components/landing/ScrollExpandSection';
import {
  ArrowRight,
  Satellite,
  Layers,
  BatteryCharging,
  Bot,
  MapPin,
  Compass,
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
              href="#science"
              onClick={(e) => scrollToSection(e, 'science')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Science & Data
            </a>
            <a
              href="#pathways"
              onClick={(e) => scrollToSection(e, 'pathways')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              4-Season Pathways
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
            <span className="aurora-text">
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
            <div className="group rounded-[10px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[#00C2CC]/5">
              {/* Visual Preview Header with Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0D1015]">
                <Image
                  src="/images/capability-nasa.jpg"
                  alt="NASA Earth Telemetry"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-[#16191E]/30 to-black/20 pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-semibold text-[#F1F3F5] group-hover:text-white transition-colors">
                  NASA Earth Telemetry
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Live NASA POWER agroclimatology (SMAP L4 GWETROOT, GPM-derived precipitation, CERES irradiance) paired with Sentinel-2, Landsat &amp; MODIS NDVI via Planetary Computer.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="group rounded-[10px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[#00C2CC]/5">
              {/* Visual Preview Header with Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0D1015]">
                <Image
                  src="/images/capability-soil.jpg"
                  alt="ISRIC Soil Physics"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-[#16191E]/30 to-black/20 pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-semibold text-[#F1F3F5] group-hover:text-white transition-colors">
                  ISRIC Soil Physics (0-30cm)
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Sand-silt-clay texture grading, Soil Organic Carbon (SOC), pH H2O, CEC, and bulk density calibrated by Wageningen University.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="group rounded-[10px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[#00C2CC]/5">
              {/* Visual Preview Header with Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0D1015]">
                <Image
                  src="/images/capability-battery.jpg"
                  alt="The Soil Battery Engine"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-[#16191E]/30 to-black/20 pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-semibold text-[#F1F3F5] group-hover:text-white transition-colors">
                  The Soil Battery Engine
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Intuitive Soil Battery dynamic: Monoculture drains soil reserves (-20%/season), while legumes and cover crops actively recharge fertility (+15%).
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="group rounded-[10px] bg-[#16191E] border border-[#282C34] hover:border-[#00C2CC]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-[#00C2CC]/5">
              {/* Visual Preview Header with Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#0D1015]">
                <Image
                  src="/images/capability-advisor.jpg"
                  alt="Field Advisor AI"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-[#16191E]/30 to-black/20 pointer-events-none" />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-semibold text-[#F1F3F5] group-hover:text-white transition-colors">
                  Field Advisor AI (RAG)
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Intelligent agronomic advisory grounded in real-time land telemetry and 11 verified benchmarks from BRIN, Balittanah, and FAO-56 standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Science & Quantitative Physical Metrics (Layout inspired by reference) */}
      <section id="science" className="scroll-mt-24 py-20 px-4 lg:px-10 bg-[#121417] border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
          {/* Top Headline & Description */}
          <div className="max-w-4xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-3">
              SCIENCE & DATA BENCHMARKS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F1F3F5] leading-snug">
              <span className="text-white">Scientific precision at planetary scale.</span>{' '}
              <span className="text-[#9BA3AE] font-normal">
                Evaluating every land coordinate across 1,296 rotation permutations, 250-meter soil profiles, and satellite moisture indices to eliminate crop failure.
              </span>
            </h2>
          </div>

          {/* 3D Perspective Geospatial Visual (Floating Transparent Slab) */}
          <div className="relative w-full aspect-[3362/1870] my-2">
            <Image
              src="/images/indonesia-3d-telemetry.webp"
              alt="3D Perspective Indonesian Archipelago Data Slab"
              fill
              priority
              className="object-contain object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          {/* 4 Quantitative Scale Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pt-6 border-t border-[#242831]">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-mono tracking-tight whitespace-nowrap bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0] bg-clip-text text-transparent">
                1,296
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#C1C7CD] mt-2">
                4-Season Permutations
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-mono tracking-tight whitespace-nowrap bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0] bg-clip-text text-transparent">
                250m
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#C1C7CD] mt-2">
                Soil Physics Resolution
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-mono tracking-tight whitespace-nowrap bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0] bg-clip-text text-transparent">
                +160 kg
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#C1C7CD] mt-2">
                Natural N Fixation / Ha
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-mono tracking-tight whitespace-nowrap bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0] bg-clip-text text-transparent">
                40%-60%
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#C1C7CD] mt-2">
                Water Conservation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The "Scroll-Expand" Fullscreen Morph Section (3 Optimization Pathways) */}
      <ScrollExpandSection />

      {/* 5. Global Agricultural Hotspots */}
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

          {/* Interactive Field Map Showcase: Floating Window on Impressionist Canvas */}
          <div className="relative w-full rounded-[16px] sm:rounded-[24px] overflow-hidden border border-[#282C34] bg-[#0E1217] flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
            {/* Background Image: Satellite Ocean Image (Planet Insights Style) */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/satellite-ocean.jpg"
                alt="Orbital Satellite Ocean Telemetry Canvas"
                fill
                priority
                className="object-cover scale-105"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div className="absolute inset-0 bg-[#070A0F]/20" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070A0F]/20 to-[#070A0F]/60" />
            </div>

            {/* Floating Glassmorphism Window Frame */}
            <div className="relative z-10 w-full max-w-[1080px] p-1.5 sm:p-2.5 bg-white/10 backdrop-blur-md border border-white/40 rounded-[16px] sm:rounded-[22px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col transition-transform duration-300 hover:scale-[1.005]">
              {/* Inner Video Container */}
              <div className="relative w-full rounded-[12px] sm:rounded-[16px] overflow-hidden bg-[#10141A] border border-black/10 shadow-inner aspect-[16/10]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover rounded-[12px] sm:rounded-[16px]"
                >
                  <source src="/videos/demo-field-map.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
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
