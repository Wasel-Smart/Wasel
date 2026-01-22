/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#008080',
        secondary: '#607D4B',
        accent: '#800020',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      backgroundColor: {
        'gradient-primary': 'linear-gradient(135deg, #008080 0%, #006666 100%)',
      },
      textColor: {
        primary: '#008080',
        secondary: '#607D4B',
      }
    },
  },
  plugins: [],
}
