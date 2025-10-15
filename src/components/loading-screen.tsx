
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import React from 'react';
import { Camera, Clapperboard, Film, Headphones, Mic, Play, Repeat, Video } from 'lucide-react';

const ICONS = [Camera, Clapperboard, Film, Headphones, Mic, Play, Repeat, Video];

const DigitalStreamBackground = React.memo(() => {
    const columns = Array.from({ length: 40 }).map((_, i) => i);

    const randomIcon = () => {
        const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
        return <Icon key={Math.random()} className="h-4 w-4 shrink-0" />;
    };
    
    const randomIconColumn = (count: number) => Array.from({ length: count }).map(randomIcon);

    return (
         <div className="absolute inset-0 overflow-hidden z-0">
            {columns.map(i => (
                <div 
                    key={`col-${i}`} 
                    className="absolute top-0 h-full text-primary/10 animate-rain-stream"
                    style={{
                        left: `${i * 2.5}%`,
                        animationDuration: `${Math.random() * 20 + 15}s`,
                        animationDelay: `${Math.random() * -35}s`,
                    }}
                >
                   <div className="flex flex-col gap-4">
                     {randomIconColumn(30)}
                   </div>
                </div>
            ))}
        </div>
    );
});
DigitalStreamBackground.displayName = 'DigitalStreamBackground';

const BlueprintGrid = React.memo(() => {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
                {/* Main Grid */}
                <div className="w-full h-full absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:1rem_1rem] animate-fade-in opacity-0"></div>
                
                {/* Scanner Lines */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-draw-line-h"></div>
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-draw-line-v"></div>
                </div>

                {/* Corner Brackets */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary animate-spin-slow"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary animate-spin-slow" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary animate-spin-slow" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary animate-spin-slow" style={{animationDelay: '0.1s'}}></div>
                
                {/* Annotations */}
                <span className="absolute -top-4 left-0 text-primary/50 text-xs font-mono animate-fade-in-out opacity-0" style={{animationDelay: '0.5s'}}>w:128px</span>
                <span className="absolute -right-12 top-0 text-primary/50 text-xs font-mono animate-fade-in-out opacity-0" style={{animationDelay: '0.8s'}}>h:128px</span>
                 <span className="absolute -bottom-4 right-0 text-primary/50 text-xs font-mono animate-fade-in-out opacity-0" style={{animationDelay: '1.2s'}}>r:8px</span>
            </div>
        </div>
    )
})
BlueprintGrid.displayName = 'BlueprintGrid'


export function LoadingScreen({ progress }: { progress: number }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: { opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }
    };

    const logoVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: {
            scale: [0.9, 1.05, 0.9],
            opacity: 1,
            transition: {
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.5, ease: 'easeIn', delay: 1.5 } // Delay fade in
            }
        },
    };

    const textVariants = {
        hidden: { y: 20, opacity: 0, letterSpacing: '0.1em' },
        visible: { 
            y: 0, 
            opacity: 1, 
            letterSpacing: '0.25em',
            transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.3 }
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
                isDark ? "bg-black" : "bg-white",
                "bg-gradient-to-br from-background via-background to-primary/5 animate-gradient-shift"
            )}
        >
            {/* Digital Stream Effect */}
            <DigitalStreamBackground />

            {/* Blueprint Grid */}
            <BlueprintGrid />

            <div className="relative z-20 flex flex-col items-center justify-center text-center p-4 rounded-full bg-background/80 backdrop-blur-sm">
                {/* Logo with Glow */}
                <motion.div
                    className="relative w-24 h-24 md:w-32 md:h-32"
                    variants={logoVariants}
                    initial="initial"
                    animate="animate"
                >
                    <div className="absolute -inset-4 bg-primary/30 blur-2xl rounded-full animate-pulse-glow"></div>
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
                        "text-foreground"
                    )}
                >
                    PlayGate
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    variants={signatureVariants(0.8)}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                        "mt-2 text-sm tracking-widest",
                        "text-muted-foreground"
                    )}
                >
                    Enter Your World of Play.
                </motion.p>
            </div>
            
            {/* Signature & Progress Zone */}
            <div className="absolute bottom-6 md:bottom-10 text-center w-full max-w-xs px-4 z-10">
                 <motion.p
                    variants={signatureVariants(1.2)}
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
                        "text-foreground/70"
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
