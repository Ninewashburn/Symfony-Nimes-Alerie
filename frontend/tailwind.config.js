/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0052FF',
        secondary: '#9D4EDD',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['Public Sans', 'sans-serif'],
        body: ['Public Sans', 'sans-serif'],
        label: ['Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
