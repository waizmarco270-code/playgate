
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ShieldCheck, Database, KeyRound, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PrivacyPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPopup({ isOpen, onClose }: PrivacyPopupProps) {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      setCountdown(5);
      const timer = setTimeout(() => {
        setCanClose(true);
      }, 5000);
      
      const interval = setInterval(() => {
          setCountdown(prev => (prev > 1 ? prev -1 : 1));
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg m-4"
        >
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg" onInteractOutside={(e) => {
              if (!canClose) e.preventDefault();
            }}>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl font-bold">Your Privacy Comes First</DialogTitle>
                <DialogDescription className="text-center">
                  Welcome to PlayGate! Here’s a quick overview of how your data is handled.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 my-6">
                <div className="flex items-start gap-4">
                  <Database className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">100% Local Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      All your files and data are stored securely on your device. Nothing is ever sent to a server.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <KeyRound className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Secure Vault</h3>
                    <p className="text-sm text-muted-foreground">
                      The Vault password encrypts your private videos. This password is **not recoverable**, so please store it safely.
                    </p>
                  </div>
                </div>
              </div>
               <div className="flex justify-end">
                <Button onClick={onClose} disabled={!canClose}>
                  I Understand {canClose ? '' : `(${countdown})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: canClose ? 1 : 0, scale: canClose ? 1 : 0.5 }}
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-background text-foreground shadow-lg flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
}
