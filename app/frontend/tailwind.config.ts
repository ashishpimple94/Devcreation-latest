import type { Config } from 'tailwindcss';

/**
 * Design tokens ported 1:1 from the original Dev Creation stylesheet so the
 * storefront keeps its exact look (cream/gold palette, serif display type).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFDF8',
        bg: '#FFFDF8',
        'bg-2': '#FBF7F0',
        'bg-3': '#F5EFE5',
        surface: '#FFFFFF',
        'surface-2': '#FAF6EF',
        'surface-3': '#F0EAE0',
        ink: '#1C1410',
        'ink-2': '#3D312A',
        'ink-3': '#5C4F46',
        body: '#5A4E46',
        gold: '#B8943F',
        'gold-lt': '#D4B06A',
        'gold-dk': '#8C6F2A',
        copper: '#C17F3E',
        accent: '#D4956A',
        flame: '#F0A62C',
        forest: '#8B5E3C',
        'forest-lt': '#B08968',
        deep: '#2C1810',
        line: 'rgba(28,20,16,.1)',
        'line-soft': 'rgba(28,20,16,.05)',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        'display-alt': ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-dmsans)', 'system-ui', 'sans-serif'],
        util: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        card: '10px',
      },
      boxShadow: {
        card: '0 14px 34px -12px rgba(28,20,16,.15)',
        'card-hover': '0 24px 48px -14px rgba(184,148,63,.18)',
        rule: '0 12px 32px -10px rgba(28,20,16,.12)',
        drawer: '-20px 0 50px -30px rgba(28,20,16,.18)',
        glow: '0 0 25px rgba(212,176,106,.25)',
      },
      maxWidth: {
        shell: '1400px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        luxury: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      keyframes: {
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.65', transform: 'scale(1.04)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        breathe: 'breathe 7s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'float-delayed': 'float-delayed 6s ease-in-out 1.5s infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 5s ease-in-out infinite',
        'badge-pop': 'badge-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
