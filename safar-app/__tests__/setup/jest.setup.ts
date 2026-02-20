/**
 * Jest Setup - Common mocks for React Native + Expo testing
 */

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({ id: 'test-lesson-id' })),
  useSegments: jest.fn(() => []),
  useRootNavigationState: jest.fn(() => ({ key: 'test' })),
  Redirect: jest.fn(() => null),
  Slot: jest.fn(() => null),
  Link: jest.fn(({ children }: any) => children),
}));

// Mock Sentry shim module
jest.mock('@/lib/utils/sentry', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  init: jest.fn(),
  wrap: <T>(component: T) => component,
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, testID, ...rest }: any) =>
      require('react').createElement(View, { testID, ...rest }, children),
  };
});

// Mock expo-av
jest.mock('expo-av', () => {
  const mockSound = {
    playAsync: jest.fn(() => Promise.resolve()),
    stopAsync: jest.fn(() => Promise.resolve()),
    unloadAsync: jest.fn(() => Promise.resolve()),
    setOnPlaybackStatusUpdate: jest.fn(),
    getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
    setPositionAsync: jest.fn(() => Promise.resolve()),
  };
  return {
    Audio: {
      Sound: {
        createAsync: jest.fn(() =>
          Promise.resolve({ sound: mockSound, status: { isLoaded: true } })
        ),
      },
      setAudioModeAsync: jest.fn(() => Promise.resolve()),
    },
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureDetector: ({ children }: any) => children,
    GestureHandlerRootView: ({ children, ...props }: any) =>
      require('react').createElement(View, props, children),
    Gesture: {
      Pan: () => ({
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        minDistance: jest.fn().mockReturnThis(),
        activeOffsetX: jest.fn().mockReturnThis(),
        failOffsetY: jest.fn().mockReturnThis(),
      }),
    },
    Directions: { RIGHT: 1, LEFT: 2 },
  };
});

// Mock nativewind/global CSS import
jest.mock('@/global.css', () => ({}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Error: 'error', Warning: 'warning' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined', granted: false })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  addNotificationReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[mock-token]' })),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  AndroidImportance: {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
  },
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-purchases (RevenueCat)
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: '1',
    STORE_PROBLEM_ERROR: '2',
    NETWORK_ERROR: '10',
    PAYMENT_PENDING_ERROR: '20',
    OFFLINE_CONNECTION_ERROR: '35',
  },
  default: {
    configure: jest.fn(() => Promise.resolve()),
    setLogLevel: jest.fn(),
    getOfferings: jest.fn(() =>
      Promise.resolve({
        current: {
          availablePackages: [
            {
              identifier: '$rc_monthly',
              packageType: 'MONTHLY',
              product: {
                identifier: 'safar_monthly',
                priceString: '$4.99',
                price: 4.99,
              },
              offeringIdentifier: 'default',
            },
            {
              identifier: '$rc_annual',
              packageType: 'ANNUAL',
              product: {
                identifier: 'safar_annual',
                priceString: '$34.99',
                price: 34.99,
              },
              offeringIdentifier: 'default',
            },
          ],
        },
      })
    ),
    getCustomerInfo: jest.fn(() =>
      Promise.resolve({
        entitlements: { active: {} },
        originalAppUserId: 'test-user',
      })
    ),
    purchasePackage: jest.fn(() =>
      Promise.resolve({
        customerInfo: {
          entitlements: {
            active: {
              premium: { identifier: 'premium', isActive: true, periodType: 'NORMAL' },
            },
          },
        },
      })
    ),
    restorePurchases: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    addCustomerInfoUpdateListener: jest.fn(() => ({ remove: jest.fn() })),
    removeCustomerInfoUpdateListener: jest.fn(),
    logIn: jest.fn(() =>
      Promise.resolve({ customerInfo: { entitlements: { active: {} } }, created: false })
    ),
    logOut: jest.fn(() => Promise.resolve({ customerInfo: { entitlements: { active: {} } } })),
    LOG_LEVEL: { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' },
  },
}));

// Mock supabase client
jest.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: 0, error: null })),
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
  isSupabaseConfigured: jest.fn(() => true),
  isInvalidRefreshTokenError: jest.fn(() => false),
  clearLocalSupabaseSession: jest.fn(() => Promise.resolve()),
}));
