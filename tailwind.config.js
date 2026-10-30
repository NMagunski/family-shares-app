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
        'eco-lowest': 'var(--eco-lowest)',
        'eco-low': 'var(--eco-low)',
        'eco-highest': 'var(--eco-highest)',
        'eco-error': 'var(--eco-error)',
        'eco-error-container': 'var(--eco-error-container)',
        'eco-outline': 'var(--eco-outline)',
        'eco-on': 'var(--eco-on)',
        'eco-secondary': 'var(--eco-secondary)',
        'eco-gold': 'var(--eco-gold)',
        'eco-surface': 'var(--eco-surface)',
        'eco-surface-soft': 'var(--eco-surface-soft)',
        'eco-border': 'var(--eco-border)',
        'eco-accent': 'var(--eco-accent)',        // emerald-400
        'eco-accent-strong': 'var(--eco-accent-strong)', // emerald-600
        'eco-text': 'var(--eco-text)',
        'eco-text-muted': 'var(--eco-text-muted)',
      },
      borderRadius: {
        '2xl': '0.75rem',
      },
      boxShadow: {
        'eco-soft': '0 10px 30px rgba(23,63,48,0.07)',
      },
    },
  },
  plugins: [],
};
