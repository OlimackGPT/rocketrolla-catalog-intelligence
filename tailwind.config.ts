import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#070B14',
        primary: '#37E67D',
        purple: '#8B5CF6',
        'muted-foreground': '#9CA7BD'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 10px 40px rgba(139,92,246,0.18)',
        'glow-primary': '0 0 30px rgba(55,230,125,0.25)'
      },
      backgroundImage: {
        'rr-gradient': 'linear-gradient(120deg, #37E67D 0%, #8B5CF6 100%)'
      }
    }
  },
  plugins: []
};

export default config;
