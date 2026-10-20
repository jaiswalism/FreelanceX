import { friendlyPurpleColors, darkColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, radii } from './spacing';

export { friendlyPurpleColors, darkColors, typography, spacing, radii };
export type { ThemeColors };

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
}

export const defaultTheme: Theme = {
  isDark: false,
  colors: friendlyPurpleColors,
  typography,
  spacing,
  radii,
};
