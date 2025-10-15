
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Poppins', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        code: ['monospace'],
        futuristic: ['Orbitron', 'sans-serif'],
        tech: ['Audiowide', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.5)', opacity: '0.2' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
         'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-out': {
            '0%, 100%': { opacity: '0' },
            '50%': { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'gradient-shift': {
            '0%, 100%': { 'background-position': '0% 50%' },
            '50%': { 'background-position': '100% 50%' },
        },
        'rain-1': {
            '0%': { transform: 'translate(10vw, -25vh) scale(0.7)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(15vw, 125vh) scale(0.5)', opacity: '0' },
        },
        'rain-2': {
            '0%': { transform: 'translate(25vw, -25vh) scale(0.8)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(20vw, 125vh) scale(0.6)', opacity: '0' },
        },
        'rain-3': {
            '0%': { transform: 'translate(40vw, -25vh) scale(0.6)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(35vw, 125vh) scale(0.4)', opacity: '0' },
        },
        'rain-4': {
            '0%': { transform: 'translate(55vw, -25vh) scale(0.9)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(50vw, 125vh) scale(0.7)', opacity: '0' },
        },
        'rain-5': {
            '0%': { transform: 'translate(70vw, -25vh) scale(0.5)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(65vw, 125vh) scale(0.3)', opacity: '0' },
        },
        'rain-6': {
            '0%': { transform: 'translate(85vw, -25vh) scale(0.7)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(80vw, 125vh) scale(0.5)', opacity: '0' },
        },
        'rain-7': {
            '0%': { transform: 'translate(95vw, -25vh) scale(0.8)', opacity: '0' },
            '1%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translate(90vw, 125vh) scale(0.6)', opacity: '0' },
        },
         'draw-line-h': {
            '0%': { width: '0%', left: '0' },
            '45%': { width: '100%', left: '0' },
            '55%': { width: '100%', left: '0' },
            '100%': { width: '0%', left: '100%' },
        },
        'draw-line-v': {
            '0%': { height: '0%', top: '0' },
            '45%': { height: '100%', top: '0' },
            '55%': { height: '100%', top: '0' },
            '100%': { height: '0%', top: '100%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-in': 'fade-in 1s ease-out forwards',
        'fade-in-out': 'fade-in-out 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 15s linear infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'rain-1': 'rain-1 12s linear infinite',
        'rain-2': 'rain-2 13s linear infinite',
        'rain-3': 'rain-3 14s linear infinite',
        'rain-4': 'rain-4 12.5s linear infinite',
        'rain-5': 'rain-5 13.5s linear infinite',
        'rain-6': 'rain-6 14.5s linear infinite',
        'rain-7': 'rain-7 12s linear infinite',
        'draw-line-h': 'draw-line-h 2.5s ease-in-out infinite',
        'draw-line-v': 'draw-line-v 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
