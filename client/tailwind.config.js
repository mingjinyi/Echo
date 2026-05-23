/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep ocean blue-black scale — rich, saturated oceanic depths
        echo: {
          50: '#e6eef7',
          100: '#cdddef',
          200: '#9abbd8',
          300: '#6b99c0',
          400: '#4a7fa8',
          500: '#356890',
          600: '#285578',
          700: '#1e4260',
          800: '#153048',
          900: '#0d1f33',
          950: '#061022',
        },
        // Oceanic blue accent — vivid bioluminescent, not muted gray-blue
        accent: {
          50: '#eaf2f9',
          100: '#d4e5f3',
          200: '#a9cce7',
          300: '#7db3db',
          400: '#5b9ed8',
          500: '#458cc8',
          600: '#3575b0',
          700: '#2a5f90',
          800: '#204970',
          900: '#183550',
        },
        // Warm accent — used sparingly, like distant starlight
        warm: {
          50: '#faf7f4',
          100: '#f2ede5',
          200: '#e2d7c8',
          300: '#ccb9a3',
          400: '#b8a089',
          500: '#a08973',
          600: '#85715f',
          700: '#6b5a4b',
          800: '#56483c',
          900: '#3d322a',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-abyss': 'linear-gradient(180deg, #060b14 0%, #0a101f 30%, #0d1628 60%, #0a101f 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(22, 34, 54, 0.9) 0%, rgba(17, 26, 44, 0.95) 100%)',
        'gradient-chat': 'linear-gradient(180deg, #0a101f 0%, #0d1628 50%, #0a101f 100%)',
        'gradient-cta': 'linear-gradient(135deg, #3b5170 0%, #5173a8 50%, #3b5990 100%)',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(0, 0, 0, 0.3)',
        'soft-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 30px rgba(123, 147, 176, 0.08)',
        'glow-lg': '0 0 60px rgba(123, 147, 176, 0.12)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(30, 45, 71, 0.5)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(123, 147, 176, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        // New Echo design system animations
        'echo-breathe': 'echoBreathe 8s ease-in-out infinite',
        'echo-ripple-1': 'echoRipple 14s linear infinite',
        'echo-ripple-2': 'echoRipple 14s linear infinite 3.5s',
        'echo-ripple-3': 'echoRipple 14s linear infinite 7s',
        'echo-ripple-4': 'echoRipple 14s linear infinite 10.5s',
        'bg-drift-1': 'bgDrift1 20s ease-in-out infinite',
        'bg-drift-2': 'bgDrift2 24s ease-in-out infinite',
        'cta-breathe': 'ctaBreathe 4s ease-in-out infinite',
        'cta-ripple': 'ctaRipple 0.8s ease-out',
        'title-glow': 'titleGlow 6s ease-in-out infinite',
        'particle-drift': 'particleDrift 18s linear infinite',
        'return-echo': 'returnEcho 10s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        echoBreathe: {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.5' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' },
        },
        echoRipple: {
          '0%': { transform: 'scale(0.7)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        bgDrift1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(3%, -2%) scale(1.04)' },
          '50%': { transform: 'translate(-2%, 2.5%) scale(1.03)' },
          '75%': { transform: 'translate(-3%, -1%) scale(1.05)' },
        },
        bgDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-3%, 2%) scale(1.05)' },
          '66%': { transform: 'translate(2.5%, -3%) scale(1.03)' },
        },
        ctaBreathe: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(123,147,176,0.2), 0 0 50px rgba(100,140,180,0.1), 0 4px 16px rgba(0,0,0,0.3)' },
          '50%': { boxShadow: '0 0 45px rgba(140,180,220,0.35), 0 0 80px rgba(120,160,200,0.2), 0 4px 24px rgba(0,0,0,0.4)' },
        },
        ctaRipple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(5)', opacity: '0' },
        },
        titleGlow: {
          '0%, 100%': { textShadow: '0 0 30px rgba(140,180,220,0.15), 0 0 80px rgba(123,147,176,0.08)' },
          '50%': { textShadow: '0 0 50px rgba(160,200,240,0.3), 0 0 120px rgba(140,170,210,0.18)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-100vh) translateX(60px)', opacity: '0' },
        },
        particleDriftLeft: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.7' },
          '90%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-100vh) translateX(-50px)', opacity: '0' },
        },
        particleDriftArc: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '15%': { opacity: '0.65' },
          '50%': { transform: 'translateY(-50vh) translateX(30px)', opacity: '0.5' },
          '85%': { opacity: '0.65' },
          '100%': { transform: 'translateY(-100vh) translateX(-20px)', opacity: '0' },
        },
        returnEcho: {
          '0%, 100%': { transform: 'scale(1.2)', opacity: '0.15' },
          '35%': { transform: 'scale(0.85)', opacity: '0.45' },
          '65%': { transform: 'scale(0.85)', opacity: '0.45' },
        },
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
};
