/**
 * Coolnet Brand Colors
 * Centralized color definitions based on the Coolnet logo
 *
 * Main Colors:
 * - Purple: Primary brand color from logo
 * - Orange: Secondary accent color from logo
 */

export const COOLNET_COLORS = {
  purple: {
    DEFAULT: '#4a2d6e',
    light: '#7c4dff',
    lighter: '#9d7dff',
    dark: '#3a1d5e',
    darker: '#2a0d4e',
  },
  orange: {
    DEFAULT: '#ff6b35',
    light: '#ff8c42',
    lighter: '#ffa060',
    dark: '#e55520',
    darker: '#cc3d10',
  },
} as const;

// Tailwind class names for easy usage in components
export const COOLNET_TAILWIND_CLASSES = {
  backgrounds: {
    purple: 'bg-coolnet-purple',
    purpleLight: 'bg-coolnet-purple-light',
    purpleLighter: 'bg-coolnet-purple-lighter',
    purpleDark: 'bg-coolnet-purple-dark',
    purpleDarker: 'bg-coolnet-purple-darker',
    orange: 'bg-coolnet-orange',
    orangeLight: 'bg-coolnet-orange-light',
    orangeLighter: 'bg-coolnet-orange-lighter',
    orangeDark: 'bg-coolnet-orange-dark',
    orangeDarker: 'bg-coolnet-orange-darker',
  },
  text: {
    purple: 'text-coolnet-purple',
    purpleLight: 'text-coolnet-purple-light',
    purpleLighter: 'text-coolnet-purple-lighter',
    purpleDark: 'text-coolnet-purple-dark',
    purpleDarker: 'text-coolnet-purple-darker',
    orange: 'text-coolnet-orange',
    orangeLight: 'text-coolnet-orange-light',
    orangeLighter: 'text-coolnet-orange-lighter',
    orangeDark: 'text-coolnet-orange-dark',
    orangeDarker: 'text-coolnet-orange-darker',
  },
  gradients: {
    purpleToOrange: 'bg-gradient-to-r from-coolnet-purple to-coolnet-orange',
    orangeToPurple: 'bg-gradient-to-r from-coolnet-orange to-coolnet-purple',
    purpleLight: 'bg-gradient-to-r from-coolnet-purple-light to-coolnet-purple',
    orangeLight: 'bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light',
    purpleOrangeVertical: 'bg-gradient-to-b from-coolnet-purple to-coolnet-orange',
  },
} as const;
