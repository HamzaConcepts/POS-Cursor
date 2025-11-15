/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'bg-dark': '#000000',
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-inverse': '#FFFFFF',
        'border-light': '#E0E0E0',
        'border-dark': '#000000',
        'status-success': '#000000',
        'status-warning': '#666666',
        'status-error': '#333333',
        'status-info': '#999999',
      },
    },
  },
  plugins: [],
}

