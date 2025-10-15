
'use client';

import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePwaInstall } from './providers/pwa-install-provider';


export function PwaInstallPrompt() {
  const { isVisible, install, dismiss } = usePwaInstall();

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
                        <Button size="sm" onClick={install}>
                        <Download className="mr-2 h-4 w-4" />
                        Install
                        </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={dismiss}>
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
