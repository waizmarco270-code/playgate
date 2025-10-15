
'use client';

import { Film, Gamepad2, Headset, Music, Clapperboard, Tv, MonitorPlay } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const icons = [Film, Gamepad2, Headset, Music, Clapperboard, Tv, MonitorPlay];

const DigitalStreamBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background z-0">
      {Array.from({ length: 15 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const duration = Math.random() * 5 + 5; // 5 to 10 seconds
        const delay = Math.random() * 10;
        const left = Math.random() * 100;
        const size = Math.random() * 32 + 16; // 16px to 48px

        return (
          <motion.div
            key={i}
            initial={{ top: '-10%', opacity: 0 }}
            animate={{ top: '110%', opacity: [0, 0.5, 0] }}
            transition={{
              duration: duration,
              delay: delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${left}vw`,
            }}
          >
            <Icon style={{ width: size, height: size }} className="text-primary/30" />
          </motion.div>
        );
      })}
    </div>
  );
};


export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <DigitalStreamBackground />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <Image 
            src="https://picsum.photos/seed/logo/128/128" 
            alt="PlayGate Logo" 
            width={128} 
            height={128} 
            className="rounded-full mb-6 shadow-2xl shadow-primary/30"
            data-ai-hint="logo abstract"
            priority
        />
        <h1 className="font-futuristic text-5xl md:text-6xl font-bold tracking-widest text-foreground">
          PLAYGATE
        </h1>
        <p className="font-tech text-lg md:text-xl text-muted-foreground mt-2 tracking-wider">
          Your Offline Video Universe
        </p>
      </motion.div>
    </motion.div>
  );
};
