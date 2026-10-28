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
        'eco-bg': 'var(--eco-bg)',
        'eco-surface': 'var(--eco-surface)',
        'eco-surface-soft': 'var(--eco-surface-soft)',
        'eco-border': 'var(--eco-border)',
        'eco-accent': 'var(--eco-accent)',        // emerald-400
        'eco-accent-strong': 'var(--eco-accent-strong)', // emerald-600
        'eco-text': 'var(--eco-text)',
        'eco-text-muted': 'var(--eco-text-muted)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'eco-soft': '0 10px 30px rgba(23,63,48,0.07)',
      },
    },
  },
  plugins: [],
};
