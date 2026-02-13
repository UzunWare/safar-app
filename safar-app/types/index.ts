/**
 * Safar Type Definitions
 */

// User authentication state
export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// User preferences
export interface UserPreferences {
  transliteration: boolean;
  autoPlayAudio: boolean;
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
}

// Learning content types — use imports from '@/types/supabase.types' instead.
// Database-layer types (Pathway, Unit, Lesson, Word, Root, WordRoot) are
// defined in supabase.types.ts and are the single source of truth.
// Re-exported here for convenience:
export type {
  Pathway,
  Unit,
  Lesson,
  Word,
  Root,
  WordRoot,
  PathwayWithUnits,
  UserLessonProgress,
  UserLessonProgressInsert,
  UserProfile,
  FrequencyWordExample,
} from './supabase.types';

// Progress tracking
export type { LearningState } from '@/lib/utils/learningState';

export interface UserProgress {
  userId: string;
  wordId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
  isSynced: boolean;
  updatedAt: string;
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakFreezeUsedThisWeek: boolean;
}

export interface UserXP {
  userId: string;
  totalXp: number;
  level: string;
}

// Quiz
export interface QuizQuestion {
  id: string;
  wordId: string;
  type: 'multiple-choice' | 'concept';
  question: string;
  options: QuizOption[];
  correctId: string;
}

export interface QuizOption {
  id: string;
  text: string;
  arabic?: string;
}

// Lesson Quiz (for root lessons and other interactive lessons)
export interface LessonQuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export type LessonType = 'word' | 'root' | 'frequency';

// Navigation
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  onboarding: undefined;
  'lesson/[id]': { id: string };
  'frequency-lesson/[id]': { id: string };
  'root-lesson/[id]': { id: string };
  'root-detail/[id]': { id: string };
  'quiz/[lessonId]': { lessonId: string };
  'review/session': undefined;
};
