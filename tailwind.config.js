/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      backGround: {
        header: "#2d333b",
        body: "#22272E"
      },
      transparent: "transparent",
      green: "#2EA44F",
      white: "#f0f6fc",
      border: "#444c56",
      link: "#539bf5",
      tag: "#4184e4",
      yellow: '#FFC500',
      orange: '#FFC43D'
    },
    backgroundImage: {
    }
  },
  plugins: []
};
