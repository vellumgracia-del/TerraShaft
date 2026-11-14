'use client';

import React from 'react';
import Link from 'next/link';

export default function PlanetFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#070A0F] text-[#8E9BAE] overflow-hidden font-sans border-t border-[#18202F]">
      {/* Background Orbital Wireframe & Globe Vector */}
      <div className="absolute right-0 bottom-0 pointer-events-none select-none w-full max-w-[900px] h-full overflow-hidden opacity-30 md:opacity-40">
        <svg
          viewBox="0 0 900 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-[-120px] bottom-[-100px] w-[950px] h-[750px]"
        >
          {/* Orbital curved paths */}
          <ellipse
            cx="580"
            cy="480"
            rx="360"
            ry="240"
            transform="rotate(-28 580 480)"
            stroke="#00C2CC"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            className="opacity-70"
          />
          <ellipse
            cx="580"
            cy="480"
            rx="460"
            ry="310"
            transform="rotate(-28 580 480)"
            stroke="#00C2CC"
            strokeWidth="0.8"
            className="opacity-40"
          />
          <ellipse
            cx="580"
            cy="480"
            rx="560"
            ry="380"
            transform="rotate(-28 580 480)"
            stroke="#00C2CC"
            strokeWidth="0.6"
            className="opacity-25"
          />

          {/* Meridian and Latitude Arcs */}
          <path
            d="M 220 540 C 340 380, 560 300, 840 260"
            stroke="#00C2CC"
            strokeWidth="1"
            className="opacity-50"
          />
          <path
            d="M 160 620 C 300 480, 580 400, 880 370"
            stroke="#00C2CC"
            strokeWidth="1"
            className="opacity-40"
          />
          <path
            d="M 120 700 C 320 580, 620 510, 920 480"
            stroke="#00C2CC"
            strokeWidth="0.8"
            className="opacity-30"
          />

          <path
            d="M 440 200 C 500 360, 560 520, 620 720"
            stroke="#00C2CC"
            strokeWidth="0.8"
            strokeDasharray="2 6"
            className="opacity-40"
          />
          <path
            d="M 640 160 C 690 320, 730 500, 780 700"
            stroke="#00C2CC"
            strokeWidth="0.8"
            strokeDasharray="2 6"
            className="opacity-30"
          />

          {/* Active Satellites / Nodes */}
          <circle cx="410" cy="330" r="3.5" fill="#00C2CC" />
          <circle cx="410" cy="330" r="8" stroke="#00C2CC" strokeWidth="1" className="opacity-50" />

          <circle cx="720" cy="580" r="3.5" fill="#00C2CC" />
          <circle cx="720" cy="580" r="8" stroke="#00C2CC" strokeWidth="1" className="opacity-50" />

          <circle cx="780" cy="370" r="2.5" fill="#38BDF8" />
          <circle cx="310" cy="530" r="2.5" fill="#38BDF8" />
        </svg>
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 pb-12 z-10">
        {/* 1. Pre-Footer Floating CTA Card (See. Decide. Act.) */}
        <div className="mb-20 rounded-xl bg-[#101622]/90 border border-[#1E2738] p-8 sm:p-12 md:p-14 text-center shadow-2xl backdrop-blur-sm max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-white tracking-tight">
            See. Decide. Act.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#9AA5B5] max-w-2xl mx-auto leading-relaxed">
            TerraShaft Insights Platform adalah pusat komputasi biofisik di mana data observasi bumi harian,
            analitik baterai tanah, dan rekomendasi rotasi adaptif berpadu menjaga ketahanan pangan.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/overview"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-[4px] bg-[#008A93] hover:bg-[#00A1AB] text-white text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* 2. Main 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 text-[12.5px] leading-relaxed">
          {/* Column 1: PRODUCTS & SOLUTIONS */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Products
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    TerraShaft Monitoring
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Orbital Field Tasking
                  </Link>
                </li>
                <li>
                  <Link href="/soil-battery" className="hover:text-white transition-colors">
                    Soil Battery Predictor
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    SuperRes Vegetation Index
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Realtime Agro-Climate Feeds
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Planetary Soil Variables
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Cloud-Free Crop Mosaics
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    TerraShaft Insights Platform
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Pricing & Extension Access
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Solutions
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Dryland & Semi-Arid Management
                  </Link>
                </li>
                <li>
                  <Link href="/soil-battery" className="hover:text-white transition-colors">
                    Vertisol Drought Defense
                  </Link>
                </li>
                <li>
                  <Link href="/rotation-planner" className="hover:text-white transition-colors">
                    4-Season Crop Pathways
                  </Link>
                </li>
                <li>
                  <Link href="/action-sheet" className="hover:text-white transition-colors">
                    Smallholder Food Resilience
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 2: INDUSTRIES & INVESTORS */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Industries
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Agriculture & Cropping
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Soil Science & Agronomy
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Bioenergy & Agro-Infrastructure
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Forestry & Land Use
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Parametric Crop Insurance
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Precision Cadastre Mapping
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Soil Carbon & Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/water-balance" className="hover:text-white transition-colors">
                    Water Basin & Watersheds
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Dinas Pertanian Daerah
                  </Link>
                </li>
                <li>
                  <Link href="/action-sheet" className="hover:text-white transition-colors">
                    Balai Penyuluhan Pertanian (BPP)
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Badan Pangan Nasional (Bapanas)
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Food Security Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Disaster Early Warning
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Investors
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    ESG & Impact Reports
                  </Link>
                </li>
                <li>
                  <Link href="/soil-battery" className="hover:text-white transition-colors">
                    Soil Carbon Sequestration
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: PARTNERS & COMPANY */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Partners
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    TerraShaft Orbit Network
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    BRIN & Balittanah Consortium
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    PPL Extension Network
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Open API & Agronomy SDK
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Company
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    About TerraShaft
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Farmer & Field Stories
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Agronomy & Geospatial Team
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Careers & Fellowships
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Press & Announcements
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Scientific Resources
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Impact at TerraShaft
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Contact Extension Advisory
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Earth Art & Imagery
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Platform FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Kupang & Jakarta Hubs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: SUPPORT & QUICK LINKS */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Support
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Farmer & PPL Community
                  </Link>
                </li>
                <li>
                  <Link href="/crop-library" className="hover:text-white transition-colors">
                    TerraShaft Academy
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Scientific Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/action-sheet" className="hover:text-white transition-colors">
                    Help Center & Field Guides
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    Publications Database (FAO/BRIN)
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-[13px] tracking-wider mb-3.5 uppercase">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Contact Field Team
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Field Officer Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    System Telemetry Status
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-white transition-colors">
                    Agronomy Blog & Field Insights
                  </Link>
                </li>
                <li>
                  <Link href="/field-map" className="hover:text-white transition-colors">
                    Satellite Imagery Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/water-balance" className="hover:text-white transition-colors">
                    Drought Early Warning
                  </Link>
                </li>
                <li>
                  <Link href="/data-sources" className="hover:text-white transition-colors">
                    FAO 56 & SoilGrids Standards
                  </Link>
                </li>
                <li>
                  <Link href="/rotation-planner" className="hover:text-white transition-colors">
                    4-Season Rotation Planner
                  </Link>
                </li>
                <li>
                  <Link href="/field-advisor" className="hover:text-white transition-colors">
                    Field Advisor AI
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Social Bar */}
        <div className="mt-20 pt-8 border-t border-[#1C2534] flex flex-col md:flex-row items-center justify-between gap-6 text-[12px] text-[#7E8B9E]">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1.5 leading-normal">
            <span>© {currentYear} TerraShaft Systems. All rights reserved.</span>
            <span>|</span>
            <Link href="/settings" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/settings" className="hover:text-white transition-colors">
              Ketentuan Layanan
            </Link>
            <span>|</span>
            <Link href="/data-sources" className="hover:text-white transition-colors">
              Data Provenance & Audit
            </Link>
            <span>|</span>
            <Link href="/settings" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <span>Pilihan Privasi</span>
              {/* Privacy / Opt-Out Icon */}
              <svg className="w-6 h-3 inline-block" viewBox="0 0 30 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="29" height="13" rx="6.5" stroke="#00C2CC" fill="#0E232E" />
                <path d="M7 7L9 9L13 5" stroke="#00C2CC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 5L23 9M23 5L19 9" stroke="#7E8B9E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span>|</span>
            <Link href="/settings" className="hover:text-white transition-colors">
              Cookie Notice
            </Link>
            <span>|</span>
            <Link href="/data-sources" className="hover:text-white transition-colors">
              Sitasi Ilmiah (BRIN / FAO)
            </Link>
            <span>|</span>
            <Link href="/overview" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5 text-[#8E9BAE]">
            {/* X (formerly Twitter) */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* Medium */}
            <a
              href="https://medium.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Medium"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
