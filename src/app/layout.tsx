
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { LoadingScreenProvider } from '@/components/providers/loading-screen-provider';

export const metadata: Metadata = {
  title: 'PlayGate - Your Offline Video Universe',
  description: 'A professional, modern PWA video player that allows users to import, organize, and play locally stored videos completely offline.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Orbitron:wght@700&family=Audiowide&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider>
          <LoadingScreenProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AppSidebar />
                <SidebarInset>{children}</SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
          </LoadingScreenProvider>
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
      </body>
    </html>
  );
}
