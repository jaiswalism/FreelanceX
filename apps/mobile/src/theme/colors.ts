export const darkColors = {
  background: {
    app: '#090909',
    primary: '#0B0B0B',
    secondary: '#101010',
    elevated: '#151515',
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
    primary: '#FF6A00',
    strong: '#FF7A00',
    deep: '#D94F00',
    soft: '#FF8A33',
    tint: '#2A160B',
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
    wallet: '#FF6A00',
    escrow: '#FF7A00',
    blockchain: '#A3A3A3',
  },
};

export const lightColors = {
  background: {
    app: '#F6F6F3',
    primary: '#FAFAF8',
    secondary: '#F0F0ED',
    elevated: '#FFFFFF',
  },
  surface: {
    default: '#FFFFFF',
    raised: '#FFFFFF',
    pressed: '#F1F1EE',
    selected: '#FFF0E5',
  },
  border: {
    subtle: '#E8E8E4',
    default: '#DCDCD7',
    strong: '#C8C8C2',
  },
  brand: {
    primary: '#E95700',
    strong: '#D94D00',
    deep: '#B84000',
  },
  text: {
    primary: '#111111',
    secondary: '#5F5F5A',
    tertiary: '#858580',
    disabled: '#B0B0AA',
  },
  semantic: {
    success: '#107E59',
    successBackground: '#E6F8F0',
    warning: '#B87808',
    warningBackground: '#FFF7E6',
    danger: '#D93838',
    dangerBackground: '#FEECEC',
    info: '#5F5F5A',
    infoBackground: '#F0F0ED',
  },
};

export type ThemeColors = typeof darkColors;
