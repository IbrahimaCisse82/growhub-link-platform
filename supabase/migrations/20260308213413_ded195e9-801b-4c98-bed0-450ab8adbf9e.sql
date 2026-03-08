
-- Add intent fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS offering text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS headline text DEFAULT NULL;

-- Speed networking sessions table
CREATE TABLE public.speed_networking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Speed Networking',
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 5,
  max_participants integer DEFAULT 20,
  status text NOT NULL DEFAULT 'upcoming',
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Speed networking participants
CREATE TABLE public.speed_networking_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.speed_networking_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  matched_with uuid,
  feedback text,
  rating integer,
  UNIQUE(session_id, user_id)
);

-- Recommendations table already exists, but let's add a text-based recommendation system
-- Already have recommendations table, skip

-- Enable RLS
ALTER TABLE public.speed_networking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speed_networking_participants ENABLE ROW LEVEL SECURITY;

-- Policies for speed_networking_sessions
CREATE POLICY "Sessions viewable by authenticated" ON public.speed_networking_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create sessions" ON public.speed_networking_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update sessions" ON public.speed_networking_sessions FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete sessions" ON public.speed_networking_sessions FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Policies for speed_networking_participants
CREATE POLICY "Participants viewable by authenticated" ON public.speed_networking_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join sessions" ON public.speed_networking_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON public.speed_networking_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can leave sessions" ON public.speed_networking_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);
