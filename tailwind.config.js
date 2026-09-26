/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border, 160 30% 88%))',
        input: 'hsl(var(--input, 160 30% 88%))',
        ring: 'hsl(var(--ring, 173 78% 26%))',
        background: 'hsl(var(--background, 138 76% 97%))',
        foreground: 'hsl(var(--foreground, 166 84% 16%))',
        primary: {
          DEFAULT: 'hsl(var(--primary, 173 78% 26%))',
          foreground: 'hsl(var(--primary-foreground, 0 0% 100%))',
          hover: 'hsl(var(--primary-hover, 174 71% 22%))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 160 84% 39%))',
          foreground: 'hsl(var(--secondary-foreground, 0 0% 100%))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 84% 60%))',
          foreground: 'hsl(var(--destructive-foreground, 0 0% 98%))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 150 20% 94%))',
          foreground: 'hsl(var(--muted-foreground, 158 13% 42%))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 160 84% 39%))',
          foreground: 'hsl(var(--accent-foreground, 0 0% 100%))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, 0 0% 100%))',
          foreground: 'hsl(var(--popover-foreground, 166 84% 16%))',
        },
        card: {
          DEFAULT: 'hsl(var(--card, 0 0% 100%))',
          foreground: 'hsl(var(--card-foreground, 166 84% 16%))',
        },
        // Botanical Theme Specific Tokens
        brand: {
          forest: '#0F766E',
          'forest-dark': '#115E59',
          emerald: '#10B981',
          'emerald-light': '#CCFCDE',
          surface: '#ffffff',
          bg: '#F0FDF4',
          'bg-tint': '#F0FDF4',
          border: '#CCFCDE',
          'border-focus': '#0F766E',
          muted: '#5F7A6B',
          dark: '#064E3B',
        },
        botanical: {
          50: '#f0fdf4',
          100: '#ccfcde',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#0f766e',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      borderRadius: {
        lg: 'var(--radius, 1rem)',
        md: 'calc(var(--radius, 1rem) - 2px)',
        sm: 'calc(var(--radius, 1rem) - 4px)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(15, 118, 110, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(6, 78, 59, 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
