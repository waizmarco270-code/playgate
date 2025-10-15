
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import React from 'react';

const ShutterEffect = () => (
    <div className="absolute inset-0 z-20 pointer-events-none">
        {/* The clip-path is animated via CSS to create the opening effect */}
        <div className="w-full h-full bg-background animate-shutter-open" />
    </div>
);
ShutterEffect.displayName = 'ShutterEffect';

const FocusRing = () => (
    <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
            {/* Outer pulsating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-slow opacity-50"></div>
            {/* Inner focus marks */}
            <div className="absolute inset-4 rounded-full border border-dashed border-primary/20 animate-spin-slow-reverse"></div>
             {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-primary/20 animate-fade-in opacity-0 [animation-delay:0.5s]"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-primary/20 animate-fade-in opacity-0 [animation-delay:0.5s]"></div>
        </div>
    </div>
)
FocusRing.displayName = 'FocusRing'


export function LoadingScreen({ progress }: { progress: number }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: { opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }
    };
    
    const logoVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.5 }
        },
    };

    const textVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { duration: 1, ease: [0.25, 1, 0.5, 1], delay: 0.8 }
        }
    };
    
    const signatureVariants = (delay: number) => ({
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', delay } }
    });


    return (
        <motion.div
            variants={containerVariants}
            initial="visible" // Start visible
            exit="exit"
            className={cn(
                "fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none",
                isDark ? "bg-black" : "bg-neutral-900",
            )}
        >
            {/* The Shutter Layer is on top and animates to reveal content */}
            <ShutterEffect />
            
            {/* The content that gets revealed */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                
                <FocusRing />

                {/* Logo with Glow */}
                <motion.div
                    className="relative w-24 h-24 md:w-32 md:h-32 z-10"
                    variants={logoVariants}
                    initial="initial"
                    animate="animate"
                >
                    <div className="absolute -inset-4 bg-primary/30 blur-2xl rounded-full animate-pulse-glow [animation-delay:1s]"></div>
                    <Image
                        src="https://picsum.photos/seed/logo/128/128"
                        alt="PlayGate Logo"
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                        priority
                    />
                </motion.div>

                {/* App Name */}
                <motion.h1
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                        "mt-6 font-headline font-extrabold text-2xl md:text-3xl uppercase tracking-[0.25em] ml-[0.25em]",
                        "text-white"
                    )}
                >
                    PlayGate
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    variants={signatureVariants(1)}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                        "mt-2 text-sm tracking-widest",
                        "text-white/70"
                    )}
                >
                    Enter Your World of Play.
                </motion.p>
            </div>
            
            {/* Signature & Progress Zone */}
            <div className="absolute bottom-6 md:bottom-10 text-center w-full max-w-xs px-4 z-10">
                 <motion.p
                    variants={signatureVariants(1.5)}
                    initial="hidden"
                    animate="visible"
                    style={{fontFamily: 'Audiowide, sans-serif'}}
                    className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 animate-shimmer bg-[length:200%_100%]"
                >
                    Powered by EmityGate
                </motion.p>
                 <motion.p
                    variants={signatureVariants(1.8)}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                        "mt-2 text-xs italic",
                        "text-white/50"
                    )}
                 >
                    Developed by Waiz Marco
                 </motion.p>
                 
                 <motion.div
                    variants={signatureVariants(2.2)}
                    initial="hidden"
                    animate="visible"
                    className="w-full mt-8"
                 >
                    <p className="text-xs font-mono text-cyan-400 mb-2">{Math.round(progress)}%</p>
                    <div className="w-full h-1.5 rounded-full bg-cyan-400/20 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500 animate-shimmer bg-[length:200%_100%]"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
