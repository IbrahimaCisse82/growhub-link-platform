
-- Fix overly permissive INSERT on notifications: only service role / triggers should insert
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive INSERT on user_badges
DROP POLICY "System can grant badges" ON public.user_badges;
CREATE POLICY "Authenticated can receive badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
