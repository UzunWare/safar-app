-- User Word Progress table for spaced repetition (SM-2)
-- Tracks per-word learning state for each user
CREATE TABLE IF NOT EXISTS user_word_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
  interval INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Index for efficient review queue queries (find words due for review)
CREATE INDEX idx_user_word_progress_review
  ON user_word_progress(user_id, next_review)
  WHERE status IN ('learning', 'review');

-- RLS policies
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own word progress"
  ON user_word_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own word progress"
  ON user_word_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own word progress"
  ON user_word_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own word progress"
  ON user_word_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_word_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_word_progress_updated_at
  BEFORE UPDATE ON user_word_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_word_progress_updated_at();
