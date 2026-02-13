import { renderHook, act } from '@testing-library/react-native';
import { useQuizStreak } from '@/lib/hooks/useQuizStreak';

describe('useQuizStreak', () => {
  it('starts with zero streak', () => {
    const { result } = renderHook(() => useQuizStreak());
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(0);
    expect(result.current.milestoneReached).toBeNull();
  });

  it('increments streak on correct answers', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    expect(result.current.currentStreak).toBe(1);

    act(() => result.current.recordCorrect());
    expect(result.current.currentStreak).toBe(2);
  });

  it('resets streak on incorrect answer', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    expect(result.current.currentStreak).toBe(2);

    act(() => result.current.recordIncorrect());
    expect(result.current.currentStreak).toBe(0);
  });

  it('tracks best streak across resets', () => {
    const { result } = renderHook(() => useQuizStreak());

    // Build a 3-streak
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    expect(result.current.bestStreak).toBe(3);

    // Break streak
    act(() => result.current.recordIncorrect());
    expect(result.current.bestStreak).toBe(3);
    expect(result.current.currentStreak).toBe(0);

    // Build a 2-streak — best should remain 3
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    expect(result.current.bestStreak).toBe(3);
  });

  it('fires milestone at 3-streak', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBeNull();

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBeNull();

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBe(3);
  });

  it('fires milestone at 5-streak', () => {
    const { result } = renderHook(() => useQuizStreak());

    for (let i = 0; i < 4; i++) {
      act(() => result.current.recordCorrect());
    }
    // After clearing the 3-streak milestone, continue
    act(() => result.current.clearMilestone());
    expect(result.current.milestoneReached).toBeNull();

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBe(5);
  });

  it('does not fire milestone at non-milestone streaks', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBeNull();

    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBeNull();

    // Skip 3 — check 4
    act(() => result.current.recordCorrect()); // 3 → milestone
    act(() => result.current.clearMilestone());
    act(() => result.current.recordCorrect()); // 4 → no milestone
    expect(result.current.milestoneReached).toBeNull();
  });

  it('clearMilestone clears the milestone flag', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    expect(result.current.milestoneReached).toBe(3);

    act(() => result.current.clearMilestone());
    expect(result.current.milestoneReached).toBeNull();
  });

  it('reset clears all state', () => {
    const { result } = renderHook(() => useQuizStreak());

    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());

    act(() => result.current.reset());
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(0);
    expect(result.current.milestoneReached).toBeNull();
  });
});
