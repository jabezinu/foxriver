/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F59E0B', // Amber 500
          dark: '#D97706',    // Amber 600
          light: '#FBBF24',   // Amber 400
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451a03',
        },
        secondary: {
          DEFAULT: '#3b82f6', // Blue 500
          dark: '#2563eb',    // Blue 600
          light: '#60a5fa',   // Blue 400
        },
        background: {
          DEFAULT: '#09090b', // Zinc 950
          lighter: '#18181b', // Zinc 900
          darker: '#000000',  // Black
        },
        surface: {
          DEFAULT: '#18181b', // Zinc 900
          lighter: '#27272a', // Zinc 800
          border: '#27272a',  // Zinc 800
        },
        dark: {
          DEFAULT: '#1f2937', // Gray 800
          lighter: '#374151', // Gray 700
          darker: '#111827',  // Gray 900
        },
        light: {
          DEFAULT: '#f9fafb', // Gray 50
          darker: '#f3f4f6',  // Gray 100
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 15px rgba(245, 158, 11, 0.3)', // Gold glow
        'glow-strong': '0 0 25px rgba(245, 158, 11, 0.5)', // Stronger gold glow
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #F59E0B, #FBBF24, #F59E0B)',
        'dark-gradient': 'linear-gradient(to bottom, #18181b, #09090b)',
      }
    },
  },
  plugins: [],
}