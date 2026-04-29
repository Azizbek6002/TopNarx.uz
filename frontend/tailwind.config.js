/** @type {import('tailwindcss').Config} */
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./lib/**/*.{js,ts,jsx,tsx}",
],

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#16a34a",   // yashil
          dark: "#0b1220",    // TopNarx mos “dark”
          accent: "#f59e0b",  // ozgina “gold” aksent (TopNarx vibe)
          bg: "#f7f7f7",      // oqga yaqin fon
        },
      },
    },
  },
  plugins: [],
};
