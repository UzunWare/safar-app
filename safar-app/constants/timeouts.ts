/**
 * Timeout Constants - Centralized timeout/duration values
 * Prevents magic numbers scattered throughout codebase
 */

export const timeouts = {
  // Authentication & Network
  auth: {
    signUp: 10_000, // 10 seconds
    signIn: 10_000, // 10 seconds
    profileFetch: 5_000, // 5 seconds
    sessionInit: 5_000, // 5 seconds
  },

  // UI Animations & Delays
  ui: {
    bloomAnimation: 300, // Root bloom visualization delay
    errorRedirect: 2_000, // Redirect after error display
    audioErrorClear: 2_000, // Clear audio error state
  },

  // Query Stale Times (TanStack Query)
  query: {
    lessonState: 5 * 60 * 1000, // 5 minutes
    masteredCount: 5 * 60 * 1000, // 5 minutes
    reviewQueue: 60 * 1000, // 1 minute
    wordProgress: 30_000, // 30 seconds
    streak: 2 * 60 * 1000, // 2 minutes
    xp: 2 * 60 * 1000, // 2 minutes
    staticContent: Infinity, // Lessons, Pathways, Roots (never stale)
  },
} as const;

export type TimeoutCategory = keyof typeof timeouts;
