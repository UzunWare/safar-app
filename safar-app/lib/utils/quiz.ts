import type { Word } from '@/types';

export interface QuizQuestionData {
  wordId: string;
  arabic: string;
  correctMeaning: string;
  options: QuizOptionData[];
}

export interface QuizOptionData {
  id: string;
  text: string;
  isCorrect: boolean;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate distractors from other words in the lesson/pathway.
 * Returns `count` random meanings that are NOT the correct answer.
 */
export function generateDistractors(
  correctWord: Word,
  allWords: Word[],
  count: number = 3
): string[] {
  const otherMeanings = allWords
    .filter((w) => w.id !== correctWord.id && w.meaning !== correctWord.meaning)
    .map((w) => w.meaning);

  // Deduplicate meanings
  const uniqueMeanings = [...new Set(otherMeanings)];

  return shuffleArray(uniqueMeanings).slice(0, count);
}

/**
 * Create quiz options from a correct meaning and distractors.
 * Returns shuffled options with unique IDs.
 */
export function createQuizOptions(correctMeaning: string, distractors: string[]): QuizOptionData[] {
  const options: QuizOptionData[] = [
    { id: 'correct', text: correctMeaning, isCorrect: true },
    ...distractors.map((text, i) => ({
      id: `distractor-${i}`,
      text,
      isCorrect: false,
    })),
  ];

  return shuffleArray(options);
}

/**
 * Get feedback message and emoji based on quiz score percentage.
 * Follows "no shame" principle — all messages are encouraging.
 */
export function getQuizFeedback(percentage: number): { message: string; emoji: string } {
  if (percentage >= 100) {
    return { message: "Perfect score! You've mastered these words.", emoji: '🌟' };
  } else if (percentage >= 80) {
    return { message: 'Excellent work! Keep up the great progress.', emoji: '🎉' };
  } else if (percentage >= 60) {
    return { message: 'Good effort! These words will come back for review.', emoji: '💪' };
  } else {
    return { message: 'Keep practicing! These words will appear in your reviews.', emoji: '📚' };
  }
}

/**
 * Generate all quiz questions for a set of lesson words.
 * Each word becomes one question with 4 options (1 correct + 3 distractors).
 */
export function generateQuizQuestions(words: Word[]): QuizQuestionData[] {
  if (words.length < 4) {
    // Not enough words for 3 unique distractors — use what we have
    return words.map((word) => {
      const distractors = generateDistractors(word, words, Math.min(3, words.length - 1));
      return {
        wordId: word.id,
        arabic: word.arabic,
        correctMeaning: word.meaning,
        options: createQuizOptions(word.meaning, distractors),
      };
    });
  }

  return words.map((word) => {
    const distractors = generateDistractors(word, words, 3);
    return {
      wordId: word.id,
      arabic: word.arabic,
      correctMeaning: word.meaning,
      options: createQuizOptions(word.meaning, distractors),
    };
  });
}
