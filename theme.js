window.tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            colors: {
                earth: {
                    50: '#f8f3f0', // Slightly warmer/richer
                    100: '#efe5df',
                    200: '#dfcec5',
                    300: '#cfb0a0',
                    400: '#bf8e78',
                    500: '#b06f54', // Richer soil color
                    600: '#a35a40',
                    700: '#884733',
                    800: '#713d2f',
                    900: '#5c3329',
                    950: '#2d1b15', // Deep Loam / Soil Base
                },
                leaf: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d', // Deep organic green
                    800: '#166534',
                    900: '#14532d',
                },
                dark: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#334155',
                    card: '#1e293b',
                },
                news: {
                    paper: '#fdfbf7',
                    ink: '#1a1a1a',
                    accent: '#c0392b'
                }
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(34, 197, 94, 0.6)',
                'glow-lg': '0 0 40px rgba(34, 197, 94, 0.7)',
                'neon': '0 0 15px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4)',
                'card': '0 15px 35px -5px rgba(0, 0, 0, 0.12), 0 5px 15px -3px rgba(0, 0, 0, 0.05)',
                'card-hover': '0 30px 60px -10px rgba(22, 101, 52, 0.25)',
                'depth': '0 35px 60px -15px rgba(0, 0, 0, 0.35)',
                'depth-lg': '0 50px 100px -20px rgba(0, 0, 0, 0.45)',
                'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
            },
            backgroundImage: {
                'organic-gradient': 'linear-gradient(135deg, #fdfbf7 0%, #f4ece8 100%)',
                'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
            },
            animation: {
                'page-enter': 'pageEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'content-show': 'contentShow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ticker': 'ticker 30s linear infinite',

                // Cinematic Intro Animations
                'grow-up': 'growUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'accel-drop': 'accelDrop 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.335) forwards',
                'camera-shake': 'cameraShake 0.4s cubic-bezier(.36,.07,.19,.97) both',
                'shockwave-ring': 'shockwaveRing 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) forwards',
                'elastic-scale': 'elasticScale 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'flash-fade': 'flashFade 0.3s ease-out forwards',
            },
            keyframes: {
                pageEnter: {
                    '0%': { opacity: '0', transform: 'scale(0.98) translateY(12px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                contentShow: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                ticker: {
                    '0%': { transform: 'translateX(100vw)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                growUp: {
                    '0%': { transform: 'translateY(100%) scale(0.8)', opacity: '0' },
                    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                },
                accelDrop: {
                    '0%': { transform: 'translateY(-300px) scale(0.5)', opacity: '0' },
                    '20%': { opacity: '1' },
                    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
                },
                cameraShake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
                },
                shockwaveRing: {
                    '0%': { transform: 'scale(0.5)', opacity: '0.8', borderWidth: '40px' },
                    '100%': { transform: 'scale(3)', opacity: '0', borderWidth: '0px' },
                },
                elasticScale: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                flashFade: {
                    '0%': { backgroundColor: 'white', opacity: '1' },
                    '100%': { backgroundColor: 'transparent', opacity: '0' },
                }
            }
        },
    },
}
