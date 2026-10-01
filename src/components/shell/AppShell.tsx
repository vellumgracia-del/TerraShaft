'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';

interface AppShellProps {
  children: React.ReactNode;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenCropLibrary: () => void;
  onOpenExportModal: () => void;
  isCropLibraryOpen?: boolean;
  isExportModalOpen?: boolean;
}

export default function AppShell({
  children,
  activeSection,
  onNavigate,
  onOpenCropLibrary,
  onOpenExportModal,
  isCropLibraryOpen = false,
  isExportModalOpen = false
}: AppShellProps) {
  const { isFieldMode } = useTerraShaftStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavigate = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <div
      data-field-mode={isFieldMode ? 'true' : 'false'}
      className="min-h-screen bg-[#F5F7F4] text-[#17231F] flex flex-col antialiased selection:bg-[#E7F5EE] selection:text-[#12A875]"
    >
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Fixed Sidebar Rail (z-40) */}
        <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40 bg-white border-r border-[#E4EAE6]">
          <Sidebar
            activeSection={activeSection}
            onNavigate={onNavigate}
            onOpenCropLibrary={onOpenCropLibrary}
            onOpenExportModal={onOpenExportModal}
            isCropLibraryOpen={isCropLibraryOpen}
            isExportModalOpen={isExportModalOpen}
          />
        </aside>

        {/* Mobile Drawer Overlay (z-50) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full z-10 shadow-2xl flex flex-col">
              <Sidebar
                activeSection={activeSection}
                onNavigate={handleMobileNavigate}
                onOpenCropLibrary={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCropLibrary();
                }}
                onOpenExportModal={() => {
                  setIsMobileMenuOpen(false);
                  onOpenExportModal();
                }}
                isCropLibraryOpen={isCropLibraryOpen}
                isExportModalOpen={isExportModalOpen}
              />
            </div>
          </div>
        )}

        {/* Main Content Area (Offset by sidebar width on desktop, relative z-10) */}
        <div className="lg:pl-64 flex-1 flex flex-col min-w-0 relative z-10">
          <TopHeader
            onOpenCropLibrary={onOpenCropLibrary}
            onOpenExportModal={onOpenExportModal}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
