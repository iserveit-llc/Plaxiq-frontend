module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        canvas:   '#07090F',
        surface:  '#0D1117',
        elevated: '#131920',
        overlay:  '#1A2332',
        border:   'rgba(255,255,255,0.07)',
        border2:  'rgba(255,255,255,0.12)',
        brand: {
          blue:  '#3B82F6',
          teal:  '#22D3EE',
        }
      }
    }
  },
  plugins: []
};
