import type { Config } from 'tailwindcss';

/** Same design tokens as the storefront so the admin panel stays on-brand. */
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
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        luxury: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
