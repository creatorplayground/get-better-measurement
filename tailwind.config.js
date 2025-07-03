module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  safelist: ['scrollbar-hide'],
  theme: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
