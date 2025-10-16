
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

const metadata: Metadata = {
  title: 'PlayGate - Your Offline Video Universe',
  description: 'A professional, modern PWA video player that allows users to import, organize, and play locally stored videos completely offline.',
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

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.log('Service Worker registration failed:', error));
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo-192.png"></link>
        <meta name="theme-color" content="#121212" />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
