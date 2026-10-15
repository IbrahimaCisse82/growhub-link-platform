CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user_id)
     AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE OR REPLACE FUNCTION public.are_connected(_a uuid, _b uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() IN (_a, _b)) AND EXISTS (
    SELECT 1 FROM public.connections WHERE status = 'accepted'
      AND ((requester_id = _a AND receiver_id = _b) OR (requester_id = _b AND receiver_id = _a))) $$;
CREATE OR REPLACE FUNCTION public.is_blocked(_a uuid, _b uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() IN (_a, _b)) AND EXISTS (SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = _a AND blocked_id = _b) OR (blocker_id = _b AND blocked_id = _a)) $$;
CREATE OR REPLACE FUNCTION public.has_signed_nda(_room uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user) AND (
    EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user)
    OR EXISTS(SELECT 1 FROM public.deal_room_ndas WHERE deal_room_id = _room AND user_id = _user)) $$;
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user)
     AND EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle AND user_id = _user) $$;
CREATE OR REPLACE FUNCTION public.is_deal_room_member(_room uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user) AND (
    EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user)
    OR EXISTS(SELECT 1 FROM public.deal_room_members WHERE deal_room_id = _room AND user_id = _user)) $$;
CREATE OR REPLACE FUNCTION public.is_deal_room_owner(_room uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user)
     AND EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user) $$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.are_connected(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_signed_nda(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_deal_room_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_deal_room_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role), public.are_connected(uuid, uuid), public.is_blocked(uuid, uuid), public.has_signed_nda(uuid, uuid), public.is_circle_member(uuid, uuid), public.is_deal_room_member(uuid, uuid), public.is_deal_room_owner(uuid, uuid) TO authenticated, service_role;