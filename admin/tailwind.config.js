/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#818cf8', // Indigo 400
        'admin-secondary': '#22d3ee', // Cyan 400
        'admin-bg': '#020617', // Slate 950
        'admin-sidebar': '#0f172a',
        'admin-sidebar-hover': '#1e293b',
        'admin-text': '#ffffff',
        'admin-card': '#1e293b',
        'admin-border': '#334155',
      }
    },
  },
  plugins: [],
}