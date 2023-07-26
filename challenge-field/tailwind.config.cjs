module.exports = {
  purge: {
    content: ['./src/**/*.html', './index.html'],
  },
  darkMode: false, // ou 'media' ou 'class'
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
      },
      backgroundImage: {
        'bg-primary': '#010409',
        'bg-secundary': '#0d1117',
      }
    },
  },
  variants: {},
  plugins: [],
};