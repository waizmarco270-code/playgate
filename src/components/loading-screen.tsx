
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
    Film, 
    Video, 
    Camera, 
    Clapperboard, 
    PlayCircle, 
    MonitorPlay, 
    Image as ImageIcon, 
    Headphones, 
    Mic, 
    Music 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


const GridBackground = () => {
    const { resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState<boolean | null>(null);

    useEffect(() => {
        setIsDark(resolvedTheme === 'dark');
    }, [resolvedTheme]);


    if (isDark === null) {
        return <div className="absolute inset-0 z-0 h-full w-full"></div>;
    }

    return (
        <div className={cn(
            "absolute inset-0 z-0 h-full w-full bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]",
            isDark 
                ? "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"
                : "bg-[linear-gradient(to_right,#1e3a8a12_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a12_1px,transparent_1px)]"
        )}></div>
    );
};

const GlitchyBits = () => {
    const { resolvedTheme } = useTheme();
     const [isDark, setIsDark] = useState<boolean | null>(null);

    useEffect(() => {
        setIsDark(resolvedTheme === 'dark');
    }, [resolvedTheme]);

    const bits = [
        { top: '10%', left: '15%', rotate: 15, scale: 0.8 },
        { top: '20%', left: '80%', rotate: -25, scale: 0.7 },
        { top: '70%', left: '10%', rotate: 5, scale: 0.9 },
        { top: '80%', left: '90%', rotate: -10, scale: 0.6 },
        { top: '40%', left: '5%', rotate: 30, scale: 0.75 },
        { top: '55%', left: '95%', rotate: -5, scale: 0.85 },
    ];

    if (isDark === null) return null;

    return (
        <>
            {bits.map((bit, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "absolute w-10 h-10 border-l-2 border-t-2",
                        isDark ? "border-cyan-400/50" : "border-blue-500/30"
                    )}
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

const iconList = [Film, Video, Camera, Clapperboard, PlayCircle, MonitorPlay, ImageIcon, Headphones, Mic, Music];

const IconRain = () => {
    const [icons, setIcons] = useState<any[]>([]);

    useEffect(() => {
        const generateIcons = () => {
            const newIcons = Array.from({ length: 30 }).map((_, i) => {
                const Icon = iconList[Math.floor(Math.random() * iconList.length)];
                const style = {
                    left: `${Math.random() * 100}vw`,
                    animationDuration: `${Math.random() * 4 + 4}s`, // 4s to 8s
                    animationDelay: `${Math.random() * 4}s`,
                    opacity: Math.random() * 0.15 + 0.05, // 0.05 to 0.2
                };
                const size = Math.random() * 24 + 16; // 16px to 40px
                return {
                    id: i,
                    Icon,
                    style,
                    size,
                };
            });
            setIcons(newIcons);
        };
        generateIcons();
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {icons.map(({ id, Icon, style, size }) => (
                <Icon
                    key={id}
                    className="absolute text-blue-500/30 dark:text-cyan-400/30 animate-fall"
                    style={style}
                    size={size}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
};


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
        }, 150); // faster progress bar to match 4s duration

        return () => clearInterval(interval);
    }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 dark:bg-[#0a0f18] text-gray-800 dark:text-gray-300 overflow-hidden"
    >
        <GridBackground />
        <GlitchyBits />
        <IconRain />

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
                <div className="absolute inset-0 border-[3px] border-blue-500/20 dark:border-cyan-400/30 rounded-full"></div>
                <div className="absolute inset-2 border border-blue-500/20 dark:border-cyan-400/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image 
                        src="/logo.jpg" 
                        alt="PlayGate Logo" 
                        width={144} 
                        height={144} 
                        className="rounded-full shadow-2xl shadow-blue-500/20 dark:shadow-cyan-500/20"
                        priority
                    />
                </div>
            </motion.div>
            
            <h1 style={{fontFamily: "'Orbitron', sans-serif"}} className="text-5xl md:text-6xl font-bold tracking-widest text-slate-800 dark:text-gray-100 uppercase">
              PLAYGATE
            </h1>
            <p style={{fontFamily: "'Audiowide', sans-serif"}} className="text-lg md:text-xl text-blue-600 dark:text-cyan-400/80 mt-2 tracking-wider">
              Enter Your World of Play.
            </p>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm text-center">
             <div style={{fontFamily: "'Audiowide', sans-serif"}} className="text-sm text-blue-600 dark:text-cyan-400">Powered by EmityGate</div>
             <div className="text-xs text-gray-500 dark:text-gray-500">Developed by Waiz Marco</div>

            <div className="w-full bg-gray-300/50 dark:bg-gray-700/50 rounded-full h-2.5 mt-4 overflow-hidden border border-blue-900/20 dark:border-cyan-900/50">
                <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 dark:from-cyan-500 dark:to-cyan-300 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
            </div>
             <p className="font-mono text-blue-600 dark:text-cyan-400 text-sm mt-2">{Math.round(progress)}%</p>
        </div>
    </motion.div>
  );
};
