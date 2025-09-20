/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#0ea5e9',
          secondary: '#22c55e'
        }
      },
      boxShadow: {
        card: '0 20px 60px rgba(0,0,0,0.4)'
      }
    }
  },
  plugins: []
};
