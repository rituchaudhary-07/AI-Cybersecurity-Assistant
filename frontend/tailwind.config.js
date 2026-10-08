/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#FAFAFA',          // Minimal light background
          card: '#FFFFFF',        // Clean white card surface
          text: '#0F172A',        // Slate-900 primary text
          muted: '#64748B',       // Slate-500 secondary text
          border: '#E2E8F0',      // Slate-200 subtle 1px border
          'border-hover': '#CBD5E1',
          accent: '#E11D48',      // Rose-600 signal red accent
          'accent-hover': '#BE123C',
          'accent-light': '#FFF1F2',
        }
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
