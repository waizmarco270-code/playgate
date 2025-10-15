
'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'playgate-session-loaded';
const LOADING_DURATION = 5000; // 5 seconds

export function LoadingScreenProvider({ children }: { children: React.ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    // This effect runs only once on the client
    const sessionLoaded = sessionStorage.getItem(SESSION_KEY);
    
    if (!sessionLoaded) {
      // It's the first visit of the session
      setIsFirstVisit(true);
      sessionStorage.setItem(SESSION_KEY, 'true');

      // Set a timer to end the animation and show the app
      const timer = setTimeout(() => {
        setIsFirstVisit(false);
        // A small delay before showing the app for smoother transition
        setTimeout(() => setShowApp(true), 500); 
      }, LOADING_DURATION);

      return () => clearTimeout(timer);
    } else {
        // Not the first visit, show app immediately
        setIsFirstVisit(false);
        setShowApp(true);
    }
  }, []);

  // Show nothing until the client-side check is complete
  if (typeof window === 'undefined' || !showApp && !isFirstVisit) {
    return null;
  }
  
  return (
    <>
      <AnimatePresence>
        {isFirstVisit && <LoadingScreen />}
      </AnimatePresence>
      {showApp && children}
    </>
  );
}
