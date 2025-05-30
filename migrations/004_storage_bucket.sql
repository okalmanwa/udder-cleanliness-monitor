-- Create storage bucket for udder images
INSERT INTO storage.buckets (id, name, public)
VALUES ('udder-images', 'udder-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public read access to udder images"
ON storage.objects FOR SELECT
USING (bucket_id = 'udder-images');

CREATE POLICY "Allow authenticated users to upload udder images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'udder-images'
  AND auth.role() = 'authenticated'
); 