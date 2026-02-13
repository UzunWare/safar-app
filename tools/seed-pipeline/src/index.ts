/**
 * Seed Pipeline: Main Orchestrator
 *
 * Generates a complete seed.sql for the Salah First pathway.
 *
 * Usage:
 *   npx ts-node src/index.ts              # Generate seed.sql
 *   npx ts-node src/index.ts --validate   # Validate only, no output
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  pathway,
  units,
  lessons,
  words,
  roots,
  wordRoots,
} from './curriculum';
import { generateAllQuizQuestions } from './generators/quiz';
import { generateSeedSQL } from './generators/sql-writer';
import { validate } from './validators/validate';
import type { FrequencyExampleDef } from './curriculum';

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'seed.sql');

function main() {
  const validateOnly = process.argv.includes('--validate');

  console.log('=== Safar2 Seed Pipeline ===\n');

  // Step 1: Stats
  console.log('Curriculum stats:');
  console.log(`  Pathway: ${pathway.name}`);
  console.log(`  Units: ${units.length}`);
  console.log(`  Lessons: ${lessons.length} (${lessons.filter(l => l.lesson_type === 'word').length} word, ${lessons.filter(l => l.lesson_type === 'root').length} root, ${lessons.filter(l => l.lesson_type === 'frequency').length} frequency)`);
  console.log(`  Words: ${words.length}`);
  console.log(`  Roots: ${roots.length} defined, ${new Set(wordRoots.map(wr => wr.root_id)).size} used`);
  console.log(`  Word-Root links: ${wordRoots.length}`);
  console.log('');

  // Step 2: Generate quiz questions
  console.log('Generating quiz questions...');
  const quizQuestions = generateAllQuizQuestions(lessons, words, roots, wordRoots);
  console.log(`  Generated ${quizQuestions.length} quiz questions`);
  console.log('');

  // No frequency examples for the Salah First pathway (those are in the High Frequency pathway)
  const frequencyExamples: FrequencyExampleDef[] = [];

  // Step 3: Validate
  console.log('Validating...');
  const { errors, warnings } = validate(
    pathway,
    units,
    lessons,
    words,
    roots,
    wordRoots,
    quizQuestions
  );

  if (warnings.length > 0) {
    console.log(`  ${warnings.length} warnings:`);
    for (const w of warnings) {
      console.log(`    [WARN] ${w.table}/${w.id}: ${w.message}`);
    }
  }

  if (errors.length > 0) {
    console.log(`  ${errors.length} ERRORS:`);
    for (const e of errors) {
      console.log(`    [ERROR] ${e.table}/${e.id}: ${e.message}`);
    }
    console.log('\nFix errors before generating SQL.');
    process.exit(1);
  }

  console.log(`  Validation passed! (${errors.length} errors, ${warnings.length} warnings)`);
  console.log('');

  if (validateOnly) {
    console.log('Validate-only mode. Done.');
    return;
  }

  // Step 4: Generate SQL
  console.log('Generating SQL...');
  const sql = generateSeedSQL(
    pathway,
    units,
    lessons,
    words,
    roots,
    wordRoots,
    frequencyExamples,
    quizQuestions
  );

  // Step 5: Write output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, sql, 'utf-8');

  const sizeKB = (Buffer.byteLength(sql, 'utf-8') / 1024).toFixed(1);
  console.log(`  Written to: ${OUTPUT_FILE} (${sizeKB} KB)`);
  console.log('');

  // Step 6: Summary
  console.log('=== Summary ===');
  console.log(`  ${words.length} words across ${units.length} units`);
  console.log(`  ${lessons.filter(l => l.lesson_type === 'word').length} word lessons`);
  console.log(`  ${lessons.filter(l => l.lesson_type === 'root').length} root lessons`);
  console.log(`  ${quizQuestions.length} quiz questions`);
  console.log(`  ${wordRoots.length} word-root connections`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review: output/seed.sql');
  console.log('  2. Copy:   cp output/seed.sql ../../safar-app/supabase/seed.sql');
  console.log('  3. Apply:  cd ../../safar-app && npx supabase db reset');
}

main();
