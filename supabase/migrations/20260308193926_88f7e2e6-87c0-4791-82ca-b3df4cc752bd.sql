-- Auto-award badges via triggers
-- First, seed badge definitions if not present
INSERT INTO public.badges (name, description, icon, category, condition_type, condition_value) VALUES
  ('Premier Post', 'Publiez votre première publication', '✍️', 'community', 'posts_count', 1),
  ('Contributeur actif', 'Publiez 10 publications', '🔥', 'community', 'posts_count', 10),
  ('Première connexion', 'Connectez-vous avec un membre', '🤝', 'networking', 'connections_count', 1),
  ('Réseau en expansion', 'Atteignez 10 connexions', '🌐', 'networking', 'connections_count', 10),
  ('Networker Pro', 'Atteignez 50 connexions', '⭐', 'networking', 'connections_count', 50),
  ('Première session', 'Complétez votre première session coaching', '🎓', 'coaching', 'coaching_count', 1),
  ('Coach addict', 'Complétez 10 sessions coaching', '💡', 'coaching', 'coaching_count', 10),
  ('Objectif atteint', 'Atteignez votre premier objectif', '🎯', 'growth', 'objectives_completed', 1),
  ('Machine à objectifs', 'Atteignez 5 objectifs', '🏆', 'growth', 'objectives_completed', 5),
  ('Premier événement', 'Participez à votre premier événement', '📅', 'community', 'events_count', 1)
ON CONFLICT DO NOTHING;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  badge_rec RECORD;
  user_value integer;
BEGIN
  FOR badge_rec IN SELECT * FROM badges LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = badge_rec.id) THEN
      CONTINUE;
    END IF;

    -- Calculate user value based on condition_type
    CASE badge_rec.condition_type
      WHEN 'posts_count' THEN
        SELECT COUNT(*) INTO user_value FROM posts WHERE author_id = _user_id;
      WHEN 'connections_count' THEN
        SELECT COUNT(*) INTO user_value FROM connections WHERE status = 'accepted' AND (requester_id = _user_id OR receiver_id = _user_id);
      WHEN 'coaching_count' THEN
        SELECT COUNT(*) INTO user_value FROM coaching_sessions WHERE learner_id = _user_id AND status = 'completed';
      WHEN 'objectives_completed' THEN
        SELECT COUNT(*) INTO user_value FROM objectives WHERE user_id = _user_id AND is_completed = true;
      WHEN 'events_count' THEN
        SELECT COUNT(*) INTO user_value FROM event_registrations WHERE user_id = _user_id;
      ELSE
        user_value := 0;
    END CASE;

    -- Award if threshold met
    IF user_value >= COALESCE(badge_rec.condition_value, 1) THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, badge_rec.id);
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (_user_id, 'badge_earned', 'Badge débloqué !', 'Vous avez obtenu le badge "' || badge_rec.name || '" ' || COALESCE(badge_rec.icon, '🏅'), badge_rec.id, 'badge');
    END IF;
  END LOOP;
END;
$$;

-- Trigger on posts
CREATE OR REPLACE FUNCTION public.trigger_check_badges_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.author_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_badges_after_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION trigger_check_badges_post();

-- Trigger on connections accepted
CREATE OR REPLACE FUNCTION public.trigger_check_badges_connection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    PERFORM check_and_award_badges(NEW.requester_id);
    PERFORM check_and_award_badges(NEW.receiver_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_badges_after_connection
  AFTER UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION trigger_check_badges_connection();

-- Trigger on coaching session completed
CREATE OR REPLACE FUNCTION public.trigger_check_badges_coaching()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    PERFORM check_and_award_badges(NEW.learner_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_badges_after_coaching
  AFTER UPDATE ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_check_badges_coaching();

-- Trigger on objectives completed
CREATE OR REPLACE FUNCTION public.trigger_check_badges_objective()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    PERFORM check_and_award_badges(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_badges_after_objective
  AFTER UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION trigger_check_badges_objective();

-- Trigger on event registration
CREATE OR REPLACE FUNCTION public.trigger_check_badges_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER check_badges_after_event_reg
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION trigger_check_badges_event();