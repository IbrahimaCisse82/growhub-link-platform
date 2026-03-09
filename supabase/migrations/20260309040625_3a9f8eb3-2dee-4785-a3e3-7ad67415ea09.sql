
-- Fix: restrict intent_profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view active intents" ON public.intent_profiles;
CREATE POLICY "Authenticated users can view active intents"
ON public.intent_profiles FOR SELECT
TO authenticated
USING (is_active = true);

-- Fix: restrict challenge_participants SELECT to authenticated users only
DROP POLICY IF EXISTS "Participants viewable by all" ON public.challenge_participants;
CREATE POLICY "Authenticated users can view participants"
ON public.challenge_participants FOR SELECT
TO authenticated
USING (true);
