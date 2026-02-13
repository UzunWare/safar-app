import {
  shuffleArray,
  generateDistractors,
  createQuizOptions,
  generateQuizQuestions,
  getQuizFeedback,
} from '@/lib/utils/quiz';
import type { Word } from '@/types';

const makeWord = (id: string, meaning: string, arabic: string = 'عربي'): Word => ({
  id,
  lesson_id: 'l1',
  arabic,
  transliteration: 'test',
  meaning,
  order: 1,
  audio_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  frequency: null,
  description: null,
});

describe('Quiz Utilities', () => {
  describe('shuffleArray', () => {
    it('returns array of same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      expect(result).toHaveLength(5);
    });

    it('contains all original elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray(input);
      expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      shuffleArray(input);
      expect(input).toEqual(original);
    });

    it('handles empty array', () => {
      expect(shuffleArray([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(shuffleArray([42])).toEqual([42]);
    });
  });

  describe('generateDistractors', () => {
    const words = [
      makeWord('w1', 'In the name of'),
      makeWord('w2', 'God'),
      makeWord('w3', 'The Most Gracious'),
      makeWord('w4', 'The Most Merciful'),
      makeWord('w5', 'Master'),
    ];

    it('generates the requested number of distractors', () => {
      const result = generateDistractors(words[0], words, 3);
      expect(result).toHaveLength(3);
    });

    it('does not include the correct answer', () => {
      const result = generateDistractors(words[0], words, 3);
      expect(result).not.toContain('In the name of');
    });

    it('returns unique meanings', () => {
      const wordsWithDupes = [
        ...words,
        makeWord('w6', 'God'), // duplicate meaning
      ];
      const result = generateDistractors(wordsWithDupes[0], wordsWithDupes, 4);
      const uniqueResult = [...new Set(result)];
      expect(result).toEqual(uniqueResult);
    });

    it('returns fewer distractors if not enough unique words', () => {
      const fewWords = [makeWord('w1', 'Hello'), makeWord('w2', 'World')];
      const result = generateDistractors(fewWords[0], fewWords, 3);
      expect(result).toHaveLength(1); // only 1 other word
      expect(result[0]).toBe('World');
    });
  });

  describe('createQuizOptions', () => {
    it('creates 4 options from 1 correct + 3 distractors', () => {
      const options = createQuizOptions('God', ['Master', 'Mercy', 'Day']);
      expect(options).toHaveLength(4);
    });

    it('includes the correct answer', () => {
      const options = createQuizOptions('God', ['Master', 'Mercy', 'Day']);
      const correct = options.find((o) => o.isCorrect);
      expect(correct).toBeDefined();
      expect(correct!.text).toBe('God');
    });

    it('marks distractors as incorrect', () => {
      const options = createQuizOptions('God', ['Master', 'Mercy', 'Day']);
      const incorrect = options.filter((o) => !o.isCorrect);
      expect(incorrect).toHaveLength(3);
    });

    it('assigns unique IDs to all options', () => {
      const options = createQuizOptions('God', ['Master', 'Mercy', 'Day']);
      const ids = options.map((o) => o.id);
      expect(new Set(ids).size).toBe(4);
    });
  });

  describe('generateQuizQuestions', () => {
    const words = [
      makeWord('w1', 'In the name of', 'بِسْمِ'),
      makeWord('w2', 'God', 'اللَّهِ'),
      makeWord('w3', 'The Most Gracious', 'الرَّحْمَنِ'),
      makeWord('w4', 'The Most Merciful', 'الرَّحِيمِ'),
    ];

    it('generates one question per word', () => {
      const questions = generateQuizQuestions(words);
      expect(questions).toHaveLength(4);
    });

    it('each question has the word arabic text', () => {
      const questions = generateQuizQuestions(words);
      expect(questions[0].arabic).toBe('بِسْمِ');
      expect(questions[1].arabic).toBe('اللَّهِ');
    });

    it('each question has 4 options when enough words exist', () => {
      const questions = generateQuizQuestions(words);
      questions.forEach((q) => {
        expect(q.options.length).toBe(4);
      });
    });

    it('each question has exactly one correct option', () => {
      const questions = generateQuizQuestions(words);
      questions.forEach((q) => {
        const correctOptions = q.options.filter((o) => o.isCorrect);
        expect(correctOptions).toHaveLength(1);
        expect(correctOptions[0].text).toBe(q.correctMeaning);
      });
    });

    it('sets wordId for each question', () => {
      const questions = generateQuizQuestions(words);
      expect(questions[0].wordId).toBe('w1');
      expect(questions[1].wordId).toBe('w2');
    });

    it('handles fewer than 4 words gracefully', () => {
      const fewWords = [makeWord('w1', 'Hello', 'مرحبا'), makeWord('w2', 'World', 'عالم')];
      const questions = generateQuizQuestions(fewWords);
      expect(questions).toHaveLength(2);
      // Each question should have correct + 1 distractor = 2 options
      questions.forEach((q) => {
        expect(q.options.length).toBe(2);
      });
    });
  });

  describe('getQuizFeedback', () => {
    it('returns perfect score feedback for 100%', () => {
      const result = getQuizFeedback(100);
      expect(result.message).toContain('Perfect');
      expect(result.emoji).toBe('🌟');
    });

    it('returns encouraging feedback for >= 80%', () => {
      const result = getQuizFeedback(80);
      expect(result.message).toContain('Excellent');
      expect(result.emoji).toBe('🎉');
    });

    it('returns encouraging feedback for 90%', () => {
      const result = getQuizFeedback(90);
      expect(result.message).toContain('Excellent');
    });

    it('returns constructive feedback for 60-79%', () => {
      const result = getQuizFeedback(75);
      expect(result.message).toContain('Good effort');
      expect(result.emoji).toBe('💪');
    });

    it('returns constructive feedback for 60%', () => {
      const result = getQuizFeedback(60);
      expect(result.message).toContain('Good effort');
    });

    it('returns practice feedback for < 60%', () => {
      const result = getQuizFeedback(50);
      expect(result.message).toContain('Keep practicing');
      expect(result.emoji).toBe('📚');
    });

    it('returns practice feedback for 0%', () => {
      const result = getQuizFeedback(0);
      expect(result.message).toContain('reviews');
    });

    it('never contains shaming language', () => {
      const scores = [0, 10, 25, 40, 50, 60, 75, 80, 90, 100];
      scores.forEach((score) => {
        const result = getQuizFeedback(score);
        expect(result.message.toLowerCase()).not.toContain('fail');
        expect(result.message.toLowerCase()).not.toContain('bad');
        expect(result.message.toLowerCase()).not.toContain('wrong');
        expect(result.message.toLowerCase()).not.toContain('poor');
      });
    });
  });
});
