# Story 5.5: Push Notifications - Streak Reminders

Status: done

## Story

As a learner,
I want to receive streak reminders,
so that I don't forget to maintain my daily learning habit.

## Acceptance Criteria

1. **Given** I have enabled push notifications, **When** my usual learning time approaches and I haven't learned today, **Then** I receive a notification: "Don't lose your X-day streak!"
2. **Given** it's 1 hour before midnight and I haven't learned, **When** my streak is at risk, **Then** I receive a notification: "Your streak ends in 1 hour!"
3. **Given** I tap the notification, **When** the app opens, **Then** I am deep-linked to the Continue/Review screen
4. **Given** I have disabled notifications, **When** notification time arrives, **Then** no notification is sent

## Tasks / Subtasks

- [x] Task 1: Set up Expo Notifications (AC: #1, #2)
  - [x] Configure expo-notifications in app.json
  - [x] Set up notification permissions request
  - [x] Configure notification handlers

- [x] Task 2: Request notification permissions (AC: #4)
  - [x] Create permission request flow
  - [x] Handle granted/denied states
  - [x] Store permission status in settings

- [x] Task 3: Schedule streak reminder notification (AC: #1)
  - [x] Determine user's typical learning time
  - [x] Schedule notification for that time
  - [x] Include streak count in message

- [x] Task 4: Schedule last-chance notification (AC: #2)
  - [x] Schedule for 1 hour before midnight
  - [x] Check if user has learned today
  - [x] Cancel if already learned

- [x] Task 5: Handle notification tap (AC: #3)
  - [x] Configure deep link handler
  - [x] Navigate to Continue or Review screen
  - [x] Handle app in foreground/background

- [x] Task 6: Cancel notifications after activity (AC: #1, #2)
  - [x] When user completes a lesson/review
  - [x] Cancel any pending streak notifications
  - [x] Reschedule for next day

- [x] Task 7: Respect notification preferences (AC: #4)
  - [x] Check notification_enabled in settings
  - [x] Only schedule if enabled
  - [x] Cancel all if disabled

- [x] Task 8: Limit to 1 notification per day
  - [x] Track last notification sent
  - [x] Don't spam multiple reminders
  - [x] Smart timing based on behavior

## Dev Notes

### Architecture Patterns

- **Expo Notifications**: Unified API for FCM + APNs
- **Local Scheduling**: Notifications scheduled locally
- **Deep Linking**: Navigate directly to relevant screen
- **Respect Preferences**: Honor user settings

### Code Patterns

```typescript
// lib/hooks/useNotifications.ts
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  useEffect(() => {
    // Handle notification tap
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data.type === 'streak_reminder') {
          router.push('/(tabs)/review');
        }
      }
    );

    return () => subscription.remove();
  }, []);

  const scheduleStreakReminder = async (streakCount: number, hour: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't lose your streak! 🔥",
        body: `Keep your ${streakCount}-day streak going!`,
        data: { type: 'streak_reminder' },
      },
      trigger: {
        hour,
        minute: 0,
        repeats: true,
      },
    });
  };

  const scheduleLastChanceReminder = async (streakCount: number) => {
    const now = new Date();
    const elevenPm = new Date(now);
    elevenPm.setHours(23, 0, 0, 0);

    if (now < elevenPm) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your streak ends in 1 hour! ⏰',
          body: `Quick! Complete a lesson to save your ${streakCount}-day streak.`,
          data: { type: 'streak_reminder' },
        },
        trigger: elevenPm,
      });
    }
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    scheduleStreakReminder,
    scheduleLastChanceReminder,
    cancelAllNotifications,
  };
}
```

### Permission Request

```typescript
async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  return true;
}
```

### Notification Scheduling Logic

```typescript
// On app launch or after learning session
async function updateNotificationSchedule() {
  const settings = await getSettings();
  if (!settings.notifications_enabled) {
    await cancelAllNotifications();
    return;
  }

  const hasLearnedToday = await checkTodayActivity();
  const streak = await getStreak();

  // Cancel existing streak notifications
  await cancelStreakNotifications();

  if (!hasLearnedToday) {
    // Schedule reminder for user's typical time
    const typicalHour = await getTypicalLearningHour();
    await scheduleStreakReminder(streak.current_streak, typicalHour);

    // Schedule last-chance notification
    await scheduleLastChanceReminder(streak.current_streak);
  }
}
```

### Deep Link Configuration

```typescript
// In app.json
{
  "expo": {
    "scheme": "safar",
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#3B82F6"
    }
  }
}
```

### References

- [Source: epics.md#Story 5.5: Push Notifications - Streak Reminders]
- [Source: prd.md#FR39: Push notifications for streak reminders]
- [Source: architecture.md#Integration (NFR32)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Installed expo-notifications, configured plugin in app.json with emerald color (#0D7C66), created notificationService.ts with handler config and permission management, added expo-notifications mock to jest.setup.ts. 9 tests pass.
- Task 2: Created notificationPreferences.ts with AsyncStorage-based enable/disable + initNotificationPreferences for OS permission flow. 11 tests pass.
- Task 3-4: Created streakNotificationScheduler.ts with streak/last-chance scheduling and targeted streak-notification cancellation (AC #1, AC #2). 13 tests pass.
- Task 5: Created useNotificationHandler hook for notification tap deep-linking to /(tabs)/review for both streak_reminder and streak_last_chance types. 7 tests pass.
- Task 6-8: Created notificationOrchestrator.ts coordinating preferences, scheduling, cancellation on activity, and 1-per-day limit via AsyncStorage date tracking. 11 tests pass.
- Senior review auto-fix (2026-02-12): Wired notification bootstrap in app root, integrated schedule updates from home screen streak state, added profile notification preference toggle/permission flow, and connected lesson/review/quiz completion to cancel + next-day reschedule flow.

### Change Log

- Task 1: Set up Expo Notifications - installed package, app.json config, notification service with handler + permissions (2026-02-12)
- Task 2: Request notification permissions - permission flow with granted/denied handling, AsyncStorage preference persistence (2026-02-12)
- Task 3-4: Streak reminder + last-chance scheduling with configurable hour, time-gated 11 PM cutoff (2026-02-12)
- Task 5: Notification tap deep-link handler to review screen (2026-02-12)
- Task 6-8: Notification orchestrator with cancel-on-activity, preference respect, 1/day limit (2026-02-12)
- Senior review fixes: integrated runtime wiring, preference toggle flow, lifecycle scheduling, targeted cancellation, and expanded tests (2026-02-12)

### File List

- safar-app/app.json (modified - added expo-notifications plugin)
- safar-app/package.json (modified - added expo-notifications dependency)
- safar-app/__tests__/setup/jest.setup.ts (modified - added expo-notifications mock)
- safar-app/lib/notifications/notificationService.ts (new - notification handler + permissions)
- safar-app/lib/notifications/notificationPreferences.ts (new - AsyncStorage notification prefs)
- safar-app/lib/notifications/streakNotificationScheduler.ts (new - streak/last-chance scheduling)
- safar-app/lib/notifications/notificationOrchestrator.ts (new - coordination layer)
- safar-app/lib/hooks/useNotificationHandler.ts (new - tap deep-link hook)
- safar-app/app/_layout.tsx (modified - mounted notification bootstrap and global handler config)
- safar-app/app/(tabs)/index.tsx (modified - schedules reminders from current streak lifecycle state)
- safar-app/app/(tabs)/profile.tsx (modified - added streak reminder toggle and permission-driven enable flow)
- safar-app/app/lesson/[id].tsx (modified - cancel/reschedule reminders after lesson completion)
- safar-app/app/review/session.tsx (modified - cancel/reschedule reminders after review completion)
- safar-app/app/quiz/[lessonId].tsx (modified - cancel/reschedule reminders after quiz completion)
- safar-app/app/frequency-lesson/[id].tsx (modified - cancel/reschedule reminders after frequency lesson completion)
- safar-app/__tests__/notifications/notificationService.test.ts (new - 9 tests)
- safar-app/__tests__/hooks/useNotificationPreferences.test.ts (new - 11 tests)
- safar-app/__tests__/notifications/streakNotificationScheduler.test.ts (new - 13 tests)
- safar-app/__tests__/hooks/useNotificationHandler.test.ts (new - 7 tests)
- safar-app/__tests__/notifications/notificationOrchestrator.test.ts (new - 11 tests)

### Senior Developer Review (AI)

- Reviewer: Emrek (adversarial code-review workflow)
- Date: 2026-02-12
- Outcome: Approve (all HIGH/MEDIUM findings fixed)
- Validation: `npx jest __tests__/notifications/notificationService.test.ts __tests__/hooks/useNotificationPreferences.test.ts __tests__/notifications/streakNotificationScheduler.test.ts __tests__/hooks/useNotificationHandler.test.ts __tests__/notifications/notificationOrchestrator.test.ts --runInBand` (5 suites, 54 tests passed)
