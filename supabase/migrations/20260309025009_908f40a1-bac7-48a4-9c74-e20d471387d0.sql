-- Triggers already exist, recreate them with DROP IF EXISTS + CREATE
DROP TRIGGER IF EXISTS on_post_reaction_notify ON public.post_reactions;
DROP TRIGGER IF EXISTS on_post_comment_notify ON public.comments;
DROP TRIGGER IF EXISTS on_coaching_booked_notify ON public.coaching_sessions;
DROP TRIGGER IF EXISTS on_event_registration_notify ON public.event_registrations;
DROP TRIGGER IF EXISTS on_post_check_badges ON public.posts;
DROP TRIGGER IF EXISTS on_connection_check_badges ON public.connections;
DROP TRIGGER IF EXISTS on_coaching_check_badges ON public.coaching_sessions;
DROP TRIGGER IF EXISTS on_objective_check_badges ON public.objectives;
DROP TRIGGER IF EXISTS on_event_reg_check_badges ON public.event_registrations;

CREATE TRIGGER on_post_reaction_notify
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_reaction();

CREATE TRIGGER on_post_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_comment();

CREATE TRIGGER on_coaching_booked_notify
  AFTER INSERT ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_coaching_booked();

CREATE TRIGGER on_event_registration_notify
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_event_registration();

CREATE TRIGGER on_post_check_badges
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_post();

CREATE TRIGGER on_connection_check_badges
  AFTER UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_connection();

CREATE TRIGGER on_coaching_check_badges
  AFTER UPDATE ON public.coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_coaching();

CREATE TRIGGER on_objective_check_badges
  AFTER UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_objective();

CREATE TRIGGER on_event_reg_check_badges
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_badges_event();