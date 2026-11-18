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
        obsidian: {
          950: '#04070B',
          900: '#070B10',
          850: '#0A1016',
          800: '#0D151C',
          700: '#14202B',
        },
        biometric: {
          teal: '#00F5D4',
          mint: '#10B981',
          coral: '#F43F5E',
        },
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(0, 245, 212, 0.25)',
        'glow-teal-lg': '0 0 30px rgba(0, 245, 212, 0.4)',
        'glow-mint': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-coral': '0 0 25px rgba(244, 63, 94, 0.4)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(0, 245, 212, 0.15)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'monospace',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(0, 245, 212, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 245, 212, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};

