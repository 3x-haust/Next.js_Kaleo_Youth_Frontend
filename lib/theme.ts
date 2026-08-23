export const theme = {
  colors: {
    ink: '#111827',
    body: '#3F4654',
    muted: '#6B7280',
    faint: '#9CA3AF',

    primary: '#14304F',
    primarySoft: '#24507C',
    primaryTint: '#EEF3F9',

    accent: '#D98A2B',
    accentSoft: '#FBF3E6',

    bg: '#FFFFFF',
    bgSoft: '#F7F8FA',
    bgDeep: '#0E2138',

    line: '#E5E7EB',
    lineSoft: '#F0F1F4',

    danger: '#C0392B',
    success: '#1E7A4B',
    white: '#FFFFFF',
  },

  overlay: {
    hero: 'linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.25))',
    banner: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.15))',
    card: 'linear-gradient(rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.65))',
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '999px',
  },

  shadow: {
    sm: '0 1px 2px rgba(16, 24, 40, 0.05)',
    md: '0 4px 16px rgba(16, 24, 40, 0.08)',
    lg: '0 12px 32px rgba(16, 24, 40, 0.12)',
  },

  layout: {
    maxWidth: '1160px',
    narrowWidth: '820px',
    gutter: '20px',
    headerHeight: '68px',
  },

  font: {

    sans: `'Paperlogy', -apple-system, BlinkMacSystemFont,
      'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', system-ui, sans-serif`,
    display: `'Paperlogy', -apple-system, BlinkMacSystemFont, sans-serif`,
  },

  breakpoint: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  },
} as const;

export type AppTheme = typeof theme;
