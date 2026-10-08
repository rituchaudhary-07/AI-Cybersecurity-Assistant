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
        cyber: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          border: 'var(--border-glow)',
          accent: 'var(--accent)',
          'accent-strong': 'var(--accent-strong)',
          blue: 'var(--blue)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan-glow-sm': '0 0 12px rgba(34, 211, 238, 0.25)',
        'cyan-glow-md': '0 0 25px rgba(34, 211, 238, 0.35), 0 4px 12px rgba(0, 0, 0, 0.6)',
        'cyan-glow-lg': '0 0 45px rgba(0, 229, 255, 0.45), 0 8px 24px rgba(0, 0, 0, 0.8)',
        'blue-glow': '0 0 25px rgba(37, 99, 235, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'circuit-pulse': 'circuitPulse 3s ease-in-out infinite',
        'ring-spin': 'ringSpin 20s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ringSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        circuitPulse: {
          '0%, 100%': { opacity: '0.3', strokeDashoffset: '0' },
          '50%': { opacity: '1', strokeDashoffset: '-20' },
        }
      }
    },
  },
  plugins: [],
}
