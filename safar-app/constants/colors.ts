/**
 * Safar Color Palette - "Divine Geometry" Design System
 * Source: prototype/prototype.jsx
 *
 * SYNC NOTE: These colors must match tailwind.config.js theme.extend.colors
 */

export const colors = {
  // Primary Colors
  emeraldDeep: '#0f2e28', // Primary background, text on light
  midnight: '#0a1f1b', // Dark backgrounds, modal overlays
  parchment: '#f4f1ea', // Light backgrounds, cards
  gold: '#cfaa6b', // Accent, highlights, CTAs
  cream: '#e8dcc5', // Text on dark backgrounds

  // Extended Palette
  emerald: {
    800: '#0f2e28',
    900: '#0a1f1b',
  },

  // Transparency variants
  white: {
    5: 'rgba(255, 255, 255, 0.05)',
    10: 'rgba(255, 255, 255, 0.10)',
    20: 'rgba(255, 255, 255, 0.20)',
    40: 'rgba(255, 255, 255, 0.40)',
  },

  goldAlpha: {
    10: 'rgba(207, 170, 107, 0.10)',
    20: 'rgba(207, 170, 107, 0.20)',
    30: 'rgba(207, 170, 107, 0.30)',
    solid: '#cfaa6b',
  },

  black: {
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.10)',
    20: 'rgba(0, 0, 0, 0.20)',
    80: 'rgba(0, 0, 0, 0.80)',
  },

  // Difficulty Rating (muted tones that fit Divine Geometry on dark bg)
  rating: {
    again: '#a85454', // Muted garnet — reset/try again
    hard: '#c9943f', // Warm amber — challenging
    good: '#cfaa6b', // Gold — standard positive (matches accent)
    easy: '#5fb39a', // Teal emerald — mastered/easy
  },

  // Frequency Pathway (blue accent — matches prototype from-blue-900 to-slate-900)
  frequency: {
    gradient1: '#1e3a5f',
    gradient2: '#0f172a',
    accent: '#93c5fd',
    accentAlpha10: 'rgba(147, 197, 253, 0.10)',
    accentAlpha20: 'rgba(147, 197, 253, 0.20)',
  },

  // Salah Pathway (emerald gradients for main Quran pathway)
  salah: {
    gradient1: '#165c4a',
    gradient2: '#0a2e24',
    accent: '#a7f3d0', // emerald-300 equivalent
    accentAlpha6: 'rgba(167, 243, 208, 0.06)',
    gradient1Alpha10: 'rgba(22, 92, 74, 0.10)',
    gradient2Alpha15: 'rgba(10, 46, 36, 0.15)',
    gradient2Alpha40: 'rgba(10, 46, 36, 0.40)',
  },
} as const;

export type ColorName = keyof typeof colors;
