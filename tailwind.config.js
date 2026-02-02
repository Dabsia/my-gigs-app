/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        regular: "regular",
        bold: "bold",
        aeonikRegular: "aeonikRegular",
        aeonikBold: "aeonikBold",
        textBold: "bold",
        semiBold: "semiBold",
        whiteInkBold: "whiteInkBold",
      },
      colors: {
        primary: "#0166F6",
        secondary: "#061D3F",
        error: "#FF0935",

        // bgtransparent: 'rgba(255, 255, 255, 0.5)',
        // locationbackground: 'rgba(255,255,255, 0.7)',
      },
    },
  },
  plugins: [],
};
