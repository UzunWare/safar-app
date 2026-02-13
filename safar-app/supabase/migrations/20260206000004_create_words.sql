-- Migration: Create words table
-- Vocabulary items within lessons - read-only content

CREATE TABLE IF NOT EXISTS public.words (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning TEXT NOT NULL,
  audio_url TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.words IS 'Vocabulary words within lessons - read-only content';

-- Index for lesson lookups
CREATE INDEX idx_words_lesson_id ON public.words(lesson_id);

-- Prevent duplicate ordering within a lesson
CREATE UNIQUE INDEX idx_words_lesson_order ON public.words(lesson_id, "order");

-- Enable Row Level Security
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read words (read-only content)
CREATE POLICY "Anyone can read words"
  ON public.words FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger
CREATE TRIGGER set_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
