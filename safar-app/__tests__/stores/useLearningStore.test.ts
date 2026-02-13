import { act } from '@testing-library/react-native';
import { useLearningStore } from '@/lib/stores/useLearningStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('useLearningStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state between tests
    act(() => {
      useLearningStore.getState().resetLesson();
    });
  });

  it('has correct initial state', () => {
    const state = useLearningStore.getState();
    expect(state.currentLessonId).toBeNull();
    expect(state.currentWordIndex).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('sets lesson ID and resets index', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
    });

    const state = useLearningStore.getState();
    expect(state.currentLessonId).toBe('lesson-1');
    expect(state.currentWordIndex).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('advances to next word', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().nextWord();
    });

    expect(useLearningStore.getState().currentWordIndex).toBe(1);
  });

  it('goes to previous word', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().nextWord();
      useLearningStore.getState().nextWord();
      useLearningStore.getState().previousWord();
    });

    expect(useLearningStore.getState().currentWordIndex).toBe(1);
  });

  it('does not go below index 0 on previousWord', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().previousWord();
    });

    expect(useLearningStore.getState().currentWordIndex).toBe(0);
  });

  it('sets specific word index', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().setWordIndex(5);
    });

    expect(useLearningStore.getState().currentWordIndex).toBe(5);
  });

  it('marks lesson as complete', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().completeLesson();
    });

    expect(useLearningStore.getState().isComplete).toBe(true);
  });

  it('resets all state on resetLesson', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().nextWord();
      useLearningStore.getState().nextWord();
      useLearningStore.getState().completeLesson();
      useLearningStore.getState().resetLesson();
    });

    const state = useLearningStore.getState();
    expect(state.currentLessonId).toBeNull();
    expect(state.currentWordIndex).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('resets index when setting a new lesson', () => {
    act(() => {
      useLearningStore.getState().setLesson('lesson-1');
      useLearningStore.getState().nextWord();
      useLearningStore.getState().nextWord();
      useLearningStore.getState().setLesson('lesson-2');
    });

    const state = useLearningStore.getState();
    expect(state.currentLessonId).toBe('lesson-2');
    expect(state.currentWordIndex).toBe(0);
    expect(state.isComplete).toBe(false);
  });
});
