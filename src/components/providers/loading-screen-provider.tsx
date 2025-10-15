
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const LOADING_DURATION = 5000; // 5 seconds
const SESSION_KEY = 'playgate-session-started';
const OLD_LOCALSTORAGE_KEY = 'playgate-show-animation'; // The old key we need to remove

const LoadingScreenContext = createContext<{ isLoading: boolean }>({
  isLoading: true,
});

export const useLoadingScreen = () => useContext(LoadingScreenContext);

export function LoadingScreenProvider({ children }: { children: ReactNode }) {
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // --- Cleanup: Remove the old, unused localStorage key ---
    // This is the crucial fix. It cleans up the old setting that was causing the issue.
    localStorage.removeItem(OLD_LOCALSTORAGE_KEY);
    // ---------------------------------------------------------

    if (sessionStorage.getItem(SESSION_KEY)) {
      // If it's not the first visit of the session, end animation immediately.
      setIsAnimationActive(false);
      return;
    }
    
    // It is the first visit, so mark the session as started.
    sessionStorage.setItem(SESSION_KEY, 'true');

    // Start progress bar interval for the animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsedTime / LOADING_DURATION) * 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    // Set a timeout to end the animation after the full duration
    const animationTimeout = setTimeout(() => {
      setIsAnimationActive(false);
    }, LOADING_DURATION);

    // Cleanup function to clear intervals and timeouts if the component unmounts
    return () => {
      clearInterval(interval);
      clearTimeout(animationTimeout);
    };
  }, []);

  return (
    <LoadingScreenContext.Provider value={{ isLoading: isAnimationActive }}>
      <AnimatePresence>
        {isAnimationActive && <LoadingScreen progress={progress} />}
      </AnimatePresence>
      
      {/* Only render children if the animation is NOT active */}
      {!isAnimationActive && children}
    </LoadingScreenContext.Provider>
  );
}
