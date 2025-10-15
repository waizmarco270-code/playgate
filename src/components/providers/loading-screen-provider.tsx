
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 5000; // 5 seconds

const LoadingScreenContext = createContext<{
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}>({
  isLoading: true,
  setIsLoading: () => {},
});

export const useLoadingScreen = () => useContext(LoadingScreenContext);

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsedTime / LOADING_DURATION) * 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500); // Short delay for animation to finish
        }
      }, 50); // Update progress frequently for smoothness

      return () => clearInterval(interval);
    }
  }, [isLoading]);
  
  return (
    <LoadingScreenContext.Provider value={{ isLoading, setIsLoading }}>
        <AnimatePresence>
            {isLoading && <LoadingScreen progress={progress} />}
        </AnimatePresence>
        {!isLoading && children}
    </LoadingScreenContext.Provider>
  );
}
