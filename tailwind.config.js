/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        growTall: {
          from: { height: '260px' },
          to: { height: '320px' },
        }
      },
    },
  },
  plugins: [],
}
