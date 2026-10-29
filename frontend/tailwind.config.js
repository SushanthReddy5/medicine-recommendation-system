/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50 : "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
        accent: {
          cyan  : "#06b6d4",
          purple: "#8b5cf6",
          pink  : "#ec4899",
        },
        glass: {
          100: "rgba(255,255,255,0.05)",
          200: "rgba(255,255,255,0.08)",
          300: "rgba(255,255,255,0.12)",
        },
      },
      backgroundImage: {
        "gradient-radial"  : "radial-gradient(var(--tw-gradient-stops))",
        "gradient-premium" : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        "gradient-card"    : "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
        "gradient-glow"    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      },
      boxShadow: {
        "glow-blue"  : "0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)",
        "glow-cyan"  : "0 0 20px rgba(6,182,212,0.3), 0 0 40px rgba(6,182,212,0.1)",
        "glass"      : "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        "premium"    : "0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(59,130,246,0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow"  : "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float"       : "float 6s ease-in-out infinite",
        "glow"        : "glow 2s ease-in-out infinite alternate",
        "shimmer"     : "shimmer 2s linear infinite",
        "scan"        : "scan 2s ease-in-out infinite",
        "spin-slow"   : "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%"     : { transform: "translateY(-10px)" },
        },
        glow: {
          "0%"  : { boxShadow: "0 0 20px rgba(59,130,246,0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(59,130,246,0.6), 0 0 80px rgba(139,92,246,0.3)" },
        },
        shimmer: {
          "0%"  : { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%"     : { transform: "translateY(100%)", opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
