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
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        navy: {
          50: '#e6eef5',
          100: '#ccdceb',
          200: '#99b9d7',
          300: '#6697c3',
          400: '#3374af',
          500: '#00519b',
          600: '#00417c',
          700: '#00315d',
          800: '#00203e',
          900: '#00101f',
        },
      },
    },
  },
  plugins: [],
}
