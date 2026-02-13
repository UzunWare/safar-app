import {
  calculateNextReview,
  formatInterval,
  getDefaultProgress,
  deriveWordStatus,
  type SM2Input,
} from '@/lib/utils/sm2';

describe('SM-2 Algorithm', () => {
  const defaultInput: SM2Input = {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  describe('calculateNextReview', () => {
    describe('Again rating (0)', () => {
      it('resets interval to 1 day', () => {
        const result = calculateNextReview(0, defaultInput);
        expect(result.interval).toBe(1);
      });

      it('resets repetitions to 0', () => {
        const result = calculateNextReview(0, defaultInput);
        expect(result.repetitions).toBe(0);
      });

      it('decreases ease factor', () => {
        const result = calculateNextReview(0, defaultInput);
        expect(result.easeFactor).toBeLessThan(defaultInput.easeFactor);
      });

      it('never decreases ease factor below 1.3', () => {
        const lowEF: SM2Input = { easeFactor: 1.3, interval: 1, repetitions: 1 };
        const result = calculateNextReview(0, lowEF);
        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      });

      it('resets even advanced cards back to 1 day', () => {
        const advanced: SM2Input = { easeFactor: 2.5, interval: 30, repetitions: 5 };
        const result = calculateNextReview(0, advanced);
        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(0);
      });

      it('returns a valid nextReview ISO date string', () => {
        const result = calculateNextReview(0, defaultInput);
        expect(new Date(result.nextReview).toISOString()).toBe(result.nextReview);
      });
    });

    describe('Hard rating (1)', () => {
      it('progresses repetitions', () => {
        const result = calculateNextReview(1, defaultInput);
        expect(result.repetitions).toBe(1);
      });

      it('sets interval to 1 for first repetition', () => {
        const result = calculateNextReview(1, defaultInput);
        expect(result.interval).toBe(1);
      });

      it('sets interval to 6 for second repetition', () => {
        const input: SM2Input = { easeFactor: 2.5, interval: 1, repetitions: 1 };
        const result = calculateNextReview(1, input);
        expect(result.interval).toBe(6);
      });

      it('slightly decreases ease factor', () => {
        const result = calculateNextReview(1, defaultInput);
        expect(result.easeFactor).toBeLessThan(defaultInput.easeFactor);
        // Hard decrease is less than Again decrease
        const againResult = calculateNextReview(0, defaultInput);
        expect(result.easeFactor).toBeGreaterThan(againResult.easeFactor);
      });
    });

    describe('Good rating (2)', () => {
      it('maintains ease factor', () => {
        const result = calculateNextReview(2, defaultInput);
        expect(result.easeFactor).toBe(defaultInput.easeFactor);
      });

      it('sets interval to 1 for first repetition', () => {
        const result = calculateNextReview(2, defaultInput);
        expect(result.interval).toBe(1);
      });

      it('sets interval to 6 for second repetition', () => {
        const input: SM2Input = { easeFactor: 2.5, interval: 1, repetitions: 1 };
        const result = calculateNextReview(2, input);
        expect(result.interval).toBe(6);
      });

      it('multiplies interval by ease factor for 3rd+ repetition', () => {
        const input: SM2Input = { easeFactor: 2.5, interval: 6, repetitions: 2 };
        const result = calculateNextReview(2, input);
        expect(result.interval).toBe(15); // 6 * 2.5 = 15
      });
    });

    describe('Easy rating (3)', () => {
      it('increases ease factor', () => {
        const result = calculateNextReview(3, defaultInput);
        expect(result.easeFactor).toBeGreaterThan(defaultInput.easeFactor);
      });

      it('applies bonus multiplier to interval', () => {
        const input: SM2Input = { easeFactor: 2.5, interval: 6, repetitions: 2 };
        const result = calculateNextReview(3, input);
        // 6 * 2.6 (new EF) * 1.3 (bonus) ≈ 20
        expect(result.interval).toBeGreaterThan(15);
      });

      it('increases interval significantly more than Good', () => {
        const input: SM2Input = { easeFactor: 2.5, interval: 6, repetitions: 2 };
        const goodResult = calculateNextReview(2, input);
        const easyResult = calculateNextReview(3, input);
        expect(easyResult.interval).toBeGreaterThan(goodResult.interval);
      });
    });

    describe('nextReview date', () => {
      it('sets review date N days in the future based on interval', () => {
        const before = Date.now();
        const result = calculateNextReview(2, { easeFactor: 2.5, interval: 6, repetitions: 2 });
        const after = Date.now();

        const reviewMs = new Date(result.nextReview).getTime();
        const expectedMinMs = before + result.interval * 24 * 60 * 60 * 1000;
        const expectedMaxMs = after + result.interval * 24 * 60 * 60 * 1000;

        expect(reviewMs).toBeGreaterThanOrEqual(expectedMinMs);
        expect(reviewMs).toBeLessThanOrEqual(expectedMaxMs);
      });
    });
  });

  describe('getDefaultProgress', () => {
    it('returns ease_factor of 2.5', () => {
      expect(getDefaultProgress().easeFactor).toBe(2.5);
    });

    it('returns interval of 1', () => {
      expect(getDefaultProgress().interval).toBe(1);
    });

    it('returns repetitions of 0', () => {
      expect(getDefaultProgress().repetitions).toBe(0);
    });
  });

  describe('deriveWordStatus', () => {
    it('returns learning when repetitions is 0', () => {
      expect(deriveWordStatus(0, 30)).toBe('learning');
    });

    it('returns learning when interval below threshold', () => {
      expect(deriveWordStatus(3, 15)).toBe('learning');
    });

    it('returns review when interval at threshold', () => {
      expect(deriveWordStatus(3, 21)).toBe('review');
    });

    it('returns review when interval above threshold', () => {
      expect(deriveWordStatus(3, 60)).toBe('review');
    });
  });

  describe('formatInterval', () => {
    it('returns "Now" for 0 days', () => {
      expect(formatInterval(0)).toBe('Now');
    });

    it('returns "1d" for 1 day', () => {
      expect(formatInterval(1)).toBe('1d');
    });

    it('returns days for 2-6 days', () => {
      expect(formatInterval(3)).toBe('3d');
      expect(formatInterval(6)).toBe('6d');
    });

    it('returns weeks for 7-29 days', () => {
      expect(formatInterval(7)).toBe('1w');
      expect(formatInterval(14)).toBe('2w');
      expect(formatInterval(21)).toBe('3w');
    });

    it('returns months for 30+ days', () => {
      expect(formatInterval(30)).toBe('1mo');
      expect(formatInterval(60)).toBe('2mo');
      expect(formatInterval(90)).toBe('3mo');
    });
  });
});
