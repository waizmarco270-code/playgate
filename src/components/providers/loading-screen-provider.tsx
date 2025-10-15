
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
    // If settings are still loading, we are definitely in a loading state.
    if (settingsLoading) {
      setIsAnimationActive(true);
      return;
    }

    // Once settings are loaded, determine if we should show the animation.
    const isFirstVisit = !sessionStorage.getItem('playgate-session-started');
    const shouldShowAnimation = isFirstVisit && showLoadingScreen;

    if (!shouldShowAnimation) {
      setIsAnimationActive(false);
      return;
    }

    // If we are showing the animation, mark the session as started.
    sessionStorage.setItem('playgate-session-started', 'true');
    
    // Start the progress timer.
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsedTime / LOADING_DURATION) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        // Add a small delay for the exit animation to complete smoothly.
        setTimeout(() => setIsAnimationActive(false), 500); 
      }
    }, 50);

    return () => clearInterval(interval);
    
  }, [showLoadingScreen, settingsLoading]);
  
  // The app is considered "loading" if the animation is active.
  const isLoading = isAnimationActive;

  return (
    <LoadingScreenContext.Provider value={{ isLoading }}>
        <AnimatePresence>
            {isLoading && <LoadingScreen progress={progress} />}
        </AnimatePresence>
        {/* Only render children when the animation is no longer active */}
        {!isLoading && children}
    </LoadingScreenContext.Provider>
  );
}
