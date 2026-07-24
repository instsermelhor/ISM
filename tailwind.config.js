/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        // ── Brand background
        papyrus: '#FAFAFA',
        dark:    '#18181B',

        // ── Legacy brand (green — keep for admin compatibility)
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },

        // ── 4 Institutional Pillars
        pillar: {
          education:   '#1E3A8A',  // deep navy blue
          social:      '#D97706',  // amber
          environment: '#15803D',  // forest green
          culture:     '#C2410C',  // rust orange-red
        },

        // ── Pillar shades (for hover, bg tints)
        'pillar-edu': {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#1E3A8A',
          700: '#1e40af',
          900: '#1e3a8a',
        },
        'pillar-soc': {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#D97706',
          700: '#b45309',
          900: '#78350f',
        },
        'pillar-env': {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#15803D',
          700: '#15803d',
          900: '#14532d',
        },
        'pillar-cul': {
          50:  '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#C2410C',
          700: '#c2410c',
          900: '#7c2d12',
        },

        // ── Secondary (grey scale)
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'slow-zoom':     'slow-zoom 30s ease-in-out infinite alternate',
        'fade-in':       'fade-in 0.7s ease-out both',
        'slide-up':      'slide-up 0.7s ease-out both',
        'float':         'float 6s ease-in-out infinite',
        'pulse-slow':    'pulse-slow 3s ease-in-out infinite',
        'count-up':      'count-up 1.2s ease-out both',
        'pillar-reveal': 'pillar-reveal 0.5s ease-out both',
      },
      keyframes: {
        'slow-zoom': {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.15)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pillar-reveal': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'pillar-edu-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #3b82f6 100%)',
        'pillar-soc-gradient': 'linear-gradient(135deg, #D97706 0%, #fbbf24 100%)',
        'pillar-env-gradient': 'linear-gradient(135deg, #15803D 0%, #22c55e 100%)',
        'pillar-cul-gradient': 'linear-gradient(135deg, #C2410C 0%, #f97316 100%)',
      },
    },
  },
  plugins: [],
}
