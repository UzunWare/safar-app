/**
 * Tests for RevenueCat Purchases Configuration
 *
 * Story 6.1: RevenueCat Integration & Setup - Task 4
 */

// Shared mock functions accessible across all tests
const mockConfigure = jest.fn(() => Promise.resolve());
const mockSetLogLevel = jest.fn();
let mockPlatformOS = 'ios';

beforeEach(() => {
  jest.resetModules();
  mockConfigure.mockClear();
  mockSetLogLevel.mockClear();
  mockPlatformOS = 'ios';
});

function setupMocksAndGetModule() {
  jest.doMock('react-native-purchases', () => ({
    __esModule: true,
    default: {
      configure: mockConfigure,
      setLogLevel: mockSetLogLevel,
      LOG_LEVEL: { DEBUG: 'DEBUG', INFO: 'INFO' },
    },
  }));

  jest.doMock('react-native', () => ({
    Platform: {
      get OS() {
        return mockPlatformOS;
      },
    },
  }));

  return require('@/lib/subscription/purchasesConfig') as {
    initializePurchases: () => Promise<void>;
  };
}

describe('initializePurchases', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_REVENUECAT_IOS_KEY: 'test-ios-key',
      EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'test-android-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure Purchases with iOS key on iOS platform', async () => {
    mockPlatformOS = 'ios';
    const { initializePurchases } = setupMocksAndGetModule();

    await initializePurchases();

    expect(mockConfigure).toHaveBeenCalledWith({
      apiKey: 'test-ios-key',
    });
  });

  it('should configure Purchases with Android key on Android platform', async () => {
    mockPlatformOS = 'android';
    const { initializePurchases } = setupMocksAndGetModule();

    await initializePurchases();

    expect(mockConfigure).toHaveBeenCalledWith({
      apiKey: 'test-android-key',
    });
  });

  it('should set debug log level in development', async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const { initializePurchases } = setupMocksAndGetModule();
    await initializePurchases();

    expect(mockSetLogLevel).toHaveBeenCalledWith('DEBUG');

    (global as any).__DEV__ = originalDev;
  });

  it('should not set debug log level in production', async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const { initializePurchases } = setupMocksAndGetModule();
    await initializePurchases();

    expect(mockSetLogLevel).not.toHaveBeenCalled();

    (global as any).__DEV__ = originalDev;
  });

  it('should not throw when API key is missing', async () => {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = undefined;

    const { initializePurchases } = setupMocksAndGetModule();
    await expect(initializePurchases()).resolves.not.toThrow();
  });

  it('should not call configure when API key is missing', async () => {
    mockPlatformOS = 'ios';
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = undefined;

    const { initializePurchases } = setupMocksAndGetModule();
    await initializePurchases();

    expect(mockConfigure).not.toHaveBeenCalled();
  });
});
