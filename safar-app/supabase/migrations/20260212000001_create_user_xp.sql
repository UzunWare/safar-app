-- Create user_xp table for XP points tracking
-- Story 5.4: XP Points System

CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast user lookups
CREATE INDEX idx_user_xp_user_id ON user_xp(user_id);

-- Enable Row Level Security
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own XP
CREATE POLICY "Users can manage own XP"
  ON user_xp FOR ALL
  USING (auth.uid() = user_id);
