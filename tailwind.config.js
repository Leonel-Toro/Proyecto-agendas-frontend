/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FAF8F3',
        'card-bg': '#FFFFFF',
        'brown-dark': '#4A4238',
        'brown-light': '#8C8174',
        'terracota': '#D4A59A',
        'sage': '#A8B5A0',
        'beige': '#E8DFD0',
        'yellow-warm': '#FDE68A',
        'gray-neutral': '#9CA3AF',
        'green-dark': '#5F7455',
        'brown-red': '#8C5E53',
        'brown-medium': '#6B5D52',
        'green-very-dark': '#3F4F3A',
        'brown-chocolate': '#5C3D36',
        'gray-dark': '#374151',
      },
      fontFamily: {
        'quicksand': ['Quicksand', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 4px 20px -4px rgba(74,66,56,0.05)',
        'card-hover': '0 8px 30px -4px rgba(212,165,154,0.15)',
      },
    },
  },
  plugins: [],
}