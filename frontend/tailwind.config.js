/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          DEFAULT: '#131921',
          light: '#232f3e',
          subnav: '#37475a',
          accent: '#febd69',
          amber: '#f08804',
          orange: '#ff9900',
          darkOrange: '#e47911',
          link: '#007185',
          prime: '#00a8e1',
          bg: '#eaeded',
          border: '#d5d9d9',
          alert: '#b12704',
          green: '#067d62',
          price: '#b12704',
        }
      },
      fontFamily: {
        sans: ['"Ember"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
