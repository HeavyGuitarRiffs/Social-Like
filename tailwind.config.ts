import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],

  content: {
    files: [
      "./app/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./components/ui/**/*.{ts,tsx}",
      "./lib/**/*.{ts,tsx}",
    ],
  },

  theme: {
    extend: {
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
      },

      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",

        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",

        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        input: "var(--input)",
        ring: "var(--ring)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },

  plugins: [],
}

export default config