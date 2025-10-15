
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
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | undefined>(undefined);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect runs only once on mount to determine if we should show the animation.
    const firstVisitSession = !sessionStorage.getItem('playgate-session-started');
    setIsFirstVisit(firstVisitSession);

    if (firstVisitSession) {
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
        setIsAnimationActive(false);
      }, LOADING_DURATION);

      return () => {
        clearInterval(interval);
        clearTimeout(animationTimeout);
      };
    } else {
      // If it's not the first visit, end the animation immediately.
      setIsAnimationActive(false);
    }
  }, []);

  const shouldShowAnimation = isFirstVisit === true && isAnimationActive;

  return (
    <LoadingScreenContext.Provider value={{ isLoading: shouldShowAnimation }}>
      <AnimatePresence>
        {shouldShowAnimation && <LoadingScreen progress={progress} />}
      </AnimatePresence>
      
      {/* Only render children if the session has started and animation is complete */}
      {!shouldShowAnimation && isFirstVisit !== undefined && children}
    </LoadingScreenContext.Provider>
  );
}
