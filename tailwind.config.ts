import plugin from 'tailwindcss/plugin';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'tara-joy': '#FFD700',
        'tara-anger': '#FF4444',
        'tara-sadness': '#4A90E2',
        'tara-fear': '#9B59B6',
        'tara-trust': '#2ECC71',
        'tara-bg-dark': '#0c0414',
        'tara-glass': 'rgba(255,255,255,0.1)',
        'tara-glass-border': 'rgba(255,255,255,0.2)'
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'monospace']
      },
      backdropBlur: {
        xl: '20px',
        '2xl': '30px',
        '3xl': '40px'
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' }
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function ({ addComponents }) {
      addComponents({
        '.glass': {
          'backdrop-filter': 'blur(8px)',
          'background-color': 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)'
        },
        '.glass-border': {
          border: '1px solid rgba(255,255,255,0.12)'
        }
      });
    })
  ]
};

export default config;
