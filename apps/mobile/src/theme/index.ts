import { darkColors, lightColors, ThemeColors } from './colors.js';
import { typography } from './typography.js';
import { spacing, radii } from './spacing.js';

export { darkColors, lightColors, typography, spacing, radii };
export type { ThemeColors };

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
}

export const defaultTheme: Theme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  radii,
};
