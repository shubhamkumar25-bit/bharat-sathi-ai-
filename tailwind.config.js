/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        }
      },
      boxShadow: {
        glow: '0 20px 60px rgba(249, 115, 22, 0.15)'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(99,102,241,0.18), rgba(15,23,42,0.04))'
      }
    }
  },
  plugins: []
};