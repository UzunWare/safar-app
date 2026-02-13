/**
 * Tests for useNotificationHandler Hook
 * Story 5.5: Push Notifications - Streak Reminders
 * Task 5: Handle notification tap
 */

import { renderHook, act } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useNotificationHandler } from '@/lib/hooks/useNotificationHandler';

describe('useNotificationHandler', () => {
  let capturedResponseCallback: ((response: any) => void) | null = null;
  let capturedReceivedCallback: ((notification: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedResponseCallback = null;
    capturedReceivedCallback = null;

    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
      (callback) => {
        capturedResponseCallback = callback;
        return { remove: jest.fn() };
      }
    );

    (Notifications.addNotificationReceivedListener as jest.Mock).mockImplementation((callback) => {
      capturedReceivedCallback = callback;
      return { remove: jest.fn() };
    });
  });

  it('registers notification response listener on mount', () => {
    renderHook(() => useNotificationHandler());

    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
  });

  it('registers notification received listener on mount', () => {
    renderHook(() => useNotificationHandler());

    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
  });

  it('handles last notification response on mount', async () => {
    (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValueOnce({
      notification: {
        request: {
          content: {
            data: { type: 'streak_last_chance' },
          },
        },
      },
    });

    renderHook(() => useNotificationHandler());

    await act(async () => {
      await Promise.resolve();
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/review');
  });

  it('navigates to review screen on streak_reminder tap', () => {
    renderHook(() => useNotificationHandler());

    act(() => {
      capturedResponseCallback?.({
        notification: {
          request: {
            content: {
              data: { type: 'streak_reminder' },
            },
          },
        },
      });
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/review');
  });

  it('navigates to review screen on streak_last_chance tap', () => {
    renderHook(() => useNotificationHandler());

    act(() => {
      capturedResponseCallback?.({
        notification: {
          request: {
            content: {
              data: { type: 'streak_last_chance' },
            },
          },
        },
      });
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/review');
  });

  it('navigates to review screen on review_reminder tap (Story 5.6)', () => {
    renderHook(() => useNotificationHandler());

    act(() => {
      capturedResponseCallback?.({
        notification: {
          request: {
            content: {
              data: { type: 'review_reminder' },
            },
          },
        },
      });
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/review');
  });

  it('handles review_reminder from last notification on mount (Story 5.6)', async () => {
    (Notifications.getLastNotificationResponseAsync as jest.Mock).mockResolvedValueOnce({
      notification: {
        request: {
          content: {
            data: { type: 'review_reminder' },
          },
        },
      },
    });

    renderHook(() => useNotificationHandler());

    await act(async () => {
      await Promise.resolve();
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/review');
  });

  it('does not navigate for unknown notification types', () => {
    renderHook(() => useNotificationHandler());

    act(() => {
      capturedResponseCallback?.({
        notification: {
          request: {
            content: {
              data: { type: 'unknown_type' },
            },
          },
        },
      });
    });

    expect(router.push).not.toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const removeResponse = jest.fn();
    const removeReceived = jest.fn();

    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
      remove: removeResponse,
    });
    (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({
      remove: removeReceived,
    });

    const { unmount } = renderHook(() => useNotificationHandler());
    unmount();

    expect(removeResponse).toHaveBeenCalled();
    expect(removeReceived).toHaveBeenCalled();
  });

  it('handles missing data gracefully', () => {
    renderHook(() => useNotificationHandler());

    act(() => {
      capturedResponseCallback?.({
        notification: {
          request: {
            content: {
              data: {},
            },
          },
        },
      });
    });

    expect(router.push).not.toHaveBeenCalled();
  });
});
