/**
 * Validators for generated seed data
 *
 * Checks: Arabic tashkeel, ID uniqueness, referential integrity, word counts
 */

import {
  PathwayDef,
  UnitDef,
  LessonDef,
  WordDef,
  RootDef,
  WordRootLink,
  QuizQuestionDef,
} from '../curriculum';

interface ValidationError {
  severity: 'error' | 'warning';
  table: string;
  id: string;
  message: string;
}

const ARABIC_RANGE = /[\u0600-\u06FF]/;
const TASHKEEL = /[\u064B-\u0652]/; // fathatan through sukun

function validateArabicText(words: WordDef[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const word of words) {
    if (!ARABIC_RANGE.test(word.arabic)) {
      errors.push({
        severity: 'error',
        table: 'words',
        id: word.id,
        message: `Arabic text "${word.arabic}" does not contain Arabic characters`,
      });
    }
    if (!TASHKEEL.test(word.arabic)) {
      errors.push({
        severity: 'warning',
        table: 'words',
        id: word.id,
        message: `Arabic text "${word.arabic}" has no tashkeel (diacritical marks)`,
      });
    }
  }
  return errors;
}

function validateIdUniqueness(
  words: WordDef[],
  lessons: LessonDef[],
  units: UnitDef[],
  roots: RootDef[],
  quizQuestions: QuizQuestionDef[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const tables: { name: string; ids: string[] }[] = [
    { name: 'words', ids: words.map((w) => w.id) },
    { name: 'lessons', ids: lessons.map((l) => l.id) },
    { name: 'units', ids: units.map((u) => u.id) },
    { name: 'roots', ids: roots.map((r) => r.id) },
    { name: 'quiz_questions', ids: quizQuestions.map((q) => q.id) },
  ];

  for (const table of tables) {
    const seen = new Set<string>();
    for (const id of table.ids) {
      if (seen.has(id)) {
        errors.push({
          severity: 'error',
          table: table.name,
          id,
          message: `Duplicate ID "${id}"`,
        });
      }
      seen.add(id);
    }
  }

  return errors;
}

function validateReferentialIntegrity(
  pathway: PathwayDef,
  units: UnitDef[],
  lessons: LessonDef[],
  words: WordDef[],
  roots: RootDef[],
  wordRoots: WordRootLink[],
  quizQuestions: QuizQuestionDef[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const pathwayIds = new Set([pathway.id]);
  const unitIds = new Set(units.map((u) => u.id));
  const lessonIds = new Set(lessons.map((l) => l.id));
  const wordIds = new Set(words.map((w) => w.id));
  const rootIds = new Set(roots.map((r) => r.id));

  // Units → Pathway
  for (const unit of units) {
    if (!pathwayIds.has(unit.pathway_id)) {
      errors.push({
        severity: 'error',
        table: 'units',
        id: unit.id,
        message: `pathway_id "${unit.pathway_id}" not found in pathways`,
      });
    }
  }

  // Lessons → Units
  for (const lesson of lessons) {
    if (!unitIds.has(lesson.unit_id)) {
      errors.push({
        severity: 'error',
        table: 'lessons',
        id: lesson.id,
        message: `unit_id "${lesson.unit_id}" not found in units`,
      });
    }
  }

  // Words → Lessons
  for (const word of words) {
    if (!lessonIds.has(word.lesson_id)) {
      errors.push({
        severity: 'error',
        table: 'words',
        id: word.id,
        message: `lesson_id "${word.lesson_id}" not found in lessons`,
      });
    }
  }

  // WordRoots → Words & Roots
  for (const wr of wordRoots) {
    if (!wordIds.has(wr.word_id)) {
      errors.push({
        severity: 'error',
        table: 'word_roots',
        id: `${wr.word_id}-${wr.root_id}`,
        message: `word_id "${wr.word_id}" not found in words`,
      });
    }
    if (!rootIds.has(wr.root_id)) {
      errors.push({
        severity: 'error',
        table: 'word_roots',
        id: `${wr.word_id}-${wr.root_id}`,
        message: `root_id "${wr.root_id}" not found in roots`,
      });
    }
  }

  // Quiz → Lessons
  for (const q of quizQuestions) {
    if (!lessonIds.has(q.lesson_id)) {
      errors.push({
        severity: 'error',
        table: 'quiz_questions',
        id: q.id,
        message: `lesson_id "${q.lesson_id}" not found in lessons`,
      });
    }
  }

  return errors;
}

function validateWordCounts(
  pathway: PathwayDef,
  units: UnitDef[],
  lessons: LessonDef[],
  words: WordDef[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Lesson word counts
  for (const lesson of lessons) {
    if (lesson.lesson_type === 'root') continue; // root lessons have word_count = 0
    const actualCount = words.filter((w) => w.lesson_id === lesson.id).length;
    // We'll set word_count in the SQL generator, so just validate it's positive for word lessons
    if (lesson.lesson_type === 'word' && actualCount === 0) {
      errors.push({
        severity: 'error',
        table: 'lessons',
        id: lesson.id,
        message: `Word lesson has 0 words`,
      });
    }
  }

  // Unit total (auto-calculated in SQL writer, just verify we have units)
  if (units.length === 0) {
    errors.push({
      severity: 'error',
      table: 'pathway',
      id: pathway.id,
      message: `Pathway has 0 units`,
    });
  }

  return errors;
}

export function validate(
  pathway: PathwayDef,
  units: UnitDef[],
  lessons: LessonDef[],
  words: WordDef[],
  roots: RootDef[],
  wordRoots: WordRootLink[],
  quizQuestions: QuizQuestionDef[]
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const allIssues = [
    ...validateArabicText(words),
    ...validateIdUniqueness(words, lessons, units, roots, quizQuestions),
    ...validateReferentialIntegrity(pathway, units, lessons, words, roots, wordRoots, quizQuestions),
    ...validateWordCounts(pathway, units, lessons, words),
  ];

  return {
    errors: allIssues.filter((e) => e.severity === 'error'),
    warnings: allIssues.filter((e) => e.severity === 'warning'),
  };
}
