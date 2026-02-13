-- Create user_streaks table for daily streak tracking
-- Story 5.2: Streak Tracking

CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  freeze_used_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast user lookups
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);

-- Enable Row Level Security
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own streaks
CREATE POLICY "Users can manage own streaks"
  ON user_streaks FOR ALL
  USING (auth.uid() = user_id);
