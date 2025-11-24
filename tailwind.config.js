/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/context/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 🌿 Eco green dark палитра
        'eco-bg': '#0f1812',
        'eco-surface': '#17251a',
        'eco-surface-soft': '#1f3124',
        'eco-border': '#1f3124',
        'eco-accent': '#34d399',        // emerald-400
        'eco-accent-strong': '#059669', // emerald-600
        'eco-text': '#e5f2e9',
        'eco-text-muted': '#9caea3',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'eco-soft': '0 10px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
