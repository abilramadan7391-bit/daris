/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        brand: {
          dark: '#0e3a2f',
          DEFAULT: '#144e3f',
          light: '#20755f',
          surface: '#f3f6f4',
          card: '#ffffff',
          accent: '#10b981',
          mint: '#e6f4ee',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(16, 24, 40, 0.05), 0 2px 6px -1px rgba(16, 24, 40, 0.03)',
        'card-hover': '0 12px 28px -4px rgba(16, 24, 40, 0.08), 0 4px 10px -2px rgba(16, 24, 40, 0.04)',
      }
    },
  },
  plugins: [],
}
