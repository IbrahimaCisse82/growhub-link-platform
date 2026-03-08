
-- Streaks: track login streaks on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_streak integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date date;

-- Verified profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Coach reviews (public testimonials)
CREATE TABLE public.coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  session_id uuid REFERENCES public.coaching_sessions(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

ALTER TABLE public.coach_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by all" ON public.coach_reviews FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can create reviews" ON public.coach_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their reviews" ON public.coach_reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their reviews" ON public.coach_reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- Collaboration history
CREATE TABLE public.collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  collaboration_type text NOT NULL DEFAULT 'coaching',
  description text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborations viewable by participants" ON public.collaborations FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = partner_id);
CREATE POLICY "Users can create collaborations" ON public.collaborations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to update login streak
CREATE OR REPLACE FUNCTION public.update_login_streak(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _last_login date;
  _current_streak integer;
  _longest integer;
BEGIN
  SELECT last_login_date, login_streak, longest_streak
  INTO _last_login, _current_streak, _longest
  FROM profiles WHERE user_id = _user_id;

  IF _last_login IS NULL OR _last_login < CURRENT_DATE - 1 THEN
    -- Streak broken or first login
    UPDATE profiles SET login_streak = 1, last_login_date = CURRENT_DATE WHERE user_id = _user_id;
  ELSIF _last_login = CURRENT_DATE - 1 THEN
    -- Consecutive day
    UPDATE profiles SET 
      login_streak = COALESCE(_current_streak, 0) + 1,
      longest_streak = GREATEST(COALESCE(_longest, 0), COALESCE(_current_streak, 0) + 1),
      last_login_date = CURRENT_DATE
    WHERE user_id = _user_id;
  END IF;
  -- If _last_login = CURRENT_DATE, do nothing (already logged in today)
END;
$$;
