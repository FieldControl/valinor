/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      width: {
        'container': '1296px',
      },
      colors: {
        'light-bg-primary': '#f6f8fa',
        'light-border': '#D0D7DE',

        'dark-bg-primary': '#0D1117',
        'dark-bg-secondary': '#010409',
        'dark-border': '#30363d',
        'dark-border-hover': '#8b949e',
        'dark-gray': '#21262d',
        'dark-gray-hover': '#30363d',
        'dark-bg-tertiary': '#161b22',
      }
    },

  },
  plugins: [],
}
