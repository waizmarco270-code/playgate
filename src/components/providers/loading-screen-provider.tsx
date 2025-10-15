
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 5000; // 5 seconds

const LoadingScreenContext = createContext<{
  isLoading: boolean;
}>({
  isLoading: true,
});

export const useLoadingScreen = () => useContext(LoadingScreenContext);

export function LoadingScreenProvider({ children }: { children: ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect runs only once on mount.
    if (sessionStorage.getItem('playgate-session-started')) {
      setIsFirstVisit(false);
      setIsAnimationComplete(true);
    } else {
      setIsFirstVisit(true);
      sessionStorage.setItem('playgate-session-started', 'true');
      
      // Start progress bar interval
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsedTime / LOADING_DURATION) * 100);
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 50);

      // Set a timeout to end the animation
      const animationTimeout = setTimeout(() => {
        setIsAnimationComplete(true);
      }, LOADING_DURATION);

      return () => {
        clearInterval(interval);
        clearTimeout(animationTimeout);
      };
    }
  }, []);

  const shouldShowAnimation = isFirstVisit && !isAnimationComplete;

  return (
    <LoadingScreenContext.Provider value={{ isLoading: shouldShowAnimation }}>
      <AnimatePresence>
        {shouldShowAnimation && <LoadingScreen progress={progress} />}
      </AnimatePresence>
      
      {/* Only render children if the session is not the first visit OR the animation is complete */}
      {!shouldShowAnimation && children}
    </LoadingScreenContext.Provider>
  );
}
