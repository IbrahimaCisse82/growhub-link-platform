CREATE OR REPLACE FUNCTION public.is_deal_room_owner(_room uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user)
$$;
REVOKE EXECUTE ON FUNCTION public.is_deal_room_owner(uuid,uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_deal_room_owner(uuid,uuid) TO authenticated;

DROP POLICY "Members can view membership" ON public.deal_room_members;
CREATE POLICY "Members can view membership" ON public.deal_room_members FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_deal_room_owner(deal_room_id, auth.uid()));
DROP POLICY "Owners can manage members" ON public.deal_room_members;
CREATE POLICY "Owners can manage members" ON public.deal_room_members FOR INSERT TO authenticated
WITH CHECK (public.is_deal_room_owner(deal_room_id, auth.uid()));
DROP POLICY "Owners can remove members" ON public.deal_room_members;
CREATE POLICY "Owners can remove members" ON public.deal_room_members FOR DELETE TO authenticated
USING (public.is_deal_room_owner(deal_room_id, auth.uid()) OR auth.uid() = user_id);