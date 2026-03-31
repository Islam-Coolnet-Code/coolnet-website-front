# Color System Audit Report

Generated: 2026-01-14

## Summary

This audit identifies all color usage in the codebase that doesn't follow the centralized Coolnet brand color system.

## Categories

### 1. ✅ Acceptable Non-Brand Colors (Semantic/UI Colors)

These colors serve specific UI purposes and should remain as-is:

#### Error/Validation States (Red)
- **Purpose**: Form validation, error messages
- **Files**:
  - `src/components/order/PersonalInfoStep.tsx` - Validation error messages
  - `src/components/order/AddressStep.tsx` - Form field errors
  - `src/components/order/PlanSelectionStep.tsx` - Plan selection errors
  - `src/pages/qrcodepromotion/Qrcodepromotion.tsx` - Form validation
  - `src/components/ui/payment-result-popup.tsx` - Payment error states
  - `src/pages/dealers/Dealers.tsx` - Error messages
- **Usage**: `text-red-400`, `border-red-500`, `bg-red-500`
- **Recommendation**: Keep as-is (semantic color for errors)

#### Success States (Green)
- **Files**:
  - `src/pages/ActivateService.tsx` - Success indicators
  - `src/components/ui/payment-result-popup.tsx` - Payment success
- **Usage**: `text-green-700`, `border-green-400`, `bg-gradient-to-r from-green-500`
- **Recommendation**: Keep as-is (semantic color for success)

#### Warning States (Yellow)
- **Files**:
  - `src/components/order/NewLineLayout.tsx` - Dev mode warning
  - `src/components/order/ReviewStep.tsx` - Router selection highlight
  - `src/components/order/DuplicateUserSection.tsx` - Action button
- **Usage**: `bg-yellow-500/20`, `border-yellow-400`, `bg-yellow-50`
- **Recommendation**: Keep as-is (semantic color for warnings)

### 2. ⚠️ Should Update to Coolnet Colors

These colors should be replaced with the Coolnet brand system:

#### Purple Used Inconsistently
**File**: `src/pages/SpeedTest.tsx`
- **Line 264-265**: Jitter card icon
  ```tsx
  <div className="bg-purple-500/20">
    <Activity className="text-purple-400" />
  ```
- **Should be**: Use coolnet purple variants
- **Recommendation**: Update to `bg-coolnet-purple-light/20` and `text-coolnet-purple-lighter`

**File**: `src/components/order/ReviewStep.tsx`
- **Line 156**: Address section background
  ```tsx
  <div className="p-4 rounded-lg border bg-purple-50">
  ```
- **Recommendation**: Update to `bg-coolnet-purple/10`

**File**: `src/utils/Plans/Plans.ts`
- **Lines 73, 134**: Plan color property
  ```typescript
  color: 'bg-purple-600',
  ```
- **Recommendation**: Update to `bg-coolnet-purple`

#### Blue Used Inconsistently
**File**: `src/utils/Plans/Plans.ts`
- **Line 95**: Plan color
  ```typescript
  color: 'bg-blue-500',
  ```
- **Recommendation**: Update to `bg-coolnet-purple` (jetFiber-blue maps to purple)

**File**: `src/pages/qrcodepromotion/Qrcodepromotion.tsx`
- **Multiple lines**: Background gradients using standard blue
  ```tsx
  className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
  className="bg-gradient-to-r from-blue-500/30 via-blue-400/35 to-blue-600/30"
  ```
- **Recommendation**: Update to coolnet-purple variants

**File**: `src/components/SpeedTestSection.tsx`
- **Line 90**: Card background
  ```tsx
  className="bg-gradient-to-br from-blue-900/40 via-slate-800/50 to-blue-950/60"
  ```
- **Recommendation**: Update to `from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60`

**File**: `src/pages/business/Business.tsx`
- **Lines 148, 236**: Card backgrounds
- **Recommendation**: Update to coolnet-purple variants

**File**: `src/components/order/ReviewStep.tsx`
- **Lines 183-184**: Plan details section
  ```tsx
  className="bg-blue-50"
  className="text-blue-800"
  ```
- **Recommendation**: Update to `bg-coolnet-purple/10` and `text-coolnet-purple-dark`

**File**: `src/components/Header/MobileMenu.tsx`
- **Lines 213, 222**: Language selector active states
  ```tsx
  className="border-jetFiber-blue bg-blue-50 text-jetFiber-blue"
  ```
- **Recommendation**: Update to `bg-coolnet-purple/10`

#### Orange Used Inconsistently
**File**: `src/pages/qrcodepromotion/Qrcodepromotion.tsx`
- **Multiple lines**: Using standard orange instead of coolnet-orange
  ```tsx
  className="bg-gradient-to-r from-orange-500/40 via-orange-400/45 to-orange-600/40"
  className="from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  ```
- **Recommendation**: Update to use `coolnet-orange` variants

