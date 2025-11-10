/** @type {import('tailwindcss').Config} */
export const content = [
  './app/**/*.{js,ts,jsx,tsx}',
  './pages/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
];
export const theme = {
  extend: {
    fontFamily: {
      lexend: ['var(--font-lexend)'],
      comfortaa: ['var(--font-comfortaa)'],
      geist: ['var(--font-geist-sans)'],
      geistmono: ['var(--font-geist-mono)'],
    },
  },
};
export const plugins = [];
