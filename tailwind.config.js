const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'mixins/**/*.js', 'plugins/**/*.js'],
  theme: {
    extend: {
      screens: {
        short: { raw: '(max-height: 500px)' }
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'bg-hover': 'rgb(var(--color-bg-hover) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'bg-toggle': 'rgb(var(--color-bg-toggle) / <alpha-value>)',
        'bg-toggle-selected': 'rgb(var(--color-bg-toggle-selected) / <alpha-value>)',
        'track-cursor': 'rgb(var(--color-track-cursor) / <alpha-value>)',
        track: 'rgb(var(--color-track) / <alpha-value>)',
        'track-buffered': 'rgb(var(--color-track-buffered) / <alpha-value>)',
        accent: '#1ad691',
        'accent-muted': '#15b87d',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        successDark: '#3b8a3e',
        warning: '#FB8C00'
      },
      cursor: {
        none: 'none'
      },
      fontFamily: {
        sans: ['Source Sans Pro', ...defaultTheme.fontFamily.sans],
        mono: ['Ubuntu Mono', ...defaultTheme.fontFamily.mono]
      },
      fontSize: {
        '1.5xl': '1.375rem',
        xxs: '0.625rem'
      },
      spacing: {
        18: '4.5rem'
      },
      height: {
        18: '4.5rem'
      },
      maxWidth: {
        24: '6rem'
      },
      minWidth: {
        4: '1rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem'
      },
      minHeight: {
        12: '3rem'
      },
      borderRadius: {
        'card': '12px',
        'sheet': '16px',
        'btn': '8px'
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)'
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms'
      },
      zIndex: {
        'bottom-nav': '40',
        'appbar': '45',
        'sheet': '50',
        'scrim': '49',
        'toast': '60'
      }
    }
  },
  plugins: []
}
