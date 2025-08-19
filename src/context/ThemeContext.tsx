// src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { theme, Theme, ThemeMode, Colors } from '../theme';

interface ThemeContextValue {
  theme: Theme;
  currentTheme: Theme;
  colors: Colors;
  mode: ThemeMode;
  themeMode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  // Determine the actual theme
  const isDark = mode === 'system' 
    ? systemColorScheme === 'dark'
    : mode === 'dark';

  // ✅ Type assertion to fix the union type issue
  const currentTheme: Theme = isDark ? theme.dark as Theme : theme.light as Theme;
  const colors: Colors = currentTheme.colors;

  // Toggle between light -> dark -> system -> light
  const toggleTheme = () => {
    setMode(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  // Alias for setMode (for backward compatibility)
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Update StatusBar when theme changes
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  const value: ThemeContextValue = {
    theme: currentTheme,
    currentTheme,
    colors,
    mode,
    themeMode: mode,
    isDark,
    setMode,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Convenience hook for colors only
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

// Convenience hook for isDark
export function useIsDark() {
  const { isDark } = useTheme();
  return isDark;
}
