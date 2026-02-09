/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#4f46e5',
        'admin-secondary': '#0ea5e9',
        'admin-bg': '#f8fafc',
        'admin-sidebar': '#1e293b',
        'admin-sidebar-hover': '#334155',
        'admin-text': '#334155',
      }
    },
  },
  plugins: [],
}