
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Stash the event so it can be triggered later.
      setInstallPrompt(event as BeforeInstallPromptEvent);

      // Check if the app is already installed. If so, don't show the prompt.
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      const hasSeenPrompt = sessionStorage.getItem('pwaInstallPromptDismissed');

      if (!isStandalone && !hasSeenPrompt) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      // Hide the prompt if the app is installed
      setIsVisible(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the install prompt
    await installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We can only use the prompt once, so clear it.
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwaInstallPromptDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] p-2"
        >
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between gap-4 rounded-lg bg-background p-3 shadow-2xl ring-1 ring-border">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.jpg" alt="PlayGate Logo" width={40} height={40} className="rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                        <h3 className="font-semibold text-sm">Install PlayGate for the Best Experience</h3>
                        <p className="text-xs text-muted-foreground">Access your videos offline with native performance.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" onClick={handleInstallClick}>
                        <Download className="mr-2 h-4 w-4" />
                        Install
                        </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleDismiss}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
