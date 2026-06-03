
-- ============ 1. Threads in spaces ============
ALTER TABLE public.space_messages
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.space_messages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_space_messages_parent
  ON public.space_messages(parent_id);

-- ============ 2. Event reminders ============
CREATE TABLE IF NOT EXISTS public.event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  sent_at timestamptz,
  channel text NOT NULL DEFAULT 'browser' CHECK (channel IN ('browser','push','email')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id, channel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_reminders TO authenticated;
GRANT ALL ON public.event_reminders TO service_role;

ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminders"
  ON public.event_reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_remindat
  ON public.event_reminders(user_id, remind_at);

-- ============ 3. Speed networking matching ============
-- Pairs participants of a session by complementarity:
--   score = overlap(interests/sectors) + bonus(different roles)
-- Each user is matched with at most one peer per session.
CREATE OR REPLACE FUNCTION public.compute_speed_matches(_session_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_owner boolean;
  _matched int := 0;
  pair RECORD;
  used uuid[] := ARRAY[]::uuid[];
BEGIN
  -- Only session creator (or admin) may run matching
  SELECT EXISTS (
    SELECT 1 FROM speed_networking_sessions
    WHERE id = _session_id AND created_by = auth.uid()
  ) INTO _is_owner;
  IF NOT _is_owner AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only the session organizer can compute matches';
  END IF;

  -- Reset previous matches
  UPDATE speed_networking_participants
    SET matched_with = NULL
    WHERE session_id = _session_id;

  -- Score every pair and pick greedily by highest score
  FOR pair IN
    SELECT
      a.user_id AS a_id,
      b.user_id AS b_id,
      (
        COALESCE(cardinality(ARRAY(
          SELECT unnest(COALESCE(pa.interests,'{}'::text[]))
          INTERSECT
          SELECT unnest(COALESCE(pb.interests,'{}'::text[]))
        )), 0)
        + COALESCE(cardinality(ARRAY(
          SELECT unnest(COALESCE(pa.looking_for,'{}'::text[]))
          INTERSECT
          SELECT unnest(COALESCE(pb.offering,'{}'::text[]))
        )), 0) * 2
        + COALESCE(cardinality(ARRAY(
          SELECT unnest(COALESCE(pa.offering,'{}'::text[]))
          INTERSECT
          SELECT unnest(COALESCE(pb.looking_for,'{}'::text[]))
        )), 0) * 2
        + CASE WHEN pa.sector IS DISTINCT FROM pb.sector THEN 1 ELSE 0 END
      ) AS score
    FROM speed_networking_participants a
    JOIN speed_networking_participants b
      ON b.session_id = a.session_id AND a.user_id < b.user_id
    JOIN profiles pa ON pa.user_id = a.user_id
    JOIN profiles pb ON pb.user_id = b.user_id
    WHERE a.session_id = _session_id
    ORDER BY score DESC, random()
  LOOP
    IF pair.a_id = ANY(used) OR pair.b_id = ANY(used) THEN
      CONTINUE;
    END IF;
    UPDATE speed_networking_participants
      SET matched_with = pair.b_id
      WHERE session_id = _session_id AND user_id = pair.a_id;
    UPDATE speed_networking_participants
      SET matched_with = pair.a_id
      WHERE session_id = _session_id AND user_id = pair.b_id;
    used := used || pair.a_id || pair.b_id;
    _matched := _matched + 1;

    -- Notify both
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES
      (pair.a_id, 'speed_match', 'Votre match speed networking',
       'Votre partenaire a été désigné pour la prochaine session.',
       _session_id, 'speed_session'),
      (pair.b_id, 'speed_match', 'Votre match speed networking',
       'Votre partenaire a été désigné pour la prochaine session.',
       _session_id, 'speed_session');
  END LOOP;

  RETURN _matched;
END; $$;

GRANT EXECUTE ON FUNCTION public.compute_speed_matches(uuid) TO authenticated;
