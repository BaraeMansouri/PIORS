/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        night: '#07111f',
        deep: '#0b1730',
        cyan: '#39d0ff',
        neon: '#8b5cf6',
        emerald: '#35f0b1',
        alert: '#ff6b81',
        panel: 'rgba(11, 23, 48, 0.62)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(57,208,255,0.18), 0 24px 60px rgba(10, 21, 44, 0.55)',
        neon: '0 0 24px rgba(139,92,246,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        aurora: 'radial-gradient(circle at top left, rgba(57,208,255,0.2), transparent 30%), radial-gradient(circle at top right, rgba(139,92,246,0.22), transparent 25%), linear-gradient(145deg, rgba(7,17,31,0.95), rgba(11,23,48,0.86))',
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(57, 208, 255, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(57, 208, 255, 0.35)' },
        },
      },
    },
  },
  plugins: [],
};