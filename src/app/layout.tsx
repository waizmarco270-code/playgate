
'use client';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import BottomNav from '@/components/layout/bottom-nav';
import { VaultProvider } from '@/components/providers/vault-provider';
import { LoadingScreenProvider } from '@/components/providers/loading-screen-provider';
import { PrivacyPopup } from '@/components/privacy-popup';
import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAInstallProvider } from '@/components/providers/pwa-install-provider';

const metadata: Metadata = {
  title: 'PlayGate - Your Offline Video Universe',
  description: 'A professional, modern PWA video player that allows users to import, organize, and play locally stored videos completely offline.',
  manifest: '/manifest.json',
};

const viewport: Viewport = {
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  useEffect(() => {
    const privacyPopupSeen = localStorage.getItem('privacyPopupSeen');
    if (!privacyPopupSeen) {
      // Show the popup after the initial loading screen is done
      setTimeout(() => {
        setShowPrivacyPopup(true);
      }, 4500); // A little after loading screen finishes
    }
  }, []);

  const handlePrivacyPopupClose = () => {
    localStorage.setItem('privacyPopupSeen', 'true');
    setShowPrivacyPopup(false);
  };


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Orbitron:wght@700&family=Audiowide&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="icon" href="/logo.jpg" sizes="any" />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PWAInstallProvider>
            <LoadingScreenProvider>
              <VaultProvider>
                <SidebarProvider>
                  <PwaInstallPrompt />
                  <div className="flex min-h-screen">
                    <AppSidebar />
                    <SidebarInset>
                      <div className="md:pb-0 pb-20 h-full">{children}</div>
                    </SidebarInset>
                  </div>
                  <BottomNav />
                </SidebarProvider>
              </VaultProvider>
            </LoadingScreenProvider>
            <Toaster />
            <PrivacyPopup isOpen={showPrivacyPopup} onClose={handlePrivacyPopupClose} />
          </PWAInstallProvider>
        </ThemeProvider>
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                  console.log('SW registered: ', registration);
                }).catch(registrationError => {
                  console.log('SW registration failed: ', registrationError);
                });
              });
            }
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
