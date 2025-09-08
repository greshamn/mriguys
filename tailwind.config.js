/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],     // 14px (was 12px)
        'sm': ['1rem', { lineHeight: '1.5rem' }],          // 16px (was 14px)
        'base': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px (was 16px)
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],      // 20px (was 18px)
        'xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px (was 20px)
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px (was 24px)
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],      // 36px (was 30px)
        '4xl': ['3rem', { lineHeight: '1' }],              // 48px (was 36px)
        '5xl': ['3.75rem', { lineHeight: '1' }],           // 60px (was 48px)
        '6xl': ['4.5rem', { lineHeight: '1' }],            // 72px (was 60px)
        '7xl': ['6rem', { lineHeight: '1' }],              // 96px (was 72px)
        '8xl': ['8rem', { lineHeight: '1' }],              // 128px (was 96px)
        '9xl': ['12rem', { lineHeight: '1' }],             // 192px (was 128px)
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
