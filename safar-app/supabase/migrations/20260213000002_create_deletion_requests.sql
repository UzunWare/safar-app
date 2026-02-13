-- Deletion Requests Table (GDPR Data Deletion)
-- Story 7.8: Track user data deletion requests (data-only, account preserved)
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'data_only' CHECK (type IN ('data_only')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON public.deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via Edge Function)
CREATE POLICY "Service role can manage deletion requests"
  ON public.deletion_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Index for user lookups
CREATE INDEX idx_deletion_requests_user_id ON public.deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON public.deletion_requests(status);
