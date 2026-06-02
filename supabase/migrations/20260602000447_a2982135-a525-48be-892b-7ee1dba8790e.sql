
-- Online presence
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET last_seen_at = now() WHERE user_id = auth.uid();
$$;

-- Blocked users
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see who they blocked or who blocked them" ON public.blocked_users
  FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can block others" ON public.blocked_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON public.blocked_users
  FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- Helper: block check (security definer to be reusable in RLS)
CREATE OR REPLACE FUNCTION public.is_blocked(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blocked_users
                 WHERE (blocker_id = _a AND blocked_id = _b)
                    OR (blocker_id = _b AND blocked_id = _a));
$$;

-- Helper: connection check
CREATE OR REPLACE FUNCTION public.are_connected(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
      AND ((requester_id = _a AND receiver_id = _b) OR (requester_id = _b AND receiver_id = _a))
  );
$$;

-- Tighten messages: must be connected and not blocked
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.are_connected(sender_id, receiver_id)
    AND NOT public.is_blocked(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND NOT public.is_blocked(sender_id, receiver_id)
  );

-- Message reports
CREATE TABLE public.message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, reporter_id)
);

GRANT SELECT, INSERT ON public.message_reports TO authenticated;
GRANT ALL ON public.message_reports TO service_role;

ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users report messages" ON public.message_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters & admins view" ON public.message_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
