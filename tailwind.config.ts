import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { background: '#070B14', primary: '#37E67D', 'muted-foreground':'#9CA7BD' } } },
  plugins: []
};
export default config;
