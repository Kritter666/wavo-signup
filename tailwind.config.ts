
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}"
  ],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      borderRadius: { lg: "0.75rem", md: "0.625rem", sm: "0.5rem" },
      colors: {
        border: "hsl(214.3,31.8%,91.4%)",
        background: "hsl(0,0%,100%)",
        foreground: "hsl(222.2,84%,4.9%)",
        primary: "hsl(222.2,47.4%,11.2%)",
        muted: "hsl(210,40%,96.1%)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
