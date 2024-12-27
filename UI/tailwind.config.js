module.exports = {

  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "./*.{js,ts,jsx,tsx}"
  ],

  theme: {

    extend: {

      screens: {
        
        md: '956px',

      },

      colors: {

        accentCyan: 'hsl(176, 68%, 64%)',
        primary: '#2563eb',
        secondary: '#1e40af',

      },

      fontFamily: {

        sans: ['Quicksand', 'sans-serif'],

      },

    },

  },

  plugins: [require( '@tailwindcss/line-clamp')],

}
