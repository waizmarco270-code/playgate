
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const typedEvent = event as BeforeInstallPromptEvent;
      
      // Check if the app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
      }
      
      setInstallPromptEvent(typedEvent);
      // Show prompt only if it hasn't been dismissed recently
      const lastDismissed = localStorage.getItem('pwaInstallDismissed');
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastDismissed || (Date.now() - parseInt(lastDismissed, 10)) > oneDay) {
        // Add a delay to let the user settle in
        setTimeout(() => setIsVisible(true), 5000); 
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        toast({
            title: "Installation Complete!",
            description: "PlayGate has been added to your home screen."
        });
      }
    } catch (error) {
        toast({
            title: "Installation Failed",
            description: "Something went wrong during installation.",
            variant: "destructive"
        });
    } finally {
        setIsVisible(false);
        setInstallPromptEvent(null);
    }
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[60] p-4 flex justify-center"
        >
          <div className="bg-card border shadow-2xl rounded-lg p-4 flex items-center gap-4 max-w-lg w-full">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Install PlayGate</h3>
              <p className="text-sm text-muted-foreground">
                Get the full-screen, offline experience by adding the app to your home screen.
              </p>
            </div>
            <Button size="sm" onClick={handleInstallClick}>
              Install
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
                <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
