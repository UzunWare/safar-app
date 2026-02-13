-- Migration: Create lessons table
-- Lessons within units - read-only content

CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lessons IS 'Lessons within units - read-only content';

-- Index for unit lookups
CREATE INDEX idx_lessons_unit_id ON public.lessons(unit_id);

-- Prevent duplicate ordering within a unit
CREATE UNIQUE INDEX idx_lessons_unit_order ON public.lessons(unit_id, "order");

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read lessons (read-only content)
CREATE POLICY "Anyone can read lessons"
  ON public.lessons FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger
CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