**File**: `src/components/Plan.tsx`
- **Line 254**: Best value button
  ```tsx
  className="bg-gradient-to-r from-jetFiber-orange to-orange-500"
  ```
- **Recommendation**: Already uses jetFiber-orange (maps to coolnet), but update the `to-orange-500` part

**File**: `src/components/order/NewLineLayout.tsx`
- **Line 123**: Icon background
  ```tsx
  className="bg-gradient-to-br from-jetFiber-orange to-orange-500"
  ```
- **Recommendation**: Update to `from-coolnet-orange to-coolnet-orange-light`

**File**: `src/components/LanguageSelectionModal.tsx`
- **Lines 34-35**: Decorative gradients
- **Recommendation**: Update to coolnet brand colors

#### Links and Interactive Elements
**File**: `src/pages/NotFound.tsx`
- **Line 19**: Link color
  ```tsx
  className="text-blue-500 hover:text-blue-700"
  ```
- **Recommendation**: Update to `text-coolnet-purple hover:text-coolnet-purple-dark`

### 3. 🔍 RGBA Values (Inline Styles)

These hardcoded RGBA values should ideally use Tailwind opacity modifiers:

**File**: `src/pages/qrcodepromotion/Qrcodepromotion.tsx`
- **Lines 99-106**: Box-shadow with hardcoded rgba
  ```css
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1),
              0 0 30px rgba(59, 130, 246, 0.1),
              0 0 45px rgba(249, 115, 22, 0.1);
  ```
- **Recommendation**: Consider using Tailwind `shadow-*` utilities

**File**: `src/components/SpeedGauge.tsx`
- **Lines 387-389**: Box-shadow colors
  ```typescript
  boxShadow: testType === 'download' ? '0 0 10px rgba(41, 171, 226, 0.7)' :
             testType === 'upload' ? '0 0 10px rgba(247, 148, 29, 0.7)' :
             '0 0 10px rgba(148, 163, 184, 0.5)'
  ```
- **Recommendation**: Update to use Coolnet brand colors in rgba format

**File**: `src/components/Header/HeaderMobile.tsx`
- **Lines 52, 66**: Background color
  ```typescript
  backgroundColor: `rgba(255, 255, 255, 0.2)`
  ```
- **Recommendation**: Can stay as-is (white overlay)

**File**: `src/components/Plan.tsx`
- **Line 191**: Striped pattern background
  ```tsx
  className="bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.2)...)]"
  ```
- **Recommendation**: Can stay as-is (white pattern overlay)

### 4. 📊 Summary by Priority

#### High Priority (Brand Identity)
- Update all blue/purple usage in main sections to coolnet-purple
- Update all orange usage in CTA buttons to coolnet-orange
- Fix Plans.ts color properties

#### Medium Priority (Consistency)
- Update QR promotion page colors
- Update business page card backgrounds
- Update language selector colors

#### Low Priority (Optional)
- Consider replacing inline rgba() with Tailwind utilities
- Standardize box-shadow colors

## Recommended Action Items

1. **Immediate**: Update `src/utils/Plans/Plans.ts` color properties
2. **Immediate**: Fix SpeedTest.tsx jitter card colors
3. **High Priority**: Update all QR promotion page gradients
4. **High Priority**: Update business/feature section backgrounds
5. **Medium Priority**: Review and update form section backgrounds
6. **Low Priority**: Consider refactoring inline RGBA values

## Files Requiring Updates

### Critical (Brand Identity)
1. `src/utils/Plans/Plans.ts` - Plan color definitions
2. `src/pages/SpeedTest.tsx` - Jitter card colors
3. `src/pages/qrcodepromotion/Qrcodepromotion.tsx` - All gradients
4. `src/components/SpeedTestSection.tsx` - Card background
5. `src/pages/business/Business.tsx` - Card backgrounds
6. `src/components/Plan.tsx` - Button gradients

### Medium Priority
7. `src/components/order/ReviewStep.tsx` - Section backgrounds
8. `src/components/Header/MobileMenu.tsx` - Language selector
9. `src/components/LanguageSelectionModal.tsx` - Decorative elements
10. `src/components/order/NewLineLayout.tsx` - Icon backgrounds

### Low Priority (Semantic Colors - OK to keep)
- All error/validation red colors
- All success green colors
- All warning yellow colors

## Color Mapping Reference

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `blue-500`, `blue-900` | `coolnet-purple` | Primary backgrounds |
| `purple-600` | `coolnet-purple` | Accent elements |
| `orange-500` | `coolnet-orange` | CTA buttons |
| `blue-50` | `coolnet-purple/10` | Light backgrounds |
| `orange-50` | `coolnet-orange/10` | Light accents |

## Notes

- **Keep all semantic colors**: Red (errors), Green (success), Yellow (warnings)
- **jetFiber colors**: Already map to coolnet colors in tailwind.config
- **White/Gray/Black**: Can remain unchanged (neutral colors)
- **Opacity modifiers**: Prefer Tailwind opacity (e.g., `/10`, `/20`) over rgba()
