
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const GridBackground = () => (
  <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
);

const GlitchyBits = () => {
    const bits = [
        { top: '10%', left: '15%', rotate: 15, scale: 0.8 },
        { top: '20%', left: '80%', rotate: -25, scale: 0.7 },
        { top: '70%', left: '10%', rotate: 5, scale: 0.9 },
        { top: '80%', left: '90%', rotate: -10, scale: 0.6 },
        { top: '40%', left: '5%', rotate: 30, scale: 0.75 },
        { top: '55%', left: '95%', rotate: -5, scale: 0.85 },
    ]

    return (
        <>
            {bits.map((bit, i) => (
                <motion.div
                    key={i}
                    className="absolute w-10 h-10 border-l-2 border-t-2 border-cyan-400/50"
                    style={{
                        top: bit.top,
                        left: bit.left,
                    }}
                    animate={{
                        rotate: [bit.rotate, bit.rotate + 10, bit.rotate -10, bit.rotate],
                        scale: [bit.scale, bit.scale + 0.1, bit.scale],
                        opacity: [0.5, 0.2, 0.8, 0.5],
                    }}
                    transition={{
                        duration: Math.random() * 4 + 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </>
    )
}


export const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const diff = Math.random() * 10;
                return Math.min(prev + diff, 100);
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0f18] text-gray-300"
    >
        <GridBackground />
        <GlitchyBits />

        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center"
        >
            <motion.div
                className="relative w-40 h-40 mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
                <div className="absolute inset-0 border-[3px] border-cyan-400/30 rounded-full"></div>
                <div className="absolute inset-2 border border-cyan-400/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image 
                        src="https://picsum.photos/seed/cliff/144/144" 
                        alt="PlayGate Logo" 
                        width={144} 
                        height={144} 
                        className="rounded-full shadow-2xl shadow-cyan-500/20"
                        data-ai-hint="cliff coast"
                        priority
                    />
                </div>
            </motion.div>
            
            <h1 className="font-futuristic text-5xl md:text-6xl font-bold tracking-widest text-gray-100 uppercase">
              PLAYGATE
            </h1>
            <p className="font-tech text-lg md:text-xl text-cyan-400/80 mt-2 tracking-wider">
              Enter Your World of Play.
            </p>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm text-center">
             <div className="font-tech text-sm text-cyan-400">Powered by EmityGate</div>
             <div className="text-xs text-gray-500">Developed by Waiz Marco</div>

            <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4 overflow-hidden border border-cyan-900/50">
                <motion.div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
            </div>
             <p className="font-code text-cyan-400 text-sm mt-2">{Math.round(progress)}%</p>
        </div>
    </motion.div>
  );
};
