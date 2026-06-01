
-- Post reports (signalements)
CREATE TABLE public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, reporter_id)
);

GRANT SELECT, INSERT ON public.post_reports TO authenticated;
GRANT ALL ON public.post_reports TO service_role;

ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report posts" ON public.post_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters & admins view reports" ON public.post_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update reports" ON public.post_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Hashtags table (aggregated for trending)
CREATE TABLE public.post_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, tag)
);

CREATE INDEX idx_post_hashtags_tag ON public.post_hashtags (tag);
CREATE INDEX idx_post_hashtags_created ON public.post_hashtags (created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.post_hashtags TO authenticated;
GRANT ALL ON public.post_hashtags TO service_role;

ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hashtags viewable by all auth" ON public.post_hashtags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authors insert hashtags on own posts" ON public.post_hashtags
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));

CREATE POLICY "Authors delete hashtags on own posts" ON public.post_hashtags
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()));

-- Auto-extract hashtags from post content + notify on @mentions
CREATE OR REPLACE FUNCTION public.extract_post_hashtags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tag text;
  mentioned_handle text;
  mentioned_user uuid;
  author_name text;
BEGIN
  -- Replace tags on update
  IF TG_OP = 'UPDATE' THEN
    DELETE FROM public.post_hashtags WHERE post_id = NEW.id;
  END IF;

  -- Extract #hashtags
  FOR tag IN
    SELECT DISTINCT lower(substring(m FROM 2))
    FROM regexp_matches(COALESCE(NEW.content, ''), '#([a-zA-Z0-9_\u00C0-\u017F]{2,30})', 'g') AS x(m)
    WHERE substring(m FROM 2) IS NOT NULL
  LOOP
    INSERT INTO public.post_hashtags (post_id, tag) VALUES (NEW.id, tag)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Notify on @mentions (match display_name normalized)
  SELECT display_name INTO author_name FROM public.profiles WHERE user_id = NEW.author_id;
  FOR mentioned_handle IN
    SELECT DISTINCT lower(substring(m FROM 2))
    FROM regexp_matches(COALESCE(NEW.content, ''), '@([a-zA-Z0-9_\u00C0-\u017F]{2,40})', 'g') AS x(m)
  LOOP
    SELECT user_id INTO mentioned_user FROM public.profiles
      WHERE lower(regexp_replace(display_name, '\s+', '', 'g')) = mentioned_handle
      LIMIT 1;
    IF mentioned_user IS NOT NULL AND mentioned_user <> NEW.author_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
      VALUES (mentioned_user, 'mention', 'Vous avez été mentionné',
              COALESCE(author_name, 'Quelqu''un') || ' vous a mentionné dans une publication',
              NEW.id, 'post');
    END IF;
  END LOOP;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_extract_post_hashtags ON public.posts;
CREATE TRIGGER trg_extract_post_hashtags
  AFTER INSERT OR UPDATE OF content ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.extract_post_hashtags();

-- Fix missing WITH CHECK on post_reactions INSERT (security hardening)
DROP POLICY IF EXISTS "Users can react" ON public.post_reactions;
CREATE POLICY "Users can react" ON public.post_reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix missing WITH CHECK on posts INSERT
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
