/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require('@tailwindcss/typography')],
  daisyui: {
    themes: [
      {
        bonvinlab: {  // from: https://coolors.co/image-picker
          "primary": "#4177C1",
          "secondary": "#EC5E59",
          "accent": "#EEF51C",
          "neutral": "#535C61",
          "base-100": "#F2F3F9",
          "info": "#86DBEE",
          "success": "#23D76B",
          "warning": "#EAAC10",
          "error": "#E63D67",
        }
      }
    ]
  }
}
