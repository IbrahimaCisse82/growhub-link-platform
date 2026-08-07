CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pair record;
BEGIN
  FOR pair IN
    SELECT * FROM (VALUES
      ('ai_coach_conversations','user_id'),
      ('ambassadors','user_id'),
      ('aspirational_journey','user_id'),
      ('blocked_users','blocker_id'),
      ('blocked_users','blocked_id'),
      ('bookmarks','user_id'),
      ('challenge_participants','user_id'),
      ('challenge_submissions','user_id'),
      ('circle_members','user_id'),
      ('coach_applications','user_id'),
      ('coach_payout_requests','coach_id'),
      ('coaching_disputes','opened_by'),
      ('coaching_payments','learner_id'),
      ('cohort_members','user_id'),
      ('collaborations','user_id'),
      ('comments','author_id'),
      ('company_members','user_id'),
      ('company_pages','owner_id'),
      ('connections','requester_id'),
      ('connections','receiver_id'),
      ('course_enrollments','user_id'),
      ('deal_room_audit_logs','user_id'),
      ('deal_room_documents','uploaded_by'),
      ('deal_room_members','user_id'),
      ('deal_room_ndas','user_id'),
      ('deal_rooms','owner_id'),
      ('endorsements','endorser_id'),
      ('endorsements','endorsed_id'),
      ('event_registrations','user_id'),
      ('event_reminders','user_id'),
      ('fundraising_metrics','user_id'),
      ('fundraising_rounds','user_id'),
      ('intent_profiles','user_id'),
      ('investor_contacts','user_id'),
      ('kyc_verifications','user_id'),
      ('leads','user_id'),
      ('marketplace_services','user_id'),
      ('message_reports','reporter_id'),
      ('message_templates','user_id'),
      ('messages','sender_id'),
      ('messages','receiver_id'),
      ('milestones','user_id'),
      ('notification_preferences','user_id'),
      ('notifications','user_id'),
      ('objectives','user_id'),
      ('pitch_decks','user_id'),
      ('poll_votes','user_id'),
      ('post_reactions','user_id'),
      ('post_reports','reporter_id'),
      ('posts','author_id'),
      ('pro_development_goals','user_id'),
      ('recommendations','author_id'),
      ('recommendations','target_id'),
      ('referrals','referrer_id'),
      ('referrals','referred_id'),
      ('reposts','user_id'),
      ('service_bookings','client_id'),
      ('space_members','user_id'),
      ('space_messages','user_id'),
      ('speed_networking_participants','user_id'),
      ('student_applications','user_id'),
      ('student_career_profiles','user_id'),
      ('tool_activation_events','user_id'),
      ('user_activated_tools','user_id'),
      ('user_badges','user_id'),
      ('warm_intros','requester_id'),
      ('warm_intros','target_id'),
      ('coaches','user_id'),
      ('user_roles','user_id'),
      ('profiles','user_id')
    ) AS t(tbl, col)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = pair.tbl AND column_name = pair.col
    ) THEN
      EXECUTE format('DELETE FROM public.%I WHERE %I = $1', pair.tbl, pair.col) USING OLD.id;
    END IF;
  END LOOP;

  RETURN OLD;
END;
$function$;