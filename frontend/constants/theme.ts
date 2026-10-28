export const COLORS = {
  // Brand colors from UI showcase
  primary: '#2563EB',         // Vibrant Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',       // Emerald Teal
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',          // Warm Amber
  accentLight: '#FEF3C7',
  
  // Neutrals & Surfaces
  text: '#1F2937',            // Dark Charcoal / Slate
  textMuted: '#6B7280',       // Muted Gray
  textLight: '#9CA3AF',       // Light Gray Text
  background: '#FFFFFF',
  backgroundMuted: '#F9FAFB',
  backgroundSubtle: '#F3F4F6',
  sidebarBg: '#111827',       // Deep Dark Navy
  sidebarActiveBg: '#1F2937', // Active item background
  sidebarBorder: '#1F2937',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Feedback states
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#ECFDF5',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
};

export const FONTS = {
  h1: { fontSize: 32, fontWeight: '700' as const, color: COLORS.text, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600' as const, color: COLORS.text, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, color: COLORS.text, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, color: COLORS.text, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, color: COLORS.text, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, color: COLORS.text, lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400' as const, color: COLORS.textMuted, lineHeight: 20 },
  smallMedium: { fontSize: 14, fontWeight: '500' as const, color: COLORS.text, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: COLORS.textMuted, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, color: COLORS.textMuted, lineHeight: 16 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};
