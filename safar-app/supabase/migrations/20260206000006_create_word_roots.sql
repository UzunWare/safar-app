-- Migration: Create word_roots junction table
-- Many-to-many relationship between words and Arabic roots

CREATE TABLE IF NOT EXISTS public.word_roots (
  word_id TEXT NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  root_id TEXT NOT NULL REFERENCES public.roots(id) ON DELETE CASCADE,
  PRIMARY KEY (word_id, root_id)
);

COMMENT ON TABLE public.word_roots IS 'Junction table linking words to their Arabic roots';

-- Index for root-based lookups (word_id covered by composite PK)
CREATE INDEX idx_word_roots_root_id ON public.word_roots(root_id);

-- Enable Row Level Security
ALTER TABLE public.word_roots ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read word_roots (read-only content)
CREATE POLICY "Anyone can read word_roots"
  ON public.word_roots FOR SELECT
  TO anon, authenticated
  USING (true);
