-- Migration: Create roots table
-- Arabic 3-letter roots - read-only content

CREATE TABLE IF NOT EXISTS public.roots (
  id TEXT PRIMARY KEY,
  letters TEXT NOT NULL UNIQUE,
  meaning TEXT NOT NULL,
  transliteration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.roots IS 'Arabic trilateral roots - read-only content';

-- Enable Row Level Security
ALTER TABLE public.roots ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read roots (read-only content)
CREATE POLICY "Anyone can read roots"
  ON public.roots FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger
CREATE TRIGGER set_roots_updated_at
  BEFORE UPDATE ON public.roots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
