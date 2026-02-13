-- Story 5.4: XP hardening
-- - Enforce cumulative non-negative totals
-- - Add atomic increment RPC to prevent lost updates

UPDATE user_xp
SET total_xp = 0
WHERE total_xp IS NULL OR total_xp < 0;

ALTER TABLE user_xp
ALTER COLUMN total_xp SET NOT NULL;

ALTER TABLE user_xp
ALTER COLUMN total_xp SET DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_xp_total_xp_non_negative'
  ) THEN
    ALTER TABLE user_xp
    ADD CONSTRAINT user_xp_total_xp_non_negative
    CHECK (total_xp >= 0);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_user_xp(
  p_user_id UUID,
  p_delta INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
BEGIN
  IF p_delta IS NULL OR p_delta < 0 THEN
    RAISE EXCEPTION 'XP delta must be non-negative';
  END IF;

  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Cannot modify another user XP';
  END IF;

  INSERT INTO user_xp (user_id, total_xp, created_at, updated_at)
  VALUES (p_user_id, p_delta, NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE
    SET total_xp = user_xp.total_xp + EXCLUDED.total_xp,
        updated_at = NOW()
  RETURNING total_xp INTO v_total;

  RETURN v_total;
END;
$$;
