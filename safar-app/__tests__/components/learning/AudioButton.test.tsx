/**
 * AudioButton Component Tests
 * Story 3.4: Audio Pronunciation Playback - Tasks 3 & 4
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AudioButton } from '@/components/learning/AudioButton';

// Get mock reference for Audio.Sound.createAsync
const { Audio } = require('expo-av');
const mockCreateAsync = Audio.Sound.createAsync as jest.Mock;

describe('AudioButton Component', () => {
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear shared audio cache between tests
    const { clearCache } = require('@/lib/hooks/audioCache');
    clearCache();

    mockSound = {
      playAsync: jest.fn(() => Promise.resolve()),
      stopAsync: jest.fn(() => Promise.resolve()),
      unloadAsync: jest.fn(() => Promise.resolve()),
      setOnPlaybackStatusUpdate: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
      setPositionAsync: jest.fn(() => Promise.resolve()),
    };

    mockCreateAsync.mockResolvedValue({
      sound: mockSound,
      status: { isLoaded: true },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Task 3: Audio button states
  describe('Task 3: Idle state', () => {
    it('renders audio button with play pronunciation label', () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);
      expect(getByLabelText('Play pronunciation')).toBeTruthy();
    });

    it('has button accessibility role', () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);
      const btn = getByLabelText('Play pronunciation');
      expect(btn.props.accessibilityRole).toBe('button');
    });

    it('renders with correct size (48px)', () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);
      const btn = getByLabelText('Play pronunciation');
      const style = btn.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.width).toBe(48);
      expect(flatStyle.height).toBe(48);
    });
  });

  describe('Task 3: Playing state', () => {
    it('shows playing state after press', async () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);

      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      // Should update accessibility label to indicate playing
      expect(getByLabelText('Playing pronunciation')).toBeTruthy();
    });
  });

  describe('Task 3: Error state', () => {
    it('shows error state on failure', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);

      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      expect(getByLabelText('Audio error')).toBeTruthy();
    });

    it('returns to idle after error clears', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Network error'));

      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);

      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      expect(getByLabelText('Audio error')).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(getByLabelText('Play pronunciation')).toBeTruthy();
    });
  });

  // Task 3: Disabled state
  describe('Task 3: Disabled state', () => {
    it('shows disabled state when audioUrl is null', () => {
      const { getByLabelText } = render(<AudioButton audioUrl={null} />);
      const btn = getByLabelText('Audio unavailable');
      expect(btn).toBeTruthy();
      expect(btn.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    });

    it('does not call onPlay when audioUrl is null', async () => {
      const onPlay = jest.fn();
      const { getByLabelText } = render(<AudioButton audioUrl={null} onPlay={onPlay} />);

      await act(async () => {
        fireEvent.press(getByLabelText('Audio unavailable'));
      });

      expect(onPlay).not.toHaveBeenCalled();
      expect(mockCreateAsync).not.toHaveBeenCalled();
    });
  });

  // Task 4: Integration
  describe('Task 4: Audio integration', () => {
    it('calls Audio.Sound.createAsync with audio URL on press', async () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);

      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      expect(mockCreateAsync).toHaveBeenCalledWith(
        { uri: 'https://example.com/audio.mp3' },
        { shouldPlay: true }
      );
    });

    it('calls onPlay callback when audio starts', async () => {
      const onPlay = jest.fn();
      const { getByLabelText } = render(
        <AudioButton audioUrl="https://example.com/audio.mp3" onPlay={onPlay} />
      );

      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      expect(onPlay).toHaveBeenCalled();
    });

    it('handles null audio URL gracefully', () => {
      const { getByLabelText } = render(<AudioButton audioUrl={null} />);

      // Shows disabled state instead of active
      expect(getByLabelText('Audio unavailable')).toBeTruthy();
    });
  });

  // Task 5: Replay
  describe('Task 5: Replay behavior', () => {
    it('restarts audio when pressed during playback', async () => {
      const { getByLabelText } = render(<AudioButton audioUrl="https://example.com/audio.mp3" />);

      // First play
      await act(async () => {
        fireEvent.press(getByLabelText('Play pronunciation'));
      });

      // Replay
      await act(async () => {
        fireEvent.press(getByLabelText('Playing pronunciation'));
      });

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockCreateAsync).toHaveBeenCalledTimes(2);
    });
  });
});
