-- 1. Student career profiles: remove overly permissive policy
DROP POLICY IF EXISTS "Student profiles viewable by authenticated" ON public.student_career_profiles;

-- Owner-only access
DROP POLICY IF EXISTS "Students manage own career profile" ON public.student_career_profiles;
CREATE POLICY "Students manage own career profile"
ON public.student_career_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can read all
DROP POLICY IF EXISTS "Admins can view student profiles" ON public.student_career_profiles;
CREATE POLICY "Admins can view student profiles"
ON public.student_career_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. deal-room-docs storage: require deal room membership on upload
-- Storage path convention: first path segment is the deal room id
DROP POLICY IF EXISTS "deal_docs_upload" ON storage.objects;
CREATE POLICY "deal_docs_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deal-room-docs'
  AND public.is_deal_room_member((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Same membership check for update/delete on deal-room-docs
DROP POLICY IF EXISTS "deal_docs_update" ON storage.objects;
CREATE POLICY "deal_docs_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deal-room-docs'
  AND public.is_deal_room_member((storage.foldername(name))[1]::uuid, auth.uid())
);

DROP POLICY IF EXISTS "deal_docs_delete" ON storage.objects;
CREATE POLICY "deal_docs_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'deal-room-docs'
  AND public.is_deal_room_member((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Read access also scoped to members
DROP POLICY IF EXISTS "deal_docs_read" ON storage.objects;
CREATE POLICY "deal_docs_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deal-room-docs'
  AND public.is_deal_room_member((storage.foldername(name))[1]::uuid, auth.uid())
);