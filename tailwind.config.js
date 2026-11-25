/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          950: '#060911',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#141e33',
          700: '#1e293b',
          600: '#334155',
          cyan: '#00f0ff',
          neon: '#38bdf8',
          accent: '#2563eb',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 240, 255, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(37, 99, 235, 0.4)',
      }
    },
  },
  plugins: [],
}
