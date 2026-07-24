/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ism: {
          // Cores Institucionais e Neutras
          papyrus: '#FAFAFA',      // Fundo Neutro Suave
          dark:    '#18181B',      // Grafite Governança (Texto Principal / Dark Surface)
          card:    '#FFFFFF',      // Superfície de Cards
          border:  '#E4E4E7',      // Bordas Sutis

          // Paleta dos 4 Pilares Estratégicos
          education: {
            DEFAULT: '#1E3A8A',    // Pilar 1: Educação (Azul Sabedoria)
            light:   '#DBEAFE',
            hover:   '#172554',
          },
          social: {
            DEFAULT: '#D97706',    // Pilar 2: Social (Amarelo Humanidade)
            light:   '#FEF3C7',
            hover:   '#B45309',
          },
          environment: {
            DEFAULT: '#15803D',    // Pilar 3: Meio Ambiente (Verde Bioma)
            light:   '#DCFCE7',
            hover:   '#14532D',
          },
          culture: {
            DEFAULT: '#C2410C',    // Pilar 4: Cultura (Terracota Raízes)
            light:   '#FFEDD5',
            hover:   '#7C2D12',
          },
        },

        // Backward compatibility aliases
        papyrus: '#FAFAFA',
        dark:    '#18181B',

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

        pillar: {
          education:   '#1E3A8A',
          social:      '#D97706',
          environment: '#15803D',
          culture:     '#C2410C',
        },

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
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'var(--font-plus-jakarta)', 'sans-serif'], // Títulos (H1, H2, H3, Logotipo)
        body:    ['Inter', 'var(--font-inter)', 'sans-serif'],                      // Textos, Botões, Tabelas
        sans:    ['Inter', 'var(--font-inter)', 'sans-serif'],
      },
      spacing: {
        // Proporção Áurea / Fibonacci Scale para paddings e margins
        'phi-sm':  '0.8rem',   // 13px
        'phi-md':  '1.3rem',   // 21px
        'phi-lg':  '2.1rem',   // 34px
        'phi-xl':  '3.4rem',   // 55px
        'phi-2xl': '5.5rem',  // 89px
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
