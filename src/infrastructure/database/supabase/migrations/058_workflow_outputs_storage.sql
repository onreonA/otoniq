-- ================================================
-- Workflow Outputs Storage Bucket
-- Create Supabase Storage bucket for workflow outputs
-- ================================================

-- Create storage bucket for workflow outputs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workflow-outputs',
  'workflow-outputs',
  true, -- Public bucket for easy access
  52428800, -- 50MB file size limit
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'text/html',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for workflow-outputs bucket

-- Allow authenticated users to upload files to their tenant folder
CREATE POLICY "Users can upload files to their tenant folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'workflow-outputs' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
);

-- Allow authenticated users to read files from their tenant folder
CREATE POLICY "Users can read files from their tenant folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'workflow-outputs' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
);

-- Allow public read access (since bucket is public)
CREATE POLICY "Public can read workflow outputs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workflow-outputs');

-- Allow authenticated users to update files in their tenant folder
CREATE POLICY "Users can update files in their tenant folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'workflow-outputs' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
);

-- Allow authenticated users to delete files from their tenant folder
CREATE POLICY "Users can delete files from their tenant folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'workflow-outputs' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
);

COMMENT ON TABLE storage.buckets IS 'Storage bucket for workflow outputs (reports, images, videos, etc.)';

