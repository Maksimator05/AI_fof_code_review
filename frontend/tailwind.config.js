/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Важно: используем class-based dark mode
  theme: {
    extend: {
      colors: {
        // Можно добавить кастомные цвета для dark theme
        dark: {
          50: '#1f2937',
          100: '#111827',
          200: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}