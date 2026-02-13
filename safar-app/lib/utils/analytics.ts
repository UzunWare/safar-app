/**
 * Analytics Utility
 * Wrapper for Mixpanel analytics with consistent event naming
 * Event naming pattern: domain_action_detail (all lowercase with underscores)
 */

import * as Sentry from '@/lib/utils/sentry';

// TODO: Import Mixpanel when configured
// import { Mixpanel } from 'mixpanel-react-native';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

/**
 * Track an analytics event
 * @param event Event name (snake_case)
 * @param properties Event properties (optional)
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  try {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        timestamp: new Date().toISOString(),
        ...properties,
      },
    };

    // TODO: Uncomment when Mixpanel is configured
    // Mixpanel.track(event, eventData.properties);

    // Log to console in development
    if (__DEV__) {
      console.log('[Analytics]', event, eventData.properties);
    }
  } catch (error) {
    // Don't block user experience if analytics fails
    Sentry.captureException(error, {
      level: 'warning',
      tags: { component: 'analytics', event },
    });
  }
}

/**
 * Onboarding Events
 */
export const AnalyticsEvents = {
  // Onboarding funnel
  ONBOARDING_WELCOME_VIEWED: 'onboarding_welcome_viewed',
  ONBOARDING_WELCOME_STARTED: 'onboarding_welcome_started',
  SCRIPT_ASSESSMENT_VIEWED: 'script_assessment_viewed',
  SCRIPT_ASSESSMENT_SELECTED: 'script_assessment_selected',
  SCRIPT_ASSESSMENT_COMPLETED: 'script_assessment_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Learning funnel
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  WORD_LEARNED: 'word_learned',
  ROOT_TAPPED: 'root_tapped',
  QUIZ_ANSWERED: 'quiz_answered',

  // Quiz
  QUIZ_COMPLETED: 'quiz_completed',

  // Root Garden (Explore tab)
  ROOT_GARDEN_VIEWED: 'root_garden_viewed',
  ROOT_SEARCHED: 'root_searched',

  // Engagement
  STREAK_ACHIEVED: 'streak_achieved',
  SUBSCRIPTION_STARTED: 'subscription_started',
} as const;

interface QuizCompletedData {
  lessonId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  flaggedWordIds: string[];
}

/**
 * Track quiz completion event with score details.
 */
export function trackQuizCompleted(data: QuizCompletedData): void {
  trackEvent(AnalyticsEvents.QUIZ_COMPLETED, {
    lesson_id: data.lessonId,
    score: data.score,
    total_questions: data.totalQuestions,
    percentage: data.percentage,
    flagged_word_count: data.flaggedWordIds.length,
    flagged_word_ids: data.flaggedWordIds,
  });
}
