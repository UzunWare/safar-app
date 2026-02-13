/**
 * Safar Spacing Scale - "Divine Geometry" Design System
 * Source: prototype/prototype.jsx
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const borderRadius = {
  none: 0,
  sm: 8, // rounded-lg
  md: 12, // rounded-xl
  lg: 16, // rounded-2xl
  xl: 24, // rounded-3xl
  '2xl': 32, // rounded-[2rem]
  full: 9999, // rounded-full
} as const;
