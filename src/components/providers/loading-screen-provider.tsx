
'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'playgate-session-loaded';
const LOADING_DURATION = 10000; // 10 seconds

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client
    const sessionLoaded = sessionStorage.getItem(SESSION_KEY);
    
    if (!sessionLoaded) {
      // It's the first visit of the session
      setIsFirstVisit(true);
      setIsAnimationActive(true);
      sessionStorage.setItem(SESSION_KEY, 'true');

      // Set a timer to end the animation
      const timer = setTimeout(() => {
        setIsAnimationActive(false);
      }, LOADING_DURATION);

      return () => clearTimeout(timer);
    }
  }, []);

  // Show nothing until the client-side check is complete
  if (typeof window === 'undefined') {
    return null;
  }

  // If it's the first visit and animation is running, show the loading screen
  if (isFirstVisit && isAnimationActive) {
    return (
      <AnimatePresence>
        {isAnimationActive && <LoadingScreen />}
      </AnimatePresence>
    );
  }

  // Otherwise, show the main application content
  return <>{children}</>;
}
