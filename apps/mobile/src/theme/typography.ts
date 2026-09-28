export const typography = {
  fontFamily: {
    primary: 'Inter',
    fallback: 'System',
    numeric: 'JetBrains Mono',
    monospace: 'JetBrains Mono',
  },
  scale: {
    display: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 35.2,
      letterSpacing: -0.8,
    },
    heading1: {
      fontSize: 26,
      fontWeight: '700' as const,
      lineHeight: 31.2,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 27.5,
      letterSpacing: -0.3,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 23.4,
      letterSpacing: -0.1,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22.5,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22.5,
      letterSpacing: 0,
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 16.9,
      letterSpacing: 0.2,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 15.6,
      letterSpacing: 0.3,
    },
    micro: {
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 12,
      letterSpacing: 0.6,
    },
  },
};
