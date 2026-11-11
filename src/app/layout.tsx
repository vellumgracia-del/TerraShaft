import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import AppShell from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "TerraShaft: Modern Farm Intelligence & Climate-Resilient Crop Rotation",
  description:
    "Workspace cerdas eksplorasi pola rotasi tanaman 4 musim adaptif iklim berbasis biofisik satelit NASA POWER dan profil tanah ISRIC SoilGrids v2.0.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/terrashaft-icon.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/terrashaft-icon.png"
  },
  keywords: [
    "TerraShaft",
    "TerraRotate",
    "Crop Rotation",
    "Soil Battery",
    "NASA POWER",
    "SMAP",
    "SoilGrids",
    "Agronomy",
    "Farm Intelligence"
  ]
};

export const viewport: Viewport = {
  themeColor: "#121417",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased dark" style={{ backgroundColor: '#181B20', color: '#F1F3F5' }} data-field-mode="true">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col bg-[#181B20] text-[#F1F3F5] selection:bg-[#163A40] selection:text-[#00C2CC]" data-field-mode="true">
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
