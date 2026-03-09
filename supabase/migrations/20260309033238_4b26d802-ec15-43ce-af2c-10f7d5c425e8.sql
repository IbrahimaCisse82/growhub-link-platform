-- FIX 1: Remove dangerous UPDATE policy on user_roles (privilege escalation)
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

-- FIX 2: Fix notifications INSERT policy (prevent injection to other users)
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;
CREATE POLICY "Users can create notifications for themselves" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- FIX 3: Fix posts SELECT to respect private circles
DROP POLICY IF EXISTS "Posts are viewable by authenticated" ON public.posts;
CREATE POLICY "Posts are viewable respecting circle privacy" ON public.posts
  FOR SELECT TO authenticated
  USING (
    circle_id IS NULL
    OR EXISTS (SELECT 1 FROM circles WHERE circles.id = posts.circle_id AND circles.is_private = false)
    OR EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = posts.circle_id AND circle_members.user_id = auth.uid())
    OR author_id = auth.uid()
  );

-- FIX 4: Fix circles SELECT to respect privacy
DROP POLICY IF EXISTS "Circles viewable by authenticated" ON public.circles;
CREATE POLICY "Circles viewable respecting privacy" ON public.circles
  FOR SELECT TO authenticated
  USING (
    is_private = false
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circles.id AND circle_members.user_id = auth.uid())
  );

-- FIX 4b: Fix circle_members SELECT
DROP POLICY IF EXISTS "Members viewable by authenticated" ON public.circle_members;
CREATE POLICY "Members viewable by circle members" ON public.circle_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM circle_members cm2 WHERE cm2.circle_id = circle_members.circle_id AND cm2.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM circles WHERE circles.id = circle_members.circle_id AND circles.is_private = false)
  );

-- FIX 5: Fix speed_networking_participants SELECT
DROP POLICY IF EXISTS "Participants viewable by all" ON public.speed_networking_participants;
CREATE POLICY "Participants viewable by own or session creator" ON public.speed_networking_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM speed_networking_sessions WHERE speed_networking_sessions.id = speed_networking_participants.session_id AND speed_networking_sessions.created_by = auth.uid())
  );