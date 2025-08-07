import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				'xs': '475px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
		fontFamily: {
			'inter': ['Inter', 'sans-serif'],
			'lato': ['Lato', 'sans-serif'],
			'montserrat': ['Montserrat', 'sans-serif'],
			'open-sans': ['Open Sans', 'sans-serif'],
			'playfair': ['Playfair Display', 'serif'],
		},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					dark: 'hsl(var(--secondary-dark))',
					light: 'hsl(var(--secondary-light))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				neutral: {
					DEFAULT: 'hsl(var(--neutral))',
					foreground: 'hsl(var(--neutral-foreground))'
				},
				// Estados de feedback com melhor contraste
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				// Redes sociais
				whatsapp: 'hsl(var(--whatsapp))',
				facebook: 'hsl(var(--facebook))',
				youtube: 'hsl(var(--youtube))',
				// Gradientes Instagram
				'instagram-start': 'hsl(var(--instagram-start))',
				'instagram-end': 'hsl(var(--instagram-end))'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-warm': 'var(--gradient-warm)',
			},
			boxShadow: {
				'primary': 'var(--shadow-primary)',
				'secondary': 'var(--shadow-secondary)',
				'card': 'var(--shadow-card)',
				'elevated': 'var(--shadow-elevated)',
				'glow-primary': 'var(--glow-primary)',
				'glow-secondary': 'var(--glow-secondary)',
				'glow-success': 'var(--glow-success)',
			},
			borderRadius: {
				'xs': 'var(--radius-sm)', // 8px
				'sm': 'var(--radius-md)', // 12px
				DEFAULT: 'var(--radius)', // 16px
				'lg': 'var(--radius-lg)', // 16px
				'xl': 'var(--radius-xl)', // 20px
				'2xl': '24px',
				'3xl': '32px'
			},
			spacing: {
				'xs': 'var(--spacing-xs)', // 4px
				'sm': 'var(--spacing-sm)', // 8px
				'base': 'var(--spacing-base)', // 16px
				'lg': 'var(--spacing-lg)', // 20px
				'xl': 'var(--spacing-xl)', // 24px
				'2xl': 'var(--spacing-2xl)', // 32px
				'3xl': 'var(--spacing-3xl)', // 40px
				'4xl': 'var(--spacing-4xl)', // 48px
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'gradient-morph': {
					'0%': { backgroundPosition: '0% 50%' },
					'25%': { backgroundPosition: '100% 50%' },
					'50%': { backgroundPosition: '100% 100%' },
					'75%': { backgroundPosition: '0% 100%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(43 94% 48% / 0.3)' },
					'50%': { boxShadow: '0 0 30px hsl(43 94% 48% / 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'typing': {
					'from': { width: '0' },
					'to': { width: '100%' }
				},
				'blink-caret': {
					'from, to': { borderColor: 'transparent' },
					'50%': { borderColor: 'hsl(43 94% 48%)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
				'gradient-morph': 'gradient-morph 15s ease infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'typing': 'typing 3.5s steps(40, end)',
				'blink-caret': 'blink-caret 0.75s step-end infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)',
				'elastic': 'var(--transition-elastic)',
				'micro': 'var(--transition-micro)',
			},
			// Acessibilidade e responsividade aprimoradas
			fontSize: {
				'mobile-xs': ['10px', { lineHeight: '1.4' }],
				'mobile-sm': ['12px', { lineHeight: '1.4' }],
				'mobile-base': ['14px', { lineHeight: '1.5' }],
				'mobile-lg': ['16px', { lineHeight: '1.5' }],
				'mobile-xl': ['18px', { lineHeight: '1.4' }],
				'mobile-2xl': ['20px', { lineHeight: '1.3' }],
				'mobile-3xl': ['24px', { lineHeight: '1.2' }],
			},
			minHeight: {
				'touch': '44px', // Mínimo para alvos de toque
				'screen-mobile': '100dvh', // Altura dinâmica para mobile
			},
			maxWidth: {
				'mobile': '95vw',
				'tablet': '90vw',
				'content': '65ch', // Largura ideal para leitura
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;