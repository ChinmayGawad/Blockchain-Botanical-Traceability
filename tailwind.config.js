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
        brand: {
          forest: '#15803d',       // Primary Action
          'forest-dark': '#14532d',  // Primary Hover
          emerald: '#16a34a',      // Active Accent
          'emerald-light': '#dcfce7',
          surface: '#ffffff',      // Card Background
          bg: '#f8fafc',           // Page Background
          'bg-tint': '#f0fdf4',    // Botanical Soft Tint
          border: '#e2e8f0',       // Card/Table Borders
          'border-focus': '#15803d', // Focus Rings
          muted: '#64748b',        // Subtitles / Meta
          dark: '#0f172a',         // High Contrast Headings
        },
        botanical: {
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
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(21, 128, 61, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
