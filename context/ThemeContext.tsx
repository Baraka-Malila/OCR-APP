import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { useThemeColors } from '../constants/theme';

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  colors: ReturnType<typeof useThemeColors>;
  toggleColorScheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  colors: useThemeColors('light'),
  toggleColorScheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme);
  const colors = useThemeColors(colorScheme);

  useEffect(() => {
    setColorScheme(systemColorScheme);
  }, [systemColorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, colors, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 