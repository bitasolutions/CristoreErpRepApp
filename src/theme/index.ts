export const lightColors = {
  primary: '#006A64',
  primaryLight: '#E0F2F0',
  background: '#F4F8F7',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF4F2',
  border: '#D6E4E1',
  text: '#1A1A1A',
  textMuted: '#6B7B79',
  subChip: '#92400E',
  subChipBg: '#FEF3C7',
  subChipBorder: '#F59E0B',
  error: '#B00020',
  success: '#2E7D32',
  warning: '#C2410C',
};

export const darkColors: typeof lightColors = {
  primary: '#60D5CB',
  primaryLight: '#0D2926',
  background: '#101514',
  surface: '#1A2220',
  surfaceVariant: '#222D2B',
  border: '#2A3533',
  text: '#E8ECEB',
  textMuted: '#8FA8A5',
  subChip: '#FCD34D',
  subChipBg: '#451A03',
  subChipBorder: '#D97706',
  error: '#CF6679',
  success: '#81C784',
  warning: '#FF9E57',
};

export type AppColors = typeof lightColors;
