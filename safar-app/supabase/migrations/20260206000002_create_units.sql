-- Migration: Create units table
-- Units within pathways (e.g., "Al-Fatiha") - read-only content

CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY,
  pathway_id TEXT NOT NULL REFERENCES public.pathways(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.units IS 'Units within learning pathways - read-only content';

-- Index for pathway lookups
CREATE INDEX idx_units_pathway_id ON public.units(pathway_id);

-- Prevent duplicate ordering within a pathway
CREATE UNIQUE INDEX idx_units_pathway_order ON public.units(pathway_id, "order");

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read units (read-only content)
CREATE POLICY "Anyone can read units"
  ON public.units FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger
CREATE TRIGGER set_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
