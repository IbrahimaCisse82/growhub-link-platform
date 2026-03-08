
-- Fix permissive RLS: restrict poll creation to post author
DROP POLICY "Users can create polls" ON public.polls;
CREATE POLICY "Users can create polls for their posts" ON public.polls FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
);
