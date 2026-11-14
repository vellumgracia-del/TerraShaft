'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PlanetFooter from '@/components/landing/PlanetFooter';
import {
  ArrowRight,
  Satellite,
  Layers,
  BatteryCharging,
  Bot,
  Sparkles,
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
  const globalHotspots = [
    {
      name: 'Kupang Timur',
      country: 'Indonesia',
      climate: 'Semi-Arid Dryland',
      soil: 'Vertisol Clay 48%',
      crop: 'Jagung · Kedelai · Sorgum'
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
    <div className="min-h-screen bg-[#121417] text-[#F1F3F5] flex flex-col font-sans selection:bg-[#163A40] selection:text-[#00C2CC]">
      {/* 1. Top Marketing Header (Planet.com style) */}
      <header className="h-16 lg:h-20 border-b border-[#242831] px-4 lg:px-10 flex items-center justify-between sticky top-0 z-50 bg-[#121417]/90 backdrop-blur-md">
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
            <a href="#capabilities" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#pathways" className="hover:text-white transition-colors">
              4-Season Pathways
            </a>
            <a href="#science" className="hover:text-white transition-colors">
              Science & Data
            </a>
            <a href="#hotspots" className="hover:text-white transition-colors">
              Global Hotspots
            </a>
            <Link href="/field-advisor" className="hover:text-[#00C2CC] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2CC]" />
              <span>Field Advisor AI</span>
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
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-[4px] bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] text-xs sm:text-[13px] font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-4 lg:px-10 pt-16 lg:pt-24 pb-20 overflow-hidden border-b border-[#242831]">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00C2CC]/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1F26] border border-[#2E3540] text-[11px] font-mono tracking-wider text-[#00C2CC] uppercase mb-6">
            <Satellite className="w-3.5 h-3.5" />
            <span>Planetary Agriculture & NASA Orbital Telemetry</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F1F3F5] max-w-4xl leading-[1.15]">
            See Earth from Space. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2CC] via-[#52D8E8] to-[#93E6F0]">
              Regenerate Soil on the Ground.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[#9BA3AE] max-w-2xl leading-relaxed">
            TerraShaft translates NASA satellite observations (SMAP, GPM, CERES) and ISRIC global soil physics into closed-loop 4-season adaptive crop rotation strategies to prevent crop failure, recharge depleted soil batteries, and stabilize dryland farming economies.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/overview"
              className="px-6 py-3 rounded-[4px] bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#00C2CC]/20"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/field-map"
              className="px-6 py-3 rounded-[4px] bg-[#1A1F26] hover:bg-[#232933] border border-[#2E3540] text-sm font-medium text-[#F1F3F5] transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#00C2CC]" />
              <span>Explore GIS Field Map</span>
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-[4px] hover:bg-[#1A1F26] text-sm font-medium text-[#C1C7CD] hover:text-white transition-colors"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Hero Telemetry Card / HUD Mockup */}
          <div className="mt-14 w-full max-w-5xl bg-[#16191E] border border-[#282C34] rounded-[8px] overflow-hidden shadow-2xl relative text-left">
            {/* Top Toolbar */}
            <div className="px-4 py-2.5 bg-[#1C2026] border-b border-[#282C34] flex items-center justify-between text-xs text-[#9BA3AE]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C2CC] animate-pulse" />
                <span className="font-mono text-[#F1F3F5]">LIVE SATELLITE TELEMETRY FEED</span>
                <span className="text-[#6C757D]">·</span>
                <span>Kupang Timur AOI (-10.1542°, 123.8210°)</span>
              </div>
              <div className="font-mono text-[11px] text-[#00C2CC]">
                1,296 Permutations Evaluated
              </div>
            </div>

            {/* Visual Raster Area + Telemetry Overlays */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url('/images/satellite-ocean.jpg')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#16191E] via-transparent to-black/30 pointer-events-none" />

              {/* Floating Telemetry Glass Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 max-w-xs">
                <div className="px-3 py-2 rounded-[4px] bg-[#121417]/85 backdrop-blur-md border border-white/10 text-xs">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#00C2CC]">NASA SMAP L4</div>
                  <div className="font-semibold text-white mt-0.5">Root-Zone Wetness: 0.38</div>
                  <div className="text-[11px] text-[#A6AFB8]">Kondisi air tanah perakaran aman</div>
                </div>

                <div className="px-3 py-2 rounded-[4px] bg-[#121417]/85 backdrop-blur-md border border-white/10 text-xs">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#34D399]">SoilGrids v2.0</div>
                  <div className="font-semibold text-white mt-0.5">Vertisol Clay 48% · pH 6.8</div>
                  <div className="text-[11px] text-[#A6AFB8]">AWC 125 mm · SOC 1.4%</div>
                </div>
              </div>

              {/* Bottom Recommended Sequence Strip */}
              <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-[6px] bg-[#121417]/90 backdrop-blur-md border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10.5px] uppercase font-mono text-[#00C2CC] font-semibold">
                    Optimal Pathway A · 4-Season Sequence
                  </div>
                  <div className="font-medium text-[#F1F3F5] mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#20252D] border border-[#2E3540]">M1: Jagung Hibrida</span>
                    <span className="text-[#6C757D]">→</span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#164E55]">M2: Kedelai Anjasmoro</span>
                    <span className="text-[#6C757D]">→</span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#20252D] border border-[#2E3540]">M3: Kacang Hijau Vima</span>
                    <span className="text-[#6C757D]">→</span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#1E3A2F] text-[#34D399] border border-[#166534]">M4: Orok-orok Cover</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-[#8A949E]">Baterai Tanah</div>
                    <div className="text-sm font-bold text-[#34D399]">Recharge +25%</div>
                  </div>
                  <Link
                    href="/overview"
                    className="px-3 py-1.5 rounded-[4px] bg-[#00C2CC] hover:bg-[#33D4DC] text-[#121417] text-xs font-semibold transition-colors"
                  >
                    Simulasikan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Impact & Physical Metrics Bar */}
      <section className="py-10 bg-[#16191E] border-b border-[#242831] px-4 lg:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center lg:text-left">
          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">1.296</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Kombinasi 4 Musim
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Evaluasi permutasi lengkap untuk setiap koordinat lahan
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">250m</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Resolusi Fisika Tanah
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              ISRIC SoilGrids v2.0 lapisan olah perakaran 0-30 cm
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#34D399]">+160 kg</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Fiksasi N Alami / Ha
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Injeksi hara bintil akar legum menghemat pupuk kimia
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl lg:text-4xl font-bold font-mono text-[#00C2CC]">40% - 60%</span>
            <span className="text-xs uppercase font-medium tracking-wider text-[#F1F3F5] mt-1">
              Penghematan Air
            </span>
            <span className="text-xs text-[#8A949E] mt-0.5">
              Efisiensi neraca air terukur dibanding monokultur sereal
            </span>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities (4-Pillar Grid) */}
      <section id="capabilities" className="py-20 px-4 lg:px-10 border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
              KEMAMPUAN PLATFORM
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F1F3F5]">
              Arsitektur Telemetri Berstandar Antariksa
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA3AE] mt-3 leading-relaxed">
              Menghubungkan sensor satelit antariksa, model pedotransfer tanah internasional, dan kecerdasan buatan berbasis SOP ilmiah.
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
                  Asimilasi langsung satelit SMAP L4 (air tanah perakaran), GPM IMERG (curah hujan harian), CERES (radiasi surya), dan MERRA-2.
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
                  Model tekstur pasir-debu-lempung, Karbon Organik (SOC), pH H2O, KTK, dan kerapatan bulk density dari Wageningen University.
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
                  Konsep Baterai Tanah intuitif: Monokultur menguras baterai (-20%/musim), tanaman legum dan penutup tanah mengisi ulang baterai (+15%).
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
                  Konsultasi agronomi cerdas berbasis telemetri lahan riil dan 11 dokumen acuan terverifikasi dari BRIN, Balittanah, dan standar FAO-56.
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
      <section id="pathways" className="py-20 px-4 lg:px-10 bg-[#16191E] border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
              3 SKENARIO OPTIMASI
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
              Pilih Strategi Berdasarkan Prioritas Petani
            </h2>
            <p className="text-xs sm:text-sm text-[#9BA3AE] mt-2">
              Mesin menghitung trade-off seimbang antara profit tunai, kelestarian baterai tanah, dan ketahanan terhadap kemarau El Nino.
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
                  Fokus memulihkan tanah tandus dan memecah lapisan padas olah melalui tanaman berakar dalam (Orok-orok) dan legum pengikat nitrogen tinggi.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Baterai tanah terisi penuh (+25% s.d. +35%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Injeksi biomasa dan pemecah lapisan padas</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Lihat Simulasi Pathway A</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pathway B */}
            <div className="p-6 rounded-[6px] bg-[#121417] border border-[#00C2CC]/40 flex flex-col justify-between relative shadow-lg">
              <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-[#163A40] text-[#00C2CC] border border-[#164E55]">
                REKOMENDASI IKLIM KERING
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-[#00C2CC] uppercase tracking-wider">
                  Pathway B
                </div>
                <h3 className="text-lg font-semibold text-[#F1F3F5] mt-1">
                  Drought Resilience
                </h3>
                <p className="text-xs text-[#9BA3AE] mt-2 leading-relaxed">
                  Siaga menghadapi musim kemarau panjang. Memblokir komoditas rakus air pada puncak kemarau dan mengutamakan sorgum serta palawija genjah.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Zero risiko puso kekeringan (Wdeficit aman)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Penghematan air hingga 60% dibanding monokultur</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Lihat Simulasi Pathway B</span>
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
                  Memaksimalkan pendapatan tunai petani per musim namun tetap membatasi defisit air dalam batas toleransi agar tidak gagal panen.
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-xs text-[#C1C7CD]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Indeks profit ekonomi tertinggi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Rotasi komoditas bernilai pasar tinggi</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rotation-planner"
                className="mt-6 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-medium flex items-center gap-1"
              >
                <span>Lihat Simulasi Pathway C</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Global Agricultural Hotspots */}
      <section id="hotspots" className="py-20 px-4 lg:px-10 border-b border-[#242831]">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#00C2CC] mb-2">
                CAKUPAN GLOBAL
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F3F5]">
                Dapat Digunakan di Mana Saja di Muka Bumi
              </h2>
              <p className="text-xs sm:text-sm text-[#9BA3AE] mt-2">
                Sensor satelit NASA dan ISRIC mencakup seluruh koordinat daratan dunia (-90° s.d. +90° Lat).
              </p>
            </div>

            <Link
              href="/field-map"
              className="inline-flex items-center gap-1.5 text-xs text-[#00C2CC] hover:text-[#33D4DC] font-semibold"
            >
              <span>Buka Peta Satelit Global</span>
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
                      <span className="text-[#6C757D]">Iklim:</span> {h.climate}
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Tanah:</span> {h.soil}
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Rotasi:</span> {h.crop}
                    </div>
                  </div>
                </div>
                <Link
                  href="/field-map"
                  className="mt-4 pt-3 border-t border-[#242831] text-[11px] text-[#00C2CC] hover:underline flex items-center justify-between"
                >
                  <span>Eksplorasi AOI</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Planet.com Style Footer & Pre-Footer CTA */}
      <PlanetFooter />
    </div>
  );
}
