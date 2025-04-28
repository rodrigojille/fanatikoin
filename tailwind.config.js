const { fontFamily } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.{js,ts,jsx,tsx,css}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue[600],
        secondary: colors.indigo[600],
        accent: colors.purple[600],
        background: colors.gray[50],
        foreground: colors.gray[900],
      },
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
      },
      animation: {
        'gradient-x': 'gradient-x 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      ringColor: {
        DEFAULT: colors.gray[900],
      },
      borderRadius: {
        'lg': '0.625rem', // 10px
        'xl': '0.75rem', // 12px
        '2xl': '1rem', // 16px
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
