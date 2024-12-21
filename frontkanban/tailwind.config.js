/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Mont: ["Montserrat", "sans-serif"],
      },
      // title: {
      //   t1:"font-bold  hidden md:block text-3xl text-blue-500 font-Mont"
      // },
    },
  },
  plugins: [],
}

