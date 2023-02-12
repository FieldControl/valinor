// eslint-disable-next-line tsdoc/syntax
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/app/**/*.{js,ts,jsx,tsx}',
		'./src/pages/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
		'./src/functions/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		fontFamily: {
			sans: ['Kanit', 'sans-serif'],
		},
	},
	plugins: [],
};
