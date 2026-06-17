/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1f24',
        muted: '#667085',
        line: '#d9e0e8',
        surface: '#f6f8fb',
        primary: '#2563eb',
        success: '#168a5b',
        warning: '#b45309',
        danger: '#c24136',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
}

