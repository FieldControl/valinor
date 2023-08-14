import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
  extend: {

    animation: {
      shine: "shine 1s",
    },
    keyframes: {
      shine: {
        "100%": { left: "125%" },
      },
    },

  },
} satisfies Config