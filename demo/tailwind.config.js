/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 基础色板
        'bg-black': '#0A0A0A',
        'bg-dark': '#1A1A1A',
        'bg-medium': '#2D2D2D',
        'bg-light': '#3D3D3D',

        'text-white': '#FAFAFA',
        'text-gray': '#9A9A9A',
        'text-dark': '#5A5A5A',

        // Mirror 主题色
        'warm-yellow': '#E8D5B7',
        'gold': '#D4A574',
        'amber': '#C4956A',

        'mirror-deep': '#0a0a0a',
        'mirror-panel': '#1a1a1a',
        'mirror-accent': '#e8d5b7',
        'mirror-gold': '#d4a574',
        'mirror-muted': 'rgba(255, 255, 255, 0.4)',
        'mirror-border': 'rgba(255, 255, 255, 0.08)',
        'mirror-glass': 'rgba(10, 10, 10, 0.4)',

        // 节点色彩
        'node-decision': '#D4A574',
        'node-turning': '#B8A5D0',
        'node-event': '#6B8CAE',
        'node-almost': '#7A7A7A',
        'node-regret': '#AE8B8B',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'PingFang SC', 'Source Han Sans SC', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2' }],
        'title': ['24px', { lineHeight: '1.3' }],
        'subtitle': ['18px', { lineHeight: '1.4' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'caption': ['14px', { lineHeight: '1.5' }],
        'small': ['12px', { lineHeight: '1.4' }],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}