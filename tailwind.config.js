/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        growTall: {
          from: { height: "260px" },
          to: { height: "320px" },
        },
      },
      keyframes: {
        growHeight: {
          from: { height: "0" },
          to: { height: "200px" },
        },
      },
      animation: {
        growHeight: 'growHeight 0.3s ease-in-out linear'
      }
    },
  },
  plugins: [],
};
