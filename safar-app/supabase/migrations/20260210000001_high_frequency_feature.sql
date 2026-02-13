-- ============================================================
-- Migration: High Frequency Words Feature
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add lesson_type column to lessons (backward-compatible, defaults to 'word')
-- Supports: 'word' (default surah lessons), 'root' (root system teaching), 'frequency' (high-frequency words)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'word'
  CHECK (lesson_type IN ('word', 'root', 'frequency'));

-- 2. Add frequency + description columns to words (nullable, only used by frequency words)
ALTER TABLE public.words
  ADD COLUMN IF NOT EXISTS frequency INTEGER,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Create frequency_word_examples table
CREATE TABLE IF NOT EXISTS public.frequency_word_examples (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning TEXT NOT NULL,
  audio_url TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_freq_examples_word_id
  ON public.frequency_word_examples(word_id);

ALTER TABLE public.frequency_word_examples ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'frequency_word_examples'
    AND policyname = 'Anyone can read frequency examples'
  ) THEN
    CREATE POLICY "Anyone can read frequency examples"
      ON public.frequency_word_examples FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- Seed: High Frequency Pathway
-- ============================================================

INSERT INTO public.pathways (id, name, slug, description, promise, total_words, total_units, preview_items, is_active)
VALUES (
  'high-frequency',
  'High Frequency',
  'high-frequency',
  '80% of Quranic vocabulary.',
  'Learn the most common words in the Quran',
  50,
  1,
  ARRAY['وَ', 'فِي', 'مِن'],
  true
)
ON CONFLICT (id) DO NOTHING;

-- Unit: Common Particles
INSERT INTO public.units (id, pathway_id, name, description, "order", word_count)
VALUES (
  'hf-u1-particles',
  'high-frequency',
  'Common Particles',
  'The most frequently occurring particles in the Quran',
  1,
  3
)
ON CONFLICT (id) DO NOTHING;

-- Frequency Lessons (lesson_type = 'frequency')
INSERT INTO public.lessons (id, unit_id, name, "order", word_count, lesson_type)
VALUES
  ('hf-u1-l1-wa',  'hf-u1-particles', 'The Connector: Wa',  1, 1, 'frequency'),
  ('hf-u1-l2-fi',  'hf-u1-particles', 'The Vessel: Fi',     2, 1, 'frequency'),
  ('hf-u1-l3-min', 'hf-u1-particles', 'The Origin: Min',    3, 1, 'frequency')
ON CONFLICT (id) DO NOTHING;

-- Frequency Words (one per lesson, with frequency count + description)
INSERT INTO public.words (id, lesson_id, arabic, transliteration, meaning, "order", frequency, description)
VALUES
  ('w-wa',  'hf-u1-l1-wa',  'وَ',  'Wa',  'And',   1, 9800,
   'The most common particle. It connects ideas, stories, and blessings.'),
  ('w-fi',  'hf-u1-l2-fi',  'فِي', 'Fi',  'In',    1, 3200,
   'Places things within context. Where something exists or occurs.'),
  ('w-min', 'hf-u1-l3-min', 'مِن', 'Min', 'From',  1, 3000,
   'Indicates origin, source, and the beginning of journeys.')
ON CONFLICT (id) DO NOTHING;

-- Frequency Word Examples
INSERT INTO public.frequency_word_examples (id, word_id, arabic, transliteration, meaning, "order")
VALUES
  ('fex-wa-1', 'w-wa', 'وَالشَّمْسِ',  'Wash-shams',    'And the sun',       1),
  ('fex-wa-2', 'w-wa', 'وَالْقَمَرِ',  'Wal-qamar',     'And the moon',      2),
  ('fex-wa-3', 'w-wa', 'وَالنَّهَارِ', 'Wan-nahar',     'And the day',       3),
  ('fex-fi-1', 'w-fi', 'فِي الْأَرْضِ',  'Fil-ard',       'In the earth',      1),
  ('fex-fi-2', 'w-fi', 'فِي السَّمَاءِ',  'Fis-samaa',     'In the sky',        2),
  ('fex-fi-3', 'w-fi', 'فِي قُلُوبِهِمْ',  'Fi quloobihim', 'In their hearts',   3),
  ('fex-min-1', 'w-min', 'مِنَ السَّمَاءِ', 'Minas-samaa',   'From the sky',      1),
  ('fex-min-2', 'w-min', 'مِن رَبِّكَ',    'Min rabbik',    'From your Lord',    2),
  ('fex-min-3', 'w-min', 'مِنَ النَّاسِ',  'Minan-naas',    'From mankind',      3)
ON CONFLICT (id) DO NOTHING;
