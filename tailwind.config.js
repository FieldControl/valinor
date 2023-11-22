/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*{html,ts}"],
  theme: {
    extend: {
      fontFamily:{
        montserrat: ['Montserrat'],
        colonna: ['Colonna']
      },
      backgroundImage:{
        'fieldcontrol': "url('assets/img/arteField.png')"
      }
    },
  },
  plugins: [],
}

