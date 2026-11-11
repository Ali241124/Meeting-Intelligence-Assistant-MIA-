/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0b0f14',
          900: '#111720',
          850: '#161f2b',
          800: '#1c2635',
          700: '#273549',
          600: '#384860',
          500: '#4e617d',
        },
        brand: {
          emerald: '#10b981',
          amber: '#f59e0b',
          blue: '#3b82f6',
          indigo: '#6366f1',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}

