// src/theme/index.ts

import { lightColors, darkColors, Colors } from './colors';

export const theme = {
  light: {
    colors: lightColors,
  },
  dark: {
    colors: darkColors,
  },
} as const;

export type Theme = typeof theme.light;
export type ThemeMode = 'light' | 'dark' | 'system';

export { lightColors, darkColors };
export type { Colors };
