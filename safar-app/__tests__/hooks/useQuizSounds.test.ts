/**
 * useQuizSounds Hook Tests
 *
 * Story 7.3: Sound Settings - Task 4
 * Tests quiz sound integration with useSettingsStore.soundEnabled
 */

import { renderHook, act } from '@testing-library/react-native';
import { Audio } from 'expo-av';

// Mock useSettingsStore
const mockStoreState = { soundEnabled: true };
jest.mock('@/lib/stores/useSettingsStore', () => ({
  useSettingsStore: Object.assign(
    (selector?: (state: any) => any) =>
      typeof selector === 'function' ? selector(mockStoreState) : mockStoreState,
    { getState: () => mockStoreState }
  ),
}));

import { useQuizSounds } from '@/lib/hooks/useQuizSounds';

// expo-av is already mocked in jest.setup.ts

describe('useQuizSounds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.soundEnabled = true;
  });

  it('loads sounds on mount when soundEnabled is true', async () => {
    const { result } = renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({ playsInSilentModeIOS: true })
    );
    expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(4);
  });

  it('does NOT load sounds when soundEnabled is false', async () => {
    mockStoreState.soundEnabled = false;

    renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
  });

  it('exposes play functions', () => {
    const { result } = renderHook(() => useQuizSounds());

    expect(typeof result.current.playSelect).toBe('function');
    expect(typeof result.current.playCorrect).toBe('function');
    expect(typeof result.current.playIncorrect).toBe('function');
    expect(typeof result.current.playComplete).toBe('function');
  });

  it('plays correct sound when enabled', async () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    const mockSetPosition = jest.fn().mockResolvedValue(undefined);
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: {
        playAsync: mockPlay,
        setPositionAsync: mockSetPosition,
        unloadAsync: jest.fn().mockResolvedValue(undefined),
      },
      status: { isLoaded: true },
    });

    const { result } = renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.playCorrect();
    });

    expect(mockSetPosition).toHaveBeenCalledWith(0);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('does NOT play sound when soundEnabled is false', async () => {
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    const mockSetPosition = jest.fn().mockResolvedValue(undefined);
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: {
        playAsync: mockPlay,
        setPositionAsync: mockSetPosition,
        unloadAsync: jest.fn().mockResolvedValue(undefined),
      },
      status: { isLoaded: true },
    });

    const { result } = renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Disable sound mid-session
    mockStoreState.soundEnabled = false;

    await act(async () => {
      await result.current.playCorrect();
    });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('unloads sounds on unmount', async () => {
    const mockUnload = jest.fn().mockResolvedValue(undefined);
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: {
        playAsync: jest.fn(),
        setPositionAsync: jest.fn(),
        unloadAsync: mockUnload,
      },
      status: { isLoaded: true },
    });

    const { unmount } = renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    unmount();

    expect(mockUnload).toHaveBeenCalled();
  });

  it('handles load failure gracefully', async () => {
    (Audio.Sound.createAsync as jest.Mock).mockRejectedValue(new Error('Sound file not found'));

    const { result } = renderHook(() => useQuizSounds());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.playCorrect();
    });
  });
});
