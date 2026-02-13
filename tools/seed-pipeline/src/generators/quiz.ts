/**
 * Quiz Question Generator
 *
 * Generates template-based quiz questions for word and root lessons.
 * Types: Arabic→English, English→Arabic, Root identification
 */

import {
  QuizQuestionDef,
  WordDef,
  LessonDef,
  RootDef,
  WordRootLink,
} from '../curriculum';

function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : [...arr];
  const result: T[] = [];
  const copy = [...filtered];
  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function generateWordLessonQuestions(
  lesson: LessonDef,
  lessonWords: WordDef[],
  allWords: WordDef[]
): QuizQuestionDef[] {
  const questions: QuizQuestionDef[] = [];
  let order = 1;

  // For each word: "What does X mean?" question
  for (const word of lessonWords) {
    const distractors = pickRandom(
      allWords.filter((w) => w.meaning !== word.meaning && w.lesson_id !== word.lesson_id),
      3
    );
    // Pad with generic distractors if we don't have enough from other lessons
    const fallbackMeanings = ['to return', 'darkness', 'earth', 'sky', 'water', 'light', 'heart', 'soul'];
    while (distractors.length < 3) {
      const meaning = fallbackMeanings[distractors.length];
      distractors.push({ meaning } as WordDef);
    }

    questions.push({
      id: `quiz-${lesson.id}-${order}`,
      lesson_id: lesson.id,
      question: `What is the meaning of "${word.arabic}"?`,
      correct_answer: word.meaning,
      wrong_answers: distractors.map((d) => d.meaning),
      explanation: `${word.arabic} (${word.transliteration}) means "${word.meaning}".`,
      order,
    });
    order++;
  }

  // Add 1-2 reverse questions: "Which word means X?"
  const reverseCount = Math.min(2, lessonWords.length);
  const reverseWords = pickRandom(lessonWords, reverseCount);
  for (const word of reverseWords) {
    const distractors = pickRandom(
      lessonWords.filter((w) => w.id !== word.id),
      3
    );
    while (distractors.length < 3) {
      const otherWords = pickRandom(allWords.filter((w) => w.lesson_id !== lesson.id), 3 - distractors.length);
      distractors.push(...otherWords);
    }

    questions.push({
      id: `quiz-${lesson.id}-${order}`,
      lesson_id: lesson.id,
      question: `Which word means "${word.meaning}"?`,
      correct_answer: word.arabic,
      wrong_answers: distractors.slice(0, 3).map((d) => d.arabic),
      explanation: `${word.arabic} (${word.transliteration}) means "${word.meaning}".`,
      order,
    });
    order++;
  }

  return questions;
}

function generateRootLessonQuestions(
  lesson: LessonDef,
  root: RootDef,
  connectedWords: WordDef[],
  allRoots: RootDef[],
  allWords: WordDef[]
): QuizQuestionDef[] {
  const questions: QuizQuestionDef[] = [];
  let order = 1;

  // Q1: "Which word comes from root X?"
  if (connectedWords.length > 0) {
    const correctWord = connectedWords[0];
    const distractorWords = pickRandom(
      allWords.filter((w) => !connectedWords.find((cw) => cw.id === w.id)),
      3
    );
    questions.push({
      id: `quiz-${lesson.id}-${order}`,
      lesson_id: lesson.id,
      question: `Which of these words comes from the root ${root.letters}?`,
      correct_answer: correctWord.arabic,
      wrong_answers: distractorWords.map((d) => d.arabic),
      explanation: `${correctWord.arabic} (${correctWord.transliteration}) comes from the root ${root.letters} which means "${root.meaning}".`,
      order,
    });
    order++;
  }

  // Q2: "What is the core meaning of root X?"
  const distractorRoots = pickRandom(
    allRoots.filter((r) => r.id !== root.id),
    3
  );
  questions.push({
    id: `quiz-${lesson.id}-${order}`,
    lesson_id: lesson.id,
    question: `What is the core meaning of the root ${root.letters}?`,
    correct_answer: root.meaning,
    wrong_answers: distractorRoots.map((r) => r.meaning),
    explanation: `The root ${root.letters} carries the meaning of "${root.meaning}".`,
    order,
  });
  order++;

  // Q3: "How many words in this pathway come from root X?"
  if (connectedWords.length > 1) {
    const correctCount = String(connectedWords.length);
    const wrongCounts = ['1', '2', '3', '4', '5', '6']
      .filter((c) => c !== correctCount)
      .slice(0, 3);
    questions.push({
      id: `quiz-${lesson.id}-${order}`,
      lesson_id: lesson.id,
      question: `How many words you've learned come from the root ${root.letters}?`,
      correct_answer: correctCount,
      wrong_answers: wrongCounts,
      explanation: `${connectedWords.length} words derive from ${root.letters}: ${connectedWords.map((w) => w.arabic).join(', ')}.`,
      order,
    });
    order++;
  }

  return questions;
}

export function generateAllQuizQuestions(
  lessons: LessonDef[],
  words: WordDef[],
  roots: RootDef[],
  wordRoots: WordRootLink[]
): QuizQuestionDef[] {
  // Use a fixed seed for reproducibility
  const allQuestions: QuizQuestionDef[] = [];

  for (const lesson of lessons) {
    if (lesson.lesson_type === 'word') {
      const lessonWords = words.filter((w) => w.lesson_id === lesson.id);
      const questions = generateWordLessonQuestions(lesson, lessonWords, words);
      allQuestions.push(...questions);
    } else if (lesson.lesson_type === 'root') {
      // Find which root this lesson is about by matching lesson ID pattern
      const rootId = lesson.id.replace('sf-root-', 'r-');
      const root = roots.find((r) => r.id === rootId);
      if (!root) continue;

      const connectedWordIds = wordRoots
        .filter((wr) => wr.root_id === root.id)
        .map((wr) => wr.word_id);
      const connectedWords = words.filter((w) => connectedWordIds.includes(w.id));

      const questions = generateRootLessonQuestions(
        lesson,
        root,
        connectedWords,
        roots,
        words
      );
      allQuestions.push(...questions);
    }
    // frequency lessons don't have quizzes
  }

  return allQuestions;
}
