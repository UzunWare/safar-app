/**
 * Safar Typography - "Divine Geometry" Design System
 * Source: prototype/prototype.jsx
 *
 * Font Stack:
 * - Amiri: Arabic text and display
 * - Fraunces: English headings
 * - Outfit: UI text, body copy
 */

export const fonts = {
  amiri: 'Amiri', // Arabic text
  fraunces: 'Fraunces', // Headings
  outfit: 'Outfit', // UI/Body
} as const;

// Font weights available
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Typography scale - maps to Tailwind classes
export const typography = {
  // Arabic Display
  arabicHero: {
    fontFamily: fonts.amiri,
    fontSize: 72, // text-7xl
    lineHeight: 1.8,
  },
  arabicLarge: {
    fontFamily: fonts.amiri,
    fontSize: 48, // text-5xl
    lineHeight: 1.8,
  },
  arabicMedium: {
    fontFamily: fonts.amiri,
    fontSize: 36, // text-4xl
    lineHeight: 1.8,
  },
  arabicSmall: {
    fontFamily: fonts.amiri,
    fontSize: 24, // text-2xl
    lineHeight: 1.8,
  },

  // Headings - Fraunces
  headingXl: {
    fontFamily: fonts.fraunces,
    fontSize: 48, // text-5xl
    fontWeight: fontWeights.semibold,
  },
  headingLg: {
    fontFamily: fonts.fraunces,
    fontSize: 36, // text-4xl
    fontWeight: fontWeights.medium,
  },
  headingMd: {
    fontFamily: fonts.fraunces,
    fontSize: 30, // text-3xl
    fontWeight: fontWeights.medium,
  },
  headingSm: {
    fontFamily: fonts.fraunces,
    fontSize: 24, // text-2xl
    fontWeight: fontWeights.regular,
  },
  headingXs: {
    fontFamily: fonts.fraunces,
    fontSize: 20, // text-xl
    fontWeight: fontWeights.regular,
  },

  // Body - Outfit
  bodyLg: {
    fontFamily: fonts.outfit,
    fontSize: 20, // text-xl
    fontWeight: fontWeights.light,
  },
  bodyMd: {
    fontFamily: fonts.outfit,
    fontSize: 18, // text-lg
    fontWeight: fontWeights.regular,
  },
  bodySm: {
    fontFamily: fonts.outfit,
    fontSize: 14, // text-sm
    fontWeight: fontWeights.regular,
  },
  bodyXs: {
    fontFamily: fonts.outfit,
    fontSize: 12, // text-xs
    fontWeight: fontWeights.regular,
  },

  // Labels
  label: {
    fontFamily: fonts.outfit,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontFamily: fonts.outfit,
    fontSize: 10,
    fontWeight: fontWeights.regular,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;
