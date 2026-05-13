export const Colors = {
  bg: '#000000',
  surface: '#111111',
  surfaceAlt: '#1C1C1E',
  border: '#2C2C2E',
  accent: '#E8003D',
  accentLight: '#FF2D55',
  text: '#FFFFFF',
  textSub: '#8E8E93',
  textMuted: '#48484A',
  green: '#30D158',
  yellow: '#FFD60A',
  red: '#FF453A',
  orange: '#FF9F0A',
  blue: '#0A84FF',
  purple: '#BF5AF2',
  teal: '#5AC8FA',
  pink: '#FF2D55',
};

export const Fonts = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Badge colour palette — cycles by stop code first letter
export const BADGE_COLORS: Record<string, string> = {
  A: '#0A84FF',
  B: '#30D158',
  C: '#FF9F0A',
  D: '#BF5AF2',
  E: '#FF453A',
  F: '#5AC8FA',
  G: '#FFD60A',
  H: '#FF2D55',
  I: '#64D2FF',
  J: '#0A84FF',
  K: '#30D158',
  L: '#FF9F0A',
  M: '#BF5AF2',
  N: '#FF453A',
  O: '#5AC8FA',
  P: '#FFD60A',
  Q: '#FF2D55',
  R: '#E8003D',
  S: '#64D2FF',
  T: '#0A84FF',
  U: '#30D158',
  V: '#FF9F0A',
  W: '#BF5AF2',
  X: '#FF453A',
  Y: '#5AC8FA',
  Z: '#FFD60A',
};

export function badgeColor(code: string): string {
  const first = (code?.[0] ?? 'A').toUpperCase();
  return BADGE_COLORS[first] ?? Colors.accent;
}
