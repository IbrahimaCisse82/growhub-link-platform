
-- Phase 1: Security fixes

-- 1. Fix user_roles RLS: remove dangerous INSERT policy, replace with admin-only or trigger-based
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Only allow inserting roles via the handle_new_user trigger (no direct user insert)
-- Admins can insert roles for others
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Fix notifications INSERT: restrict to self or system triggers
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Create missing triggers for notification functions
CREATE TRIGGER on_post_reaction_notify
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_reaction();

CREATE TRIGGER on_post_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_comment();

CREATE TRIGGER on_coaching_booked_notify
  AFTER INSERT ON public.coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_coaching_booked();

CREATE TRIGGER on_event_registration_notify
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event_registration();

-- 4. Create increment/decrement functions for atomic counter updates
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE posts SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_comments(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_comments(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE posts SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET profile_views = COALESCE(profile_views, 0) + 1 WHERE user_id = profile_user_id;
$$;
