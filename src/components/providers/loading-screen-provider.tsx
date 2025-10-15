
'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 4000; // 4 seconds

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a timer to end the animation and show the app
    const timer = setTimeout(() => {
      setIsLoading(false); // Trigger the exit animation
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {!isLoading && children}
    </>
  );
}
