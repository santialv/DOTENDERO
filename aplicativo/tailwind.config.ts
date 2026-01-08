import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#13ec80",
                "primary-hover": "#0fd673",
                "primary-dark": "#0fb863",
                "background-light": "#f6f8f7",
                "background-dark": "#102219",
                "surface-light": "#ffffff",
                "surface-dark": "#1a2e24", // Updated from user's HTML
                "border-light": "#cfe7db",
                "border-dark": "#2a4a3c",
                "text-main": "#0d1b14",
                "text-secondary": "#4c9a73",
                "input-border": "#cfe7db",
                // Legacy support if needed, map to new values
                "subtle-light": "#e7f3ed",
                "subtle-dark": "#1a382b",
                "text-muted": "#4c9a73",
            },
            fontFamily: {
                "display": ["Work Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
};
export default config;
