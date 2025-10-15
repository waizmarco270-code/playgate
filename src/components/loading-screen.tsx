
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { Film, Clapperboard, Video, PlayCircle, SlidersHorizontal, Camera } from 'lucide-react';

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
                opacity: { duration: 0.5, ease: 'easeIn' }
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
                isDark ? "bg-gradient-to-br from-[#0A0A0A] to-[#141414]" : "bg-gradient-to-br from-[#FFFFFF] to-[#E8E8E8]"
            )}
        >
            {/* Raining Icons Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <Film className="absolute h-8 w-8 text-primary/10 animate-rain-1" style={{left: '10%'}} />
                <Clapperboard className="absolute h-6 w-6 text-primary/10 animate-rain-2" style={{left: '20%'}}/>
                <Video className="absolute h-10 w-10 text-primary/10 animate-rain-3" style={{left: '30%'}}/>
                <PlayCircle className="absolute h-8 w-8 text-primary/10 animate-rain-4" style={{left: '40%'}}/>
                <SlidersHorizontal className="absolute h-6 w-6 text-primary/10 animate-rain-5" style={{left: '50%'}}/>
                <Camera className="absolute h-7 w-7 text-primary/10 animate-rain-6" style={{left: '60%'}}/>
                <Film className="absolute h-8 w-8 text-primary/10 animate-rain-7" style={{left: '70%'}}/>
                <Video className="absolute h-10 w-10 text-primary/10 animate-rain-1" style={{left: '80%', animationDelay: '1s'}}/>
                <PlayCircle className="absolute h-8 w-8 text-primary/10 animate-rain-3" style={{left: '90%', animationDelay: '3s'}}/>
                <Camera className="absolute h-7 w-7 text-primary/10 animate-rain-5" style={{left: '5%', animationDelay: '5s'}}/>
            </div>

            <div className="relative flex flex-col items-center justify-center text-center">
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
                        isDark ? "text-white" : "text-black"
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
                        isDark ? "text-white/60" : "text-black/60"
                    )}
                >
                    Enter Your World of Play.
                </motion.p>
            </div>
            
            {/* Signature & Progress Zone */}
            <div className="absolute bottom-6 md:bottom-10 text-center w-full max-w-xs px-4">
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
                        isDark ? "text-white/70" : "text-black/70"
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
