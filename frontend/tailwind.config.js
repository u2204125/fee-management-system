/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#dc267f',
          600: '#b91c6b',
          700: '#9d1757',
        },
        success: {
          500: '#28a745',
          600: '#218838',
        },
        danger: {
          500: '#dc3545',
          600: '#c82333',
        },
        warning: {
          500: '#ffc107',
          600: '#e0a800',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};