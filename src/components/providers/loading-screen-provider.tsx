
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
    // Determine if this is the first visit of the session.
    const isFirstVisit = !sessionStorage.getItem('playgate-session-started');

    // If settings are still loading, don't do anything yet.
    if (settingsLoading) {
      setIsAnimationActive(true); // Default to active while loading settings
      return;
    }

    // Conditions to show the animation:
    // 1. It's the first visit of the session.
    // 2. The user has the setting enabled.
    const shouldShowAnimation = isFirstVisit && showLoadingScreen;

    if (!shouldShowAnimation) {
      setIsAnimationActive(false);
      return;
    }

    // If we're showing the animation, mark the session as started.
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
  
  // The actual loading state for the rest of the app.
  // We consider it "loading" if the animation is active AND settings are done loading.
  const isLoading = isAnimationActive && !settingsLoading;


  return (
    <LoadingScreenContext.Provider value={{ isLoading }}>
        <AnimatePresence>
            {isLoading && <LoadingScreen progress={progress} />}
        </AnimatePresence>
        {/* Render children immediately if settings are still loading or if animation is not active */}
        {(settingsLoading || !isLoading) && children}
    </LoadingScreenContext.Provider>
  );
}
