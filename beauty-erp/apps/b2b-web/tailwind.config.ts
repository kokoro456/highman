import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC2C2',
          300: '#FF9999',
          400: '#FF8080',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#E04848',
          800: '#C03E3E',
          900: '#8B2C2C',
          950: '#5C1D1D',
        },
        coral: {
          50: '#FFF5F5',
          100: '#FFE0E0',
          200: '#FFC2C2',
          300: '#FF9999',
          400: '#FF8080',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#E04848',
          800: '#C03E3E',
          900: '#8B2C2C',
        },
        peach: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFD1B8',
          300: '#FFB694',
          400: '#FFA07A',
          500: '#FF8C5E',
          600: '#E07050',
          700: '#C05A40',
          800: '#8B4030',
          900: '#5C2A20',
        },
        warmYellow: {
          50: '#FFFBE6',
          100: '#FFF5B3',
          200: '#FFEF80',
          300: '#FFE94D',
          400: '#FFD93D',
          500: '#FFCF26',
          600: '#E0B520',
          700: '#B89018',
          800: '#8B6C10',
          900: '#5C4808',
        },
        teal: {
          50: '#ECFCFB',
          100: '#D0F5F2',
          200: '#A0EBE5',
          300: '#70E1D8',
          400: '#4ECDC4',
          500: '#3DB9B0',
          600: '#2FA69E',
          700: '#20877F',
          800: '#186860',
          900: '#104842',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(255, 107, 107, 0.06), 0 10px 20px -2px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 10px 40px -10px rgba(255, 107, 107, 0.08)',
        'soft-xl': '0 20px 60px -15px rgba(255, 107, 107, 0.10)',
        'warm': '0 2px 8px rgba(255, 107, 107, 0.08)',
        'inner-highlight': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
