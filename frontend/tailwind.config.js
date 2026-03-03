/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Premium Light Luxury — Indigo SaaS Theme
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        sidebar: {
          50: '#f8fafc',
          700: '#1e293b',
          800: '#141b29',
          900: '#0f1419',
          950: '#0b1220'
        },
        surface: {
          DEFAULT: '#f8fafc',
          light: '#ffffff',
          card: '#ffffff'
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        warning: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37,99,235,0.16)' },
          '50%': { boxShadow: '0 0 30px rgba(37,99,235,0.3)' }
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(37,99,235,0.08)',
        'premium': '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(37,99,235,0.08)',
        'glow-indigo': '0 0 0 1px rgba(37,99,235,0.12), 0 0 20px rgba(37,99,235,0.16)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.5)'
      },
      borderRadius: {
        'card': '20px',
        'button': '12px'
      },
      spacing: {
        '18': '4.5rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
