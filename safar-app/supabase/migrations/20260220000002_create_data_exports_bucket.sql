-- Create data-exports storage bucket for GDPR export files
-- Referenced by: process-data-export edge function
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-exports',
  'data-exports',
  false,
  10485760,  -- 10MB limit per file
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Only service role can upload/manage files (edge functions)
CREATE POLICY "Service role can manage export files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'data-exports' AND auth.role() = 'service_role');

-- RLS: Users can read their own export files via signed URLs
CREATE POLICY "Users can read own export files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'data-exports'
    AND (storage.foldername(name))[1] = 'exports'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
