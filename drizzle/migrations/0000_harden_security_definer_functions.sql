-- Internal helpers: never callable directly from the app
REVOKE EXECUTE ON FUNCTION public.progress_challenges(uuid, text[], integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_award_badges(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_coach_level(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_post_comments(uuid) FROM PUBLIC, anon;

-- Trigger functions: not meant for direct calls
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['extract_post_hashtags','handle_coach_application_approval','handle_new_user','handle_user_deletion','log_document_upload','log_nda_signature','notify_coaching_booked','notify_event_registration','notify_post_comment','notify_post_reaction','trg_progress_on_coaching','trg_progress_on_connection','trg_progress_on_event_reg','trg_progress_on_post','trg_recompute_coach_level_review','trg_recompute_coach_level_session','trigger_check_badges_coaching','trigger_check_badges_connection','trigger_check_badges_event','trigger_check_badges_objective','trigger_check_badges_post']
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I() FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;

-- App-called functions: signed-in only
REVOKE EXECUTE ON FUNCTION public.increment_post_likes(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decrement_post_likes(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_post_comments(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_profile_views(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.touch_last_seen() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_role(app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.compute_speed_matches(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_login_streak(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_post_likes(uuid), public.decrement_post_likes(uuid), public.increment_post_comments(uuid), public.increment_profile_views(uuid), public.touch_last_seen(), public.set_user_role(app_role), public.compute_speed_matches(uuid), public.update_login_streak(uuid) TO authenticated;

-- A member may only update their own streak
CREATE OR REPLACE FUNCTION public.update_login_streak(_user_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _last_login date; _current_streak integer; _longest integer;
BEGIN
  IF auth.uid() IS NULL OR _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  SELECT last_login_date, login_streak, longest_streak INTO _last_login, _current_streak, _longest
  FROM profiles WHERE user_id = _user_id;
  IF _last_login IS NULL OR _last_login < CURRENT_DATE - 1 THEN
    UPDATE profiles SET login_streak = 1, last_login_date = CURRENT_DATE WHERE user_id = _user_id;
  ELSIF _last_login = CURRENT_DATE - 1 THEN
    UPDATE profiles SET login_streak = COALESCE(_current_streak,0)+1,
      longest_streak = GREATEST(COALESCE(_longest,0), COALESCE(_current_streak,0)+1),
      last_login_date = CURRENT_DATE WHERE user_id = _user_id;
  END IF;
END; $function$;