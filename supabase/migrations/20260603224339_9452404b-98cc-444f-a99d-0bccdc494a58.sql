
-- 1. Add last_used_at to activated tools
ALTER TABLE public.user_activated_tools
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

-- 2. Activation events log
CREATE TABLE IF NOT EXISTS public.tool_activation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_key text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('activate','deactivate','open')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.tool_activation_events TO authenticated;
GRANT ALL ON public.tool_activation_events TO service_role;

ALTER TABLE public.tool_activation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own tool events"
  ON public.tool_activation_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read their own tool events"
  ON public.tool_activation_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tool_events_user_created
  ON public.tool_activation_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_events_key_type
  ON public.tool_activation_events(tool_key, event_type);
