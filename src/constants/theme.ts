/**
 * Merkezi tasarım token'ları. Tüm bileşenler renk/spacing/tipografi için
 * bu dosyayı kullanır; böylece görsel tutarlılık tek yerden yönetilir.
 */

export const colors = {
  primary: '#ff6b35',
  primaryDark: '#e2551f',
  primarySoft: '#fff1ea',

  background: '#f6f7f9',
  surface: '#ffffff',
  surfaceAlt: '#f1f3f5',

  text: '#1a1d1f',
  textMuted: '#6b7280',
  textInverse: '#ffffff',

  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  success: '#16a34a',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  warning: '#d97706',

  favorite: '#ef4444',
  overlay: 'rgba(17, 24, 39, 0.45)',

  skeleton: '#e9ecef',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadow,
} as const;

export type Theme = typeof theme;
