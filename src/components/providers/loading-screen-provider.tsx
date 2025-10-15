
'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 5000; // 5 seconds

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // Set a timer to end the animation and show the app
    const timer = setTimeout(() => {
      setIsLoading(false); // Trigger the exit animation
      // A small delay before showing the app for smoother transition
      setTimeout(() => setShowApp(true), 500); 
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {showApp && children}
    </>
  );
}
