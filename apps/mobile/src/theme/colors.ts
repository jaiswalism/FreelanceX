export const friendlyPurpleColors = {
  background: {
    app: '#F6F7FB',
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    elevated: '#FFFFFF',
    hero: '#5B4DFF',
    heroGradient: ['#5B4DFF', '#7064FF'],
  },
  surface: {
    default: '#FFFFFF',
    raised: '#FFFFFF',
    pressed: '#F2F4FC',
    selected: '#F0EEFF',
  },
  border: {
    subtle: '#EEF0F8',
    default: '#E3E7F4',
    strong: '#CAD1E5',
  },
  brand: {
    primary: '#5B4DFF',
    strong: '#4A3CEB',
    deep: '#3B2ED0',
    soft: '#7E72FF',
    tint: '#F0EEFF',
    gradientStart: '#5B4DFF',
    gradientEnd: '#7569FF',
  },
  semantic: {
    success: '#10B981',
    successBackground: '#E8FAF3',
    warning: '#F59E0B',
    warningBackground: '#FEF8EA',
    danger: '#EF4444',
    dangerBackground: '#FEECEC',
    info: '#5B4DFF',
    infoBackground: '#F0EEFF',
  },
  text: {
    primary: '#1A1D2E',
    secondary: '#697089',
    tertiary: '#9CA3AF',
    disabled: '#C4C9D9',
    inverse: '#FFFFFF',
  },
  special: {
    verified: '#10B981',
    wallet: '#5B4DFF',
    escrow: '#5B4DFF',
    blockchain: '#697089',
  },
};

export const darkColors = {
  background: {
    app: '#090909',
    primary: '#0B0B0B',
    secondary: '#101010',
    elevated: '#151515',
    hero: '#151515',
    heroGradient: ['#151515', '#202020'],
  },
  surface: {
    default: '#121212',
    raised: '#181818',
    pressed: '#1D1D1D',
    selected: '#21170F',
  },
  border: {
    subtle: '#202020',
    default: '#292929',
    strong: '#383838',
  },
  brand: {
    primary: '#5B4DFF',
    strong: '#4A3CEB',
    deep: '#3B2ED0',
    soft: '#7E72FF',
    tint: '#1C1938',
    gradientStart: '#5B4DFF',
    gradientEnd: '#7569FF',
  },
  semantic: {
    success: '#5EE6B5',
    successBackground: '#0D2119',
    warning: '#F5B942',
    warningBackground: '#241C0C',
    danger: '#FF5C5C',
    dangerBackground: '#250F0F',
    info: '#A3A3A3',
    infoBackground: '#181818',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A3A3A3',
    tertiary: '#737373',
    disabled: '#4A4A4A',
    inverse: '#090909',
  },
  special: {
    verified: '#5EE6B5',
    wallet: '#5B4DFF',
    escrow: '#5B4DFF',
    blockchain: '#A3A3A3',
  },
};

export const lightColors = friendlyPurpleColors;
export type ThemeColors = typeof friendlyPurpleColors;
