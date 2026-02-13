-- Export Requests Table (GDPR Data Export)
-- Story 7.7: Track user data export requests
CREATE TABLE IF NOT EXISTS public.export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own export requests
CREATE POLICY "Users can view own export requests"
  ON public.export_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via Edge Function)
CREATE POLICY "Service role can manage export requests"
  ON public.export_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Index for user lookups
CREATE INDEX idx_export_requests_user_id ON public.export_requests(user_id);
CREATE INDEX idx_export_requests_status ON public.export_requests(status);
