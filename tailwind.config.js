/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Add all your source file extensions here
  ],
  theme: {
    screens: {
      "sm": '640px', // Small screens and up
      "md": '768px', // Medium screens and up
      "lg": '1024px', // Large screens and up
      "xl": '1280px', // Extra large screens and up
      '2xl': '1536px', // 2X large screens and up
    },
    extend: {
      keyframes: {
        dropdown: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        dropdown: 'dropdown 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
