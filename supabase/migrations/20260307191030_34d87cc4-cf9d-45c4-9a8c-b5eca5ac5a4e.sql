-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- RLS policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to auto-create notifications on post reactions
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  reactor_name text;
BEGIN
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
    SELECT display_name INTO reactor_name FROM profiles WHERE user_id = NEW.user_id;
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (post_author_id, 'post_reaction', 'Nouvelle réaction', COALESCE(reactor_name, 'Quelqu''un') || ' a aimé votre publication', NEW.post_id, 'post');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_reaction_insert
AFTER INSERT ON post_reactions
FOR EACH ROW EXECUTE FUNCTION notify_post_reaction();

-- Function to auto-create notifications on comments
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  commenter_name text;
BEGIN
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
    SELECT display_name INTO commenter_name FROM profiles WHERE user_id = NEW.author_id;
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (post_author_id, 'post_comment', 'Nouveau commentaire', COALESCE(commenter_name, 'Quelqu''un') || ' a commenté votre publication', NEW.post_id, 'post');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_insert
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_post_comment();

-- Function to auto-create notifications on coaching booking
CREATE OR REPLACE FUNCTION public.notify_coaching_booked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coach_user_id uuid;
  learner_name text;
BEGIN
  SELECT user_id INTO coach_user_id FROM coaches WHERE id = NEW.coach_id;
  IF coach_user_id IS NOT NULL THEN
    SELECT display_name INTO learner_name FROM profiles WHERE user_id = NEW.learner_id;
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (coach_user_id, 'coaching_booked', 'Nouvelle session réservée', COALESCE(learner_name, 'Un membre') || ' a réservé une session de coaching', NEW.id, 'coaching_session');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_coaching_session_insert
AFTER INSERT ON coaching_sessions
FOR EACH ROW EXECUTE FUNCTION notify_coaching_booked();

-- Function to auto-create notifications on event registration
CREATE OR REPLACE FUNCTION public.notify_event_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_organizer uuid;
  event_title text;
  registrant_name text;
BEGIN
  SELECT organizer_id, title INTO event_organizer, event_title FROM events WHERE id = NEW.event_id;
  IF event_organizer IS NOT NULL AND event_organizer != NEW.user_id THEN
    SELECT display_name INTO registrant_name FROM profiles WHERE user_id = NEW.user_id;
    INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (event_organizer, 'event_reminder', 'Nouvelle inscription', COALESCE(registrant_name, 'Un membre') || ' s''est inscrit à "' || event_title || '"', NEW.event_id, 'event');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_registration_insert
AFTER INSERT ON event_registrations
FOR EACH ROW EXECUTE FUNCTION notify_event_registration();