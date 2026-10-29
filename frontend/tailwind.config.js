/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Marcellus"', "Georgia", "serif"],
        sans: ['"Jost"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      colors: {
        kaira: {
          bg: "#F8F7F4",
          surface: "#FFFFFF",
          muted: "#F1F1F0",
          card: "#FFFFFF",
          border: "#EAE8E2",
          borderDark: "#111111",
          primary: "#8C907E",
          primaryDark: "#747866",
          primaryLight: "#F2F3EF",
          dark: "#111111",
          body: "#4A4D45",
          subtle: "#8A8D83",
        },
        primary: {
          50: "#F5F6F3",
          100: "#EAECE5",
          200: "#D3D7C9",
          300: "#B9BFAB",
          400: "#A3AA93",
          500: "#8C907E", // Kaira signature sage
          600: "#757967",
          700: "#5D6151",
          800: "#45483B",
          900: "#2B2E24",
        },
        slate: {
          850: "#151F33",
        }
      },
      letterSpacing: {
        widest: ".18em",
        wider: ".1em",
        wide: ".05em",
      },
      boxShadow: {
        kaira: "0 4px 20px rgba(0,0,0,0.04)",
        "kaira-hover": "0 10px 30px rgba(0,0,0,0.08)",
        "kaira-modal": "0 20px 60px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
