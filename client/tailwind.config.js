/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mineral: {
          900: '#0F172A',
          800: '#1E293B',
        },
        accent: {
          DEFAULT: '#0D9488',
          hover: '#14B8A6',
        },
        alert: {
          DEFAULT: '#F97316',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}