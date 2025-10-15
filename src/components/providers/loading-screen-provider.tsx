
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';
import { useAppSettings } from './settings-provider';

const LOADING_DURATION = 5000; // 5 seconds

const LoadingScreenContext = createContext<{
  isLoading: boolean;
}>({
  isLoading: true,
});

export const useLoadingScreen = () => useContext(LoadingScreenContext);

export function LoadingScreenProvider({ children }: { children: ReactNode }) {
  const { showLoadingScreen, isLoading: settingsLoading } = useAppSettings();
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only run animations if the setting is enabled and not just for the first session.
    if (settingsLoading || !showLoadingScreen) {
      setIsAnimationActive(false);
      return;
    }
    
    // Check if this is the first visit in the session
    const isFirstVisit = !sessionStorage.getItem('playgate-session-started');
    if (!isFirstVisit) {
      setIsAnimationActive(false);
      return;
    }

    sessionStorage.setItem('playgate-session-started', 'true');
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsedTime / LOADING_DURATION) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsAnimationActive(false), 500); // Short delay for animation to finish
      }
    }, 50);

    return () => clearInterval(interval);
    
  }, [showLoadingScreen, settingsLoading]);
  
  const isLoading = isAnimationActive && !settingsLoading;

  return (
    <LoadingScreenContext.Provider value={{ isLoading }}>
        <AnimatePresence>
            {isLoading && <LoadingScreen progress={progress} />}
        </AnimatePresence>
        {!isLoading && children}
    </LoadingScreenContext.Provider>
  );
}
