-- 1. Deal room docs: remove weaker SELECT policy bypassing NDA
DROP POLICY IF EXISTS "Room members can view docs" ON public.deal_room_documents;
DROP POLICY IF EXISTS "Room members can upload docs" ON public.deal_room_documents;

-- 2. Student career profiles: authenticated only
DROP POLICY IF EXISTS "Student profiles publicly viewable" ON public.student_career_profiles;
CREATE POLICY "Student profiles viewable by authenticated"
ON public.student_career_profiles FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.student_career_profiles FROM anon;

-- 3. Company logos: ownership checks
DROP POLICY IF EXISTS "Users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company logos" ON storage.objects;

CREATE POLICY "Owners can upload company logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos' AND EXISTS (
  SELECT 1 FROM public.company_pages c
  WHERE c.owner_id = auth.uid() AND c.id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Owners can update company logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-logos' AND EXISTS (
  SELECT 1 FROM public.company_pages c
  WHERE c.owner_id = auth.uid() AND c.id::text = (storage.foldername(name))[1]
));

CREATE POLICY "Owners can delete company logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-logos' AND EXISTS (
  SELECT 1 FROM public.company_pages c
  WHERE c.owner_id = auth.uid() AND c.id::text = (storage.foldername(name))[1]
));

-- 4. Avatars / post-media: enforce folder ownership on INSERT
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;

CREATE POLICY "Users upload own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own post media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = auth.uid()::text);