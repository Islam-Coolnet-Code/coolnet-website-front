# Coolnet Color System

This document describes the centralized color system for the Coolnet website, based on the official Coolnet brand colors from the logo.

## Brand Colors

The Coolnet brand has two primary colors:

### Purple (Primary Brand Color)
- **Base**: `#4a2d6e` - Main brand purple from the logo
- **Light**: `#7c4dff` - Lighter variant for accents
- **Lighter**: `#9d7dff` - Even lighter for subtle highlights
- **Dark**: `#3a1d5e` - Darker variant for depth
- **Darker**: `#2a0d4e` - Darkest variant for maximum contrast

### Orange (Secondary/Accent Color)
- **Base**: `#ff6b35` - Main brand orange from the logo
- **Light**: `#ff8c42` - Lighter variant for hover states
- **Lighter**: `#ffa060` - Lighter still for subtle accents
- **Dark**: `#e55520` - Darker variant for depth
- **Darker**: `#cc3d10` - Darkest variant for emphasis

## Using Colors in Your Code

### Tailwind CSS Classes

The colors are available as Tailwind utility classes:

```tsx
// Backgrounds
<div className="bg-coolnet-purple">...</div>
<div className="bg-coolnet-purple-light">...</div>
<div className="bg-coolnet-orange">...</div>
<div className="bg-coolnet-orange-light">...</div>

// Text
<span className="text-coolnet-purple">...</span>
<span className="text-coolnet-orange-light">...</span>

// Borders
<div className="border-coolnet-purple">...</div>

// Gradients
<div className="bg-gradient-to-r from-coolnet-purple to-coolnet-orange">...</div>
<div className="bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light">...</div>
```

### TypeScript Constants

Import colors from the constants file for use in JavaScript/TypeScript:

```typescript
import { COOLNET_COLORS, COOLNET_TAILWIND_CLASSES } from '@/constants/colors';

// Use raw color values
const primaryColor = COOLNET_COLORS.purple.DEFAULT; // '#4a2d6e'

// Use predefined Tailwind class names
const buttonClass = COOLNET_TAILWIND_CLASSES.gradients.orangeLight;
```

## Common Patterns

### Primary Action Buttons
Use orange gradient for primary CTAs:
```tsx
<Button className="bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light hover:from-coolnet-orange-light hover:to-coolnet-orange-dark" />
```

### Background Sections
Use purple gradient for section backgrounds:
```tsx
<section className="bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple" />
```

### Cards and Overlays
Use purple with opacity for glass morphism effects:
```tsx
<div className="bg-coolnet-purple/40 backdrop-blur-sm" />
```

### Icons and Indicators
- Purple icons for informational elements
- Orange icons for action elements
- Green for success states (use default Tailwind green)

## Legacy Support

The old `jetFiber-blue` and `jetFiber-orange` classes are still supported but map to the new Coolnet colors:

- `jetFiber-blue` → `#4a2d6e` (Coolnet purple)
- `jetFiber-orange` → `#ff6b35` (Coolnet orange)

**Recommendation**: Update old code to use the new `coolnet-*` classes for consistency.

## Color Configuration

Colors are defined in:
1. **Tailwind Config**: `tailwind.config.ts` - Main color definitions
2. **Constants File**: `src/constants/colors.ts` - TypeScript constants and utilities

## Best Practices

1. **Consistency**: Always use the centralized color system instead of hardcoded hex values
2. **Accessibility**: Ensure sufficient contrast ratios (WCAG AA minimum)
3. **Semantic Usage**:
   - Purple for branding, backgrounds, navigation
   - Orange for CTAs, hover states, important actions
   - Use opacity modifiers (`/40`, `/60`, `/80`) for subtle backgrounds
4. **Gradients**: Use gradients sparingly for visual interest on key elements
5. **Dark Mode**: The purple variants work well for dark-themed sections

## Examples from the Codebase

### Speed Test Page
```tsx
// Background
className="bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple"

// Action button
className="bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light"

// Result cards
className="bg-coolnet-purple-light/20"
```

### Feature Cards
```tsx
// Card background
className="bg-gradient-to-br from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60"
```

### Business CTA
```tsx
// Background section
className="bg-jetFiber-blue" // Maps to coolnet-purple

// Button
className="bg-jetFiber-orange hover:bg-coolnet-orange-dark" // Uses new hover color
```

## Questions?

If you need additional color variants or have questions about the color system, please consult with the design team to maintain brand consistency.
