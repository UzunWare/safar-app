import {
  getWordState,
  getStateColor,
  getStateLabel,
  type LearningState,
} from '@/lib/utils/learningState';

describe('Learning State Utilities', () => {
  describe('getWordState', () => {
    describe('new state', () => {
      it('returns "new" when progress is null', () => {
        expect(getWordState(null)).toBe('new');
      });

      it('returns "new" when repetitions is 0', () => {
        expect(getWordState({ repetitions: 0, interval: 1 })).toBe('new');
      });
    });

    describe('learning state', () => {
      it('returns "learning" when repetitions is 1', () => {
        expect(getWordState({ repetitions: 1, interval: 1 })).toBe('learning');
      });

      it('returns "learning" when repetitions is 2', () => {
        expect(getWordState({ repetitions: 2, interval: 6 })).toBe('learning');
      });

      it('returns "learning" when repetitions is 2 and interval < 7', () => {
        expect(getWordState({ repetitions: 2, interval: 5 })).toBe('learning');
      });
    });

    describe('review state', () => {
      it('returns "review" when repetitions is 3 and interval < 7', () => {
        expect(getWordState({ repetitions: 3, interval: 6 })).toBe('review');
      });

      it('returns "review" when repetitions is 4 and interval is 5', () => {
        expect(getWordState({ repetitions: 4, interval: 5 })).toBe('review');
      });

      it('returns "review" when repetitions > 2 and interval < 7', () => {
        expect(getWordState({ repetitions: 5, interval: 6 })).toBe('review');
      });
    });

    describe('mastered state', () => {
      it('returns "mastered" when interval is exactly 7 days', () => {
        expect(getWordState({ repetitions: 3, interval: 7 })).toBe('mastered');
      });

      it('returns "mastered" when interval is 8 days', () => {
        expect(getWordState({ repetitions: 3, interval: 8 })).toBe('mastered');
      });

      it('returns "mastered" when interval is 30 days', () => {
        expect(getWordState({ repetitions: 5, interval: 30 })).toBe('mastered');
      });

      it('returns "mastered" even with low repetitions if interval >= 7', () => {
        expect(getWordState({ repetitions: 1, interval: 7 })).toBe('mastered');
      });
    });

    describe('AC#1: State transition logic', () => {
      it('follows correct priority: interval >= 7 → mastered (highest priority)', () => {
        expect(getWordState({ repetitions: 1, interval: 7 })).toBe('mastered');
        expect(getWordState({ repetitions: 10, interval: 30 })).toBe('mastered');
      });

      it('follows correct priority: repetitions 1-2 → learning (if interval < 7)', () => {
        expect(getWordState({ repetitions: 1, interval: 1 })).toBe('learning');
        expect(getWordState({ repetitions: 2, interval: 6 })).toBe('learning');
      });

      it('follows correct priority: repetitions >= 3 → review (if interval < 7)', () => {
        expect(getWordState({ repetitions: 3, interval: 1 })).toBe('review');
        expect(getWordState({ repetitions: 10, interval: 6 })).toBe('review');
      });
    });
  });

  describe('getStateColor', () => {
    it('returns Divine Geometry black[20] for new state', () => {
      expect(getStateColor('new')).toBe('rgba(0, 0, 0, 0.20)');
    });

    it('returns Divine Geometry gold for learning state', () => {
      expect(getStateColor('learning')).toBe('#cfaa6b');
    });

    it('returns Divine Geometry rating.hard for review state', () => {
      expect(getStateColor('review')).toBe('#c9943f');
    });

    it('returns Divine Geometry emeraldDeep for mastered state', () => {
      expect(getStateColor('mastered')).toBe('#0f2e28');
    });
  });

  describe('getStateLabel', () => {
    it('returns "New" for new state', () => {
      expect(getStateLabel('new')).toBe('New');
    });

    it('returns "Learning" for learning state', () => {
      expect(getStateLabel('learning')).toBe('Learning');
    });

    it('returns "Review" for review state', () => {
      expect(getStateLabel('review')).toBe('Review');
    });

    it('returns "Mastered" for mastered state', () => {
      expect(getStateLabel('mastered')).toBe('Mastered');
    });
  });
});
