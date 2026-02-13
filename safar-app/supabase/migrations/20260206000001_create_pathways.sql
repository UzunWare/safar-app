-- Migration: Create pathways table
-- Learning pathways (e.g., "Salah First") - read-only content

-- Ensure handle_updated_at() exists (originally defined in user_profiles migration).
-- Repeated here so content-table migrations are self-contained.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.pathways (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  promise TEXT NOT NULL,
  total_words INTEGER NOT NULL DEFAULT 0,
  total_units INTEGER NOT NULL DEFAULT 0,
  preview_items TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.pathways IS 'Learning pathways - read-only content seeded by admin';

-- Enable Row Level Security
ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read pathways (read-only content, needed pre-auth for onboarding)
CREATE POLICY "Anyone can read pathways"
  ON public.pathways FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger (reuses function from user_profiles migration)
CREATE TRIGGER set_pathways_updated_at
  BEFORE UPDATE ON public.pathways
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
