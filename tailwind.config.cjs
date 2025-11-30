const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0D0D0D',
        'matrix-green': '#00FF41',
        'light-gray': '#9E9E9E',
        'dark-gray': '#333333',
        background: '#0D0D0D',
        surface: '#1A1A1A',
        primary: '#00FF41',
        'primary-2': '#00E85A',
        dim: '#004000',
        text: '#DFFFE8',
      },
      fontFamily: {
        sans: ['"Roboto Mono"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        'glow-primary': '0 0 20px 4px rgba(0, 255, 65, 0.5)',
        'glow-primary-2': '0 0 20px 4px rgba(0, 232, 90, 0.5)',
      },
      animation: {
        glitch: 'glitch 1s linear infinite',
        'fade-in': 'fadeIn 1s ease-in-out',
      },
      keyframes: {
        glitch: {
          '2%, 64%': {
            transform: 'translate(2px, 0) skew(0deg)',
          },
          '4%, 60%': {
            transform: 'translate(-2px, 0) skew(0deg)',
          },
          '62%': {
            transform: 'translate(0, 0) skew(5deg)',
          },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
