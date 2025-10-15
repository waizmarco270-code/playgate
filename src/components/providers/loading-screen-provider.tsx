
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
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This check must run only once on the client
    const firstVisit = !sessionStorage.getItem('playgate-session-started');
    setIsFirstVisit(firstVisit);

    if (!firstVisit) {
      setIsAnimationComplete(true);
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
      }
    }, 50);

    // Set a timeout to mark the animation as complete after the full duration
    const animationTimeout = setTimeout(() => {
        setIsAnimationComplete(true);
    }, LOADING_DURATION + 500); // Add a small buffer

    return () => {
        clearInterval(interval);
        clearTimeout(animationTimeout);
    };
    
  }, []);
  
  const showAnimation = isFirstVisit && !isAnimationComplete;

  return (
    <LoadingScreenContext.Provider value={{ isLoading: showAnimation }}>
        <AnimatePresence>
            {showAnimation && <LoadingScreen progress={progress} />}
        </AnimatePresence>
        {isAnimationComplete && children}
    </LoadingScreenContext.Provider>
  );
}
