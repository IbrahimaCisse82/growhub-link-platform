CREATE OR REPLACE FUNCTION public.extract_post_hashtags()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  tag text; mentioned_handle text; mentioned_user uuid; author_name text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    DELETE FROM public.post_hashtags WHERE post_id = NEW.id;
  END IF;
  FOR tag IN
    SELECT DISTINCT lower(m[1])
    FROM regexp_matches(COALESCE(NEW.content, ''), '#([a-zA-Z0-9_\u00C0-\u017F]{2,30})', 'g') AS x(m)
    WHERE m[1] IS NOT NULL
  LOOP
    INSERT INTO public.post_hashtags (post_id, tag) VALUES (NEW.id, tag) ON CONFLICT DO NOTHING;
  END LOOP;
  SELECT display_name INTO author_name FROM public.profiles WHERE user_id = NEW.author_id;
  FOR mentioned_handle IN
    SELECT DISTINCT lower(m[1])
    FROM regexp_matches(COALESCE(NEW.content, ''), '@([a-zA-Z0-9_\u00C0-\u017F]{2,40})', 'g') AS x(m)
  LOOP
    SELECT user_id INTO mentioned_user FROM public.profiles
      WHERE lower(regexp_replace(display_name, '\s+', '', 'g')) = mentioned_handle LIMIT 1;
    IF mentioned_user IS NOT NULL AND mentioned_user <> NEW.author_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (mentioned_user, 'system', 'Vous avez été mentionné',
              COALESCE(author_name, 'Quelqu''un') || ' vous a mentionné dans une publication', NEW.id, 'post');
    END IF;
  END LOOP;
  RETURN NEW;
END; $function$;