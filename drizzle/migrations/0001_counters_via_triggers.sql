CREATE OR REPLACE FUNCTION public.trg_post_reaction_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = COALESCE(likes_count,0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(COALESCE(likes_count,0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
CREATE OR REPLACE FUNCTION public.trg_comment_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = COALESCE(comments_count,0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(COALESCE(comments_count,0) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS post_reactions_count ON public.post_reactions;
CREATE TRIGGER post_reactions_count AFTER INSERT OR DELETE ON public.post_reactions FOR EACH ROW EXECUTE FUNCTION public.trg_post_reaction_count();
DROP TRIGGER IF EXISTS comments_count ON public.comments;
CREATE TRIGGER comments_count AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.trg_comment_count();
REVOKE EXECUTE ON FUNCTION public.trg_post_reaction_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_comment_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_post_likes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_post_likes(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_post_comments(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_post_comments(uuid) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() = profile_user_id THEN RETURN; END IF;
  UPDATE public.profiles SET profile_views = COALESCE(profile_views,0) + 1 WHERE user_id = profile_user_id;
END $$;
REVOKE EXECUTE ON FUNCTION public.increment_profile_views(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_profile_views(uuid) TO authenticated;