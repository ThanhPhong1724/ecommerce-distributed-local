// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'brand-primary': '#3B82F6',
        'brand-secondary': '#60A5FA',
        'brand-dark': '#111827',
        'brand-light': '#F9FAFB',
      }
    },
  },
  plugins: [],
}