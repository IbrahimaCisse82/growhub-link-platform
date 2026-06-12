
-- Ambassador counters
ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS total_referrals integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_conversions integer NOT NULL DEFAULT 0;

-- Challenge progress engine
CREATE OR REPLACE FUNCTION public.progress_challenges(_user_id uuid, _types text[], _delta integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  new_value int;
BEGIN
  FOR rec IN
    SELECT cp.id AS participant_id, cp.current_value, c.id AS challenge_id, c.target_value, c.reward_points, c.title, c.challenge_type
    FROM challenge_participants cp
    JOIN challenges c ON c.id = cp.challenge_id
    WHERE cp.user_id = _user_id
      AND COALESCE(cp.completed, false) = false
      AND c.is_active = true
      AND (c.ends_at IS NULL OR c.ends_at > now())
      AND c.challenge_type = ANY(_types)
  LOOP
    new_value := COALESCE(rec.current_value, 0) + _delta;
    IF new_value >= rec.target_value THEN
      UPDATE challenge_participants
        SET current_value = rec.target_value,
            completed = true,
            completed_at = now()
        WHERE id = rec.participant_id;

      UPDATE profiles
        SET network_score = COALESCE(network_score, 0) + COALESCE(rec.reward_points, 0)
        WHERE user_id = _user_id;

      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (_user_id, 'challenge_completed', 'Défi relevé 🏆',
              'Vous avez complété « ' || rec.title || ' » et gagné ' || COALESCE(rec.reward_points,0) || ' pts',
              rec.challenge_id, 'challenge');
    ELSE
      UPDATE challenge_participants
        SET current_value = new_value
        WHERE id = rec.participant_id;
    END IF;
  END LOOP;
END;
$$;

-- Trigger handlers
CREATE OR REPLACE FUNCTION public.trg_progress_on_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM progress_challenges(NEW.author_id, ARRAY['content','engagement'], 1);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_progress_on_connection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    PERFORM progress_challenges(NEW.requester_id, ARRAY['networking'], 1);
    PERFORM progress_challenges(NEW.receiver_id, ARRAY['networking'], 1);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_progress_on_event_reg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM progress_challenges(NEW.user_id, ARRAY['events'], 1);
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_progress_on_coaching()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    PERFORM progress_challenges(NEW.learner_id, ARRAY['coaching'], 1);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS progress_challenges_on_post ON public.posts;
CREATE TRIGGER progress_challenges_on_post
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trg_progress_on_post();

DROP TRIGGER IF EXISTS progress_challenges_on_connection ON public.connections;
CREATE TRIGGER progress_challenges_on_connection
AFTER UPDATE ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.trg_progress_on_connection();

DROP TRIGGER IF EXISTS progress_challenges_on_event_reg ON public.event_registrations;
CREATE TRIGGER progress_challenges_on_event_reg
AFTER INSERT ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_progress_on_event_reg();

DROP TRIGGER IF EXISTS progress_challenges_on_coaching ON public.coaching_sessions;
CREATE TRIGGER progress_challenges_on_coaching
AFTER UPDATE ON public.coaching_sessions
FOR EACH ROW EXECUTE FUNCTION public.trg_progress_on_coaching();

-- Referral conversion at signup via raw_user_meta_data.referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ref_code text;
  _referrer uuid;
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'startup');

  _ref_code := NULLIF(NEW.raw_user_meta_data ->> 'referral_code', '');
  IF _ref_code IS NOT NULL THEN
    -- Standard referral table
    SELECT referrer_id INTO _referrer FROM public.referrals
      WHERE referral_code = _ref_code LIMIT 1;
    IF _referrer IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, converted_at)
      VALUES (_referrer, NEW.id, _ref_code, 'converted', now())
      ON CONFLICT DO NOTHING;
      UPDATE public.profiles
        SET network_score = COALESCE(network_score, 0) + 25
        WHERE user_id = _referrer;
      INSERT INTO public.notifications (user_id, type, title, message, reference_type)
      VALUES (_referrer, 'referral_converted', 'Nouveau filleul 🎉',
              'Un de vos invités vient de rejoindre GrowHubLink (+25 pts).', 'referral');
    END IF;

    -- Ambassador codes
    UPDATE public.ambassadors
      SET total_referrals = total_referrals + 1,
          total_conversions = total_conversions + 1
      WHERE referral_code = _ref_code;
  END IF;

  RETURN NEW;
END;
$$;
