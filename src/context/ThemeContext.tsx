import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSiteSettings } from '@/services/cms';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isLoading: boolean;
}

// Default coolnet colors
const defaultColors: ThemeColors = {
  primary: '#4a2d6e',      // coolnet-purple
  primaryLight: '#7c4dff',  // coolnet-purple-light
  primaryDark: '#3a1d5e',   // coolnet-purple-dark
  secondary: '#ff6b35',     // coolnet-orange
  secondaryLight: '#ff8c42', // coolnet-orange-light
  secondaryDark: '#e55520',  // coolnet-orange-dark
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  isLoading: true,
});

// Helper to get setting value by key
const getSettingValue = (
  settings: Array<{ key: string; valueEn: string | null }> | undefined,
  key: string
): string | null => {
  if (!settings) return null;
  const setting = settings.find(s => s.key === key);
  return setting?.valueEn || null;
};

// Helper to generate lighter/darker shades
const adjustColor = (hex: string, amount: number): string => {
  const clamp = (val: number) => Math.min(255, Math.max(0, val));

  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust each component
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: siteSettings, isLoading } = useSiteSettings();
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  useEffect(() => {
    if (!siteSettings) return;

    // Get theme colors from CMS settings
    const primaryColor = getSettingValue(siteSettings, 'theme_primary_color') || defaultColors.primary;
    const secondaryColor = getSettingValue(siteSettings, 'theme_secondary_color') || defaultColors.secondary;

    // Generate color variants
    const newColors: ThemeColors = {
      primary: primaryColor,
      primaryLight: adjustColor(primaryColor, 60),
      primaryDark: adjustColor(primaryColor, -20),
      secondary: secondaryColor,
      secondaryLight: adjustColor(secondaryColor, 40),
      secondaryDark: adjustColor(secondaryColor, -30),
    };

    setColors(newColors);

    // Apply CSS custom properties to document root
    const root = document.documentElement;
    root.style.setProperty('--coolnet-purple', newColors.primary);
    root.style.setProperty('--coolnet-purple-light', newColors.primaryLight);
    root.style.setProperty('--coolnet-purple-dark', newColors.primaryDark);
    root.style.setProperty('--coolnet-orange', newColors.secondary);
    root.style.setProperty('--coolnet-orange-light', newColors.secondaryLight);
    root.style.setProperty('--coolnet-orange-dark', newColors.secondaryDark);

    // Get font family from CMS (optional)
    const fontFamily = getSettingValue(siteSettings, 'theme_font_family');
    if (fontFamily) {
      root.style.setProperty('--font-family', fontFamily);
    }

  }, [siteSettings]);

  return (
    <ThemeContext.Provider value={{ colors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
