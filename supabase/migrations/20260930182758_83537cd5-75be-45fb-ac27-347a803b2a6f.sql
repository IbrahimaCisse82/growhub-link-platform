CREATE OR REPLACE FUNCTION public.is_circle_member(_circle uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle AND user_id = _user)
$$;
CREATE OR REPLACE FUNCTION public.is_public_circle(_circle uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circles WHERE id = _circle AND is_private = false)
$$;
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid,uuid), public.is_public_circle(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_circle_member(uuid,uuid), public.is_public_circle(uuid) TO authenticated;

DROP POLICY "Members viewable by circle members" ON public.circle_members;
CREATE POLICY "Members viewable by circle members" ON public.circle_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_circle_member(circle_id, auth.uid()) OR public.is_public_circle(circle_id));

DROP POLICY "Circles viewable respecting privacy" ON public.circles;
CREATE POLICY "Circles viewable respecting privacy" ON public.circles FOR SELECT
USING (is_private = false OR created_by = auth.uid() OR public.is_circle_member(id, auth.uid()));

DROP POLICY "Posts are viewable respecting circle privacy" ON public.posts;
CREATE POLICY "Posts are viewable respecting circle privacy" ON public.posts FOR SELECT
USING (circle_id IS NULL OR author_id = auth.uid() OR public.is_public_circle(circle_id) OR public.is_circle_member(circle_id, auth.uid()));