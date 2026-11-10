'use client';

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { AlertCircle } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const {
    location,
    soilData,
    isLoadingBioData,
    errorBioData,
    fetchBioPhysicalData,
    isFieldMode
  } = useTerraShaftStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hasInitializedRef = useRef(false);

  // Initial fetch upon mounting once across any route
  useEffect(() => {
    if (!hasInitializedRef.current && !soilData && !isLoadingBioData) {
      hasInitializedRef.current = true;
      fetchBioPhysicalData(location.lat, location.lon);
    }
  }, [fetchBioPhysicalData, isLoadingBioData, location.lat, location.lon, soilData]);

  // Sync dark mode attribute to document.documentElement so full viewport/body respects dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-field-mode', isFieldMode ? 'true' : 'false');
    document.body.setAttribute('data-field-mode', isFieldMode ? 'true' : 'false');
  }, [isFieldMode]);

  return (
    <div
      data-field-mode={isFieldMode ? 'true' : 'false'}
      className="min-h-screen bg-[#F5F7F4] text-[#17231F] flex flex-col antialiased selection:bg-[#E7F5EE] selection:text-[#12A875]"
    >
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar Rail (z-40) */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40 bg-white border-r border-[#E4EAE6]">
          <Sidebar />
        </aside>

        {/* Mobile Drawer Overlay (z-50) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full z-10 shadow-2xl flex flex-col">
              <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area (Offset by sidebar width on desktop, relative z-10) */}
        <div className="lg:pl-64 flex-1 flex flex-col min-w-0 relative z-10">
          <TopHeader onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
            {/* Controlled Error Alert Banner */}
            {errorBioData && (
              <div className="p-3.5 bg-[#FDEAEA] border border-[#FECDD3] rounded-2xl flex items-center gap-2.5 text-xs text-[#E11D48] animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D48]" />
                <span>
                  <strong>Peringatan Validasi/Jaringan:</strong> {errorBioData}
                </span>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
