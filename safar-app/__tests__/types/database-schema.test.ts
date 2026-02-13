/**
 * Database Schema Type Tests
 *
 * Validates that supabase.types.ts defines all learning content tables
 * with the correct column shapes. These are compile-time type checks
 * expressed as runtime assertions on type structure.
 */
import type {
  Database,
  Pathway,
  Unit,
  Lesson,
  Word,
  Root,
  WordRoot,
  PathwayWithUnits,
  UserProfile,
  UserLessonProgress,
  UserLessonProgressInsert,
} from '@/types/supabase.types';

describe('Database Schema Types', () => {
  describe('pathways table', () => {
    it('has all required columns', () => {
      const row: Pathway = {
        id: 'salah-first',
        name: 'Salah First',
        slug: 'salah-first',
        description: 'Master the vocabulary of your daily prayers',
        promise: 'Understand every word you say in salah',
        total_words: 120,
        total_units: 6,
        preview_items: ['الْحَمْدُ'],
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.id).toBe('salah-first');
      expect(typeof row.total_words).toBe('number');
      expect(typeof row.is_active).toBe('boolean');
      expect(Array.isArray(row.preview_items)).toBe(true);
    });
  });

  describe('units table', () => {
    it('has all required columns with pathway FK', () => {
      const row: Unit = {
        id: 'sf-u1-fatiha',
        pathway_id: 'salah-first',
        name: 'Al-Fatiha',
        order: 1,
        word_count: 20,
        description: 'The Opening',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.pathway_id).toBe('salah-first');
      expect(typeof row.order).toBe('number');
    });

    it('allows nullable description', () => {
      const row: Unit = {
        id: 'sf-u2',
        pathway_id: 'salah-first',
        name: 'Ruku',
        order: 2,
        word_count: 15,
        description: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.description).toBeNull();
    });
  });

  describe('lessons table', () => {
    it('has all required columns with unit FK', () => {
      const row: Lesson = {
        id: 'sf-u1-l1',
        unit_id: 'sf-u1-fatiha',
        name: 'Ayat 1-3',
        lesson_type: 'word',
        order: 1,
        word_count: 7,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.unit_id).toBe('sf-u1-fatiha');
      expect(typeof row.word_count).toBe('number');
    });
  });

  describe('words table', () => {
    it('has all required columns with lesson FK', () => {
      const row: Word = {
        id: 'w-bismi',
        lesson_id: 'sf-u1-l1',
        arabic: 'بِسْمِ',
        transliteration: 'bismi',
        meaning: 'In the name of',
        audio_url: null,
        description: null,
        frequency: null,
        order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.arabic).toBe('بِسْمِ');
      expect(row.lesson_id).toBe('sf-u1-l1');
    });

    it('allows nullable audio_url', () => {
      const row: Word = {
        id: 'w-test',
        lesson_id: 'sf-u1-l1',
        arabic: 'test',
        transliteration: 'test',
        meaning: 'test',
        audio_url: null,
        description: null,
        frequency: null,
        order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.audio_url).toBeNull();
    });

    it('accepts audio_url string', () => {
      const row: Word = {
        id: 'w-test2',
        lesson_id: 'sf-u1-l1',
        arabic: 'test',
        transliteration: 'test',
        meaning: 'test',
        audio_url: 'https://example.com/audio.mp3',
        description: null,
        frequency: null,
        order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.audio_url).toBe('https://example.com/audio.mp3');
    });
  });

  describe('roots table', () => {
    it('has all required columns', () => {
      const row: Root = {
        id: 'r-hmd',
        letters: 'ح-م-د',
        meaning: 'praise, commendation',
        transliteration: 'h-m-d',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.letters).toBe('ح-م-د');
      expect(typeof row.meaning).toBe('string');
    });

    it('allows nullable transliteration', () => {
      const row: Root = {
        id: 'r-test',
        letters: 'ت-س-ت',
        meaning: 'test',
        transliteration: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      expect(row.transliteration).toBeNull();
    });
  });

  describe('word_roots junction table', () => {
    it('has composite key columns', () => {
      const row: WordRoot = {
        word_id: 'w-bismi',
        root_id: 'r-smw',
      };
      expect(row.word_id).toBe('w-bismi');
      expect(row.root_id).toBe('r-smw');
    });
  });

  describe('user_profiles table', () => {
    it('has onboarding tracking fields', () => {
      const row: UserProfile = {
        id: 'user-123',
        display_name: 'Test User',
        avatar_url: null,
        onboarding_completed: true,
        onboarding_completed_at: '2026-02-09T10:00:00Z',
        script_reading_ability: 'learning',
        created_at: '2026-02-09T09:00:00Z',
        updated_at: '2026-02-09T10:00:00Z',
      };
      expect(typeof row.onboarding_completed).toBe('boolean');
      expect(row.onboarding_completed).toBe(true);
      expect(row.onboarding_completed_at).toBe('2026-02-09T10:00:00Z');
    });

    it('allows nullable onboarding_completed_at for incomplete onboarding', () => {
      const row: UserProfile = {
        id: 'user-456',
        display_name: null,
        avatar_url: null,
        onboarding_completed: false,
        onboarding_completed_at: null,
        script_reading_ability: null,
        created_at: '2026-02-09T09:00:00Z',
        updated_at: '2026-02-09T09:00:00Z',
      };
      expect(row.onboarding_completed).toBe(false);
      expect(row.onboarding_completed_at).toBeNull();
    });

    it('has script_reading_ability enum field', () => {
      const fluent: UserProfile = {
        id: 'user-789',
        display_name: null,
        avatar_url: null,
        onboarding_completed: true,
        onboarding_completed_at: '2026-02-09T10:00:00Z',
        script_reading_ability: 'fluent',
        created_at: '2026-02-09T09:00:00Z',
        updated_at: '2026-02-09T10:00:00Z',
      };
      expect(fluent.script_reading_ability).toBe('fluent');

      const learning: UserProfile = {
        id: 'user-101',
        display_name: null,
        avatar_url: null,
        onboarding_completed: true,
        onboarding_completed_at: '2026-02-09T10:00:00Z',
        script_reading_ability: 'learning',
        created_at: '2026-02-09T09:00:00Z',
        updated_at: '2026-02-09T10:00:00Z',
      };
      expect(learning.script_reading_ability).toBe('learning');
    });
  });

  describe('user_lesson_progress table', () => {
    it('has all required columns', () => {
      const row: UserLessonProgress = {
        id: 'progress-1',
        user_id: 'user-123',
        lesson_id: 'sf-u1-l1',
        completed_at: '2026-02-09T12:00:00Z',
        is_synced: true,
        updated_at: '2026-02-09T12:00:00Z',
      };
      expect(row.user_id).toBe('user-123');
      expect(row.lesson_id).toBe('sf-u1-l1');
      expect(typeof row.is_synced).toBe('boolean');
    });

    it('insert type allows optional fields', () => {
      const insert: UserLessonProgressInsert = {
        user_id: 'user-123',
        lesson_id: 'sf-u1-l1',
      };
      expect(insert.user_id).toBe('user-123');
      expect(insert.id).toBeUndefined();
      expect(insert.completed_at).toBeUndefined();
      expect(insert.is_synced).toBeUndefined();
    });
  });

  describe('relationship types', () => {
    it('PathwayWithUnits combines pathway and units', () => {
      const pathway: PathwayWithUnits = {
        id: 'salah-first',
        name: 'Salah First',
        slug: 'salah-first',
        description: 'Test',
        promise: 'Test',
        total_words: 120,
        total_units: 6,
        preview_items: [],
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        units: [
          {
            id: 'sf-u1-fatiha',
            pathway_id: 'salah-first',
            name: 'Al-Fatiha',
            order: 1,
            word_count: 20,
            description: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      };
      expect(pathway.units).toHaveLength(1);
      expect(pathway.units[0].pathway_id).toBe(pathway.id);
    });
  });

  describe('foreign key relationships', () => {
    it('unit.pathway_id references pathway.id', () => {
      const pathway: Pathway = {
        id: 'salah-first',
        name: 'Salah First',
        slug: 'salah-first',
        description: 'Test',
        promise: 'Test',
        total_words: 0,
        total_units: 0,
        preview_items: [],
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      const unit: Unit = {
        id: 'sf-u1',
        pathway_id: pathway.id,
        name: 'Unit 1',
        order: 1,
        word_count: 0,
        description: null,
        created_at: '',
        updated_at: '',
      };
      expect(unit.pathway_id).toBe(pathway.id);
    });

    it('lesson.unit_id references unit.id', () => {
      const unit: Unit = {
        id: 'sf-u1',
        pathway_id: 'salah-first',
        name: 'Unit 1',
        order: 1,
        word_count: 0,
        description: null,
        created_at: '',
        updated_at: '',
      };
      const lesson: Lesson = {
        id: 'sf-u1-l1',
        unit_id: unit.id,
        name: 'Lesson 1',
        lesson_type: 'word',
        order: 1,
        word_count: 0,
        created_at: '',
        updated_at: '',
      };
      expect(lesson.unit_id).toBe(unit.id);
    });

    it('word.lesson_id references lesson.id', () => {
      const lesson: Lesson = {
        id: 'sf-u1-l1',
        unit_id: 'sf-u1',
        name: 'Lesson 1',
        lesson_type: 'word',
        order: 1,
        word_count: 0,
        created_at: '',
        updated_at: '',
      };
      const word: Word = {
        id: 'w-bismi',
        lesson_id: lesson.id,
        arabic: 'بِسْمِ',
        transliteration: 'bismi',
        meaning: 'In the name of',
        audio_url: null,
        description: null,
        frequency: null,
        order: 1,
        created_at: '',
        updated_at: '',
      };
      expect(word.lesson_id).toBe(lesson.id);
    });

    it('word_roots links words to roots', () => {
      const word: Word = {
        id: 'w-bismi',
        lesson_id: 'sf-u1-l1',
        arabic: 'بِسْمِ',
        transliteration: 'bismi',
        meaning: 'In the name of',
        audio_url: null,
        description: null,
        frequency: null,
        order: 1,
        created_at: '',
        updated_at: '',
      };
      const root: Root = {
        id: 'r-smw',
        letters: 'س-م-و',
        meaning: 'name',
        transliteration: 's-m-w',
        created_at: '',
        updated_at: '',
      };
      const link: WordRoot = {
        word_id: word.id,
        root_id: root.id,
      };
      expect(link.word_id).toBe(word.id);
      expect(link.root_id).toBe(root.id);
    });
  });
});
