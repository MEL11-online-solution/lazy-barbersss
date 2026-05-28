/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F0F2D',
          800: '#161636',
          700: '#1E1E45',
          600: '#272758',
          500: '#33336B',
        },
        pink: {
          500: '#E91E63',
          600: '#D81557',
          400: '#F84A82',
        },
        gold: {
          400: '#D4A843',
          500: '#B8902F',
        },
        'gold-brand': '#D4A843',
      },
      fontFamily: {
        display: ['Bebas Neue', 'Anton', 'Impact', 'system-ui', 'sans-serif'],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.25)',
        glow: '0 0 24px rgba(233,30,99,0.4)',
        'glow-gold': '0 0 16px rgba(212,168,67,0.3)',
      },
    },
  },
  plugins: [],
};
