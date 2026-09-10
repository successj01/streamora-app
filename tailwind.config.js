/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
        },
        "app-bg": "var(--app-bg)",
        "app-text": "var(--app-text)",
        "app-muted": "var(--app-muted)",
        "app-border": "var(--app-border)",
        "app-hover": "var(--app-hover)",
      },
    },
  },
  plugins: [],
}

