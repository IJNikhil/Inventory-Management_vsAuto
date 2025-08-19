// src/theme.ts

export const lightColors = {
  background: '#ffffff',
  foreground: '#000000',
  card: '#f8fafc',
  cardForeground: '#1e293b',
  popover: '#f8fafc',
  popoverForeground: '#0f172a',
  primary: '#4f46e5',
  primaryForeground: '#ffffff',
  // primaryBackground: '#f0fdfa',
    primaryBackground: '#c3e3dbff',

  secondary: '#64748b',
  secondaryForeground: '#ffffff',
  accent: '#facc15',
  accentForeground: '#1e293b',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  muted: '#e2e8f0',
  mutedForeground: '#475569',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#1485b9ff',
};

export const darkColors = {
  background: '#1a1a1a',           // Softer dark gray instead of harsh blue-black
  foreground: '#e4e4e7',           // Softer white, less harsh contrast
  card: '#262626',                 // Warm dark gray for cards
  cardForeground: '#e4e4e7',       // Same soft foreground
  popover: '#262626',              // Consistent with card
  popoverForeground: '#e4e4e7',    // Consistent foreground
  primary: '#22d3ee',              // Softer cyan, less saturated teal
  primaryForeground: '#1a1a1a',    // Dark background color for contrast
  primaryBackground: '#164e63',     // Muted dark cyan background
  secondary: '#71717a',            // Softer gray
  secondaryForeground: '#e4e4e7',  // Consistent foreground
  accent: '#fbbf24',               // Slightly muted yellow-orange
  accentForeground: '#1a1a1a',     // Dark for contrast
  destructive: '#f87171',          // Softer red, less harsh
  destructiveForeground: '#1a1a1a', // Dark for contrast
  muted: '#404040',                // Softer muted gray
  mutedForeground: '#a1a1aa',      // Softer muted text
  border: '#404040',               // Same as muted for consistency
  input: '#404040',                // Consistent input styling
  ring: '#22d3ee',                 // Same as primary for focus rings
};

// ✅ Simple any type to avoid TypeScript issues
export const theme: any = {
  light: {
    colors: lightColors,
  },
  dark: {
    colors: darkColors,
  },
};

export type Colors = typeof lightColors;
export type Theme = any;
export type ThemeMode = 'light' | 'dark' | 'system';
