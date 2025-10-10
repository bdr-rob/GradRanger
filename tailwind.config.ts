import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Existing shadcn colors (keep these)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        
        // ⭐ NEW: Grade Ranger Brand Colors
        'grade-ranger': {
          // Primary - Forest Green (#47682d)
          primary: {
            DEFAULT: '#47682d',
            50: '#f4f7f1',
            100: '#e6ede0',
            200: '#cddbc1',
            300: '#adc497',
            400: '#8aaa6d',
            500: '#6d8d4f',
            600: '#47682d', // Main brand color
            700: '#3a5624',
            800: '#2f451d',
            900: '#273819',
          },
          // Secondary - Midnight Blue (#14314F)
          secondary: {
            DEFAULT: '#14314F',
            50: '#f0f4f8',
            100: '#dce6f0',
            200: '#b9cde1',
            300: '#8aacc9',
            400: '#5a87ad',
            500: '#3a6891',
            600: '#2a5078',
            700: '#14314F', // Main brand color
            800: '#0f2338',
            900: '#0c1c2b',
          },
          // Silver/Font (#ABD2BE)
          silver: {
            DEFAULT: '#ABD2BE',
            50: '#f7fbf9',
            100: '#e8f4ee',
            200: '#d1e9dd',
            300: '#ABD2BE', // Main brand color
            400: '#8bc4a8',
            500: '#6bb592',
            600: '#52a07c',
            700: '#428366',
            800: '#366952',
            900: '#2d5643',
          },
          // Accent colors for UI elements
          success: '#52a07c',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 2px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        // ⭐ NEW: Grade Ranger specific animations
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
      // ⭐ NEW: Custom box shadows for Grade Ranger
      boxShadow: {
        'grade-ranger': '0 4px 14px 0 rgba(71, 104, 45, 0.15)',
        'grade-ranger-lg': '0 10px 40px 0 rgba(71, 104, 45, 0.2)',
      },
    }
  },
  plugins: [
    animate,
    typography,
  ],
} satisfies Config;