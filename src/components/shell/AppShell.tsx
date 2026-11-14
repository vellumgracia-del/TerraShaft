'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { AlertCircle } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublicRoute = pathname === '/' || pathname === '/landing' || pathname === '/login';
  const isFieldMapPage = pathname === '/field-map';
  const {
    location,
    soilData,
    isLoadingBioData,
    errorBioData,
    fetchBioPhysicalData,
    hydrateCustomCrops,
    isFieldMode
  } = useTerraShaftStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const hasInitializedRef = useRef(false);

  // Initial fetch upon mounting once across any route
  useEffect(() => {
    if (!hasInitializedRef.current && !soilData && !isLoadingBioData) {
      hasInitializedRef.current = true;
      hydrateCustomCrops();
      fetchBioPhysicalData(location.lat, location.lon);
    }
  }, [fetchBioPhysicalData, hydrateCustomCrops, isLoadingBioData, location.lat, location.lon, soilData]);

  // Sync dark mode attribute to document.documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-field-mode', isFieldMode ? 'true' : 'false');
    document.body.setAttribute('data-field-mode', isFieldMode ? 'true' : 'false');
  }, [isFieldMode]);

  if (pathname === '/login') {
    return (
      <div className="min-h-screen antialiased selection:bg-[#007079] selection:text-white">
        {children}
      </div>
    );
  }

  if (isPublicRoute) {
    return (
      <div
        data-field-mode="true"
        className="min-h-screen bg-[#181B20] text-[#F1F3F5] antialiased selection:bg-[#163A40] selection:text-[#00C2CC]"
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-field-mode="true"
      className="min-h-screen bg-[#181B20] text-[#F1F3F5] flex flex-col antialiased selection:bg-[#163A40] selection:text-[#00C2CC]"
    >
      {/* Full-Width Top Bar (Planet Insights Platform Header) */}
      <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        {/* Desktop Fixed Sidebar Rail below TopHeader */}
        <div
          className={`hidden lg:block fixed left-0 top-16 bottom-0 z-30 transition-all duration-150 ${
            isSidebarCollapsed ? 'w-14' : 'w-56'
          }`}
        >
          <Sidebar
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-60 max-w-[85vw] bg-[#16191E] h-full z-10 shadow-2xl flex flex-col">
              <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <div
          className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-150 ${
            isSidebarCollapsed ? 'lg:pl-14' : 'lg:pl-56'
          }`}
        >
          {isFieldMapPage ? (
            <main className="flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#181B20] text-[#F1F3F5] flex flex-col relative p-0 max-w-none">
              {/* Controlled Error Alert Banner as floating toast on map view */}
              {errorBioData && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1050] max-w-lg px-4 py-2.5 bg-[#2D1B1E]/95 backdrop-blur-md border border-[#7F1D1D]/60 rounded-[4px] shadow-2xl flex items-center gap-2.5 text-xs text-[#F87171]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171]" />
                  <span>
                    <strong>Peringatan Validasi/Jaringan:</strong> {errorBioData}
                  </span>
                </div>
              )}

              {children}
            </main>
          ) : (
            <main className="flex-1 p-5 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6 bg-[#181B20] text-[#F1F3F5]">
              {/* Controlled Error Alert Banner */}
              {errorBioData && (
                <div className="p-3 bg-[#2D1B1E] border border-[#7F1D1D]/40 rounded-[4px] flex items-center gap-2.5 text-xs text-[#F87171]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171]" />
                  <span>
                    <strong>Peringatan Validasi/Jaringan:</strong> {errorBioData}
                  </span>
                </div>
              )}

              {children}
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
