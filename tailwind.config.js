/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'teko': ['Teko', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
          hover: '#B91C1C',
        },
        background: '#09090B',
        foreground: '#FAFAFA',
        card: {
          DEFAULT: '#18181B',
          foreground: '#FAFAFA',
        },
        muted: {
          DEFAULT: '#27272A',
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#27272A',
          foreground: '#FAFAFA',
        },
        border: '#27272A',
        input: '#27272A',
        ring: '#DC2626',
      },
    },
  },
  plugins: [],
}
