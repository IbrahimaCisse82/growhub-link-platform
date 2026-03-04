
-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('startup', 'mentor', 'investor', 'expert', 'admin');
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE public.coaching_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.event_type AS ENUM ('webinar', 'workshop', 'meetup', 'conference', 'demo_day');
CREATE TYPE public.post_type AS ENUM ('text', 'milestone', 'question', 'resource', 'announcement');
CREATE TYPE public.notification_type AS ENUM ('connection_request', 'connection_accepted', 'coaching_booked', 'coaching_reminder', 'event_reminder', 'post_reaction', 'post_comment', 'badge_earned', 'system');

-- =============================================
-- 2. PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT,
  company_stage TEXT,
  sector TEXT,
  city TEXT,
  country TEXT DEFAULT 'France',
  linkedin_url TEXT,
  website_url TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  network_score INT DEFAULT 0,
  profile_views INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 3. USER ROLES
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. CONNECTIONS (NETWORKING)
-- =============================================
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status connection_status NOT NULL DEFAULT 'pending',
  match_score INT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create connection requests" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their own connections" ON public.connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can delete their own connections" ON public.connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- =============================================
-- 5. COACHES
-- =============================================
CREATE TABLE public.coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialties TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  availability JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches are viewable by authenticated" ON public.coaches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their coach profile" ON public.coaches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their coach profile" ON public.coaches FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 6. COACHING SESSIONS
-- =============================================
CREATE TABLE public.coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  learner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status coaching_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  topic TEXT,
  notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their sessions" ON public.coaching_sessions FOR SELECT USING (
  auth.uid() = learner_id OR auth.uid() = (SELECT user_id FROM public.coaches WHERE id = coach_id)
);
CREATE POLICY "Learners can book sessions" ON public.coaching_sessions FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Participants can update sessions" ON public.coaching_sessions FOR UPDATE USING (
  auth.uid() = learner_id OR auth.uid() = (SELECT user_id FROM public.coaches WHERE id = coach_id)
);

-- =============================================
-- 7. EVENTS
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'webinar',
  cover_image_url TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT TRUE,
  meeting_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  max_attendees INT,
  is_free BOOLEAN DEFAULT TRUE,
  price NUMERIC(10,2),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- =============================================
-- 8. EVENT REGISTRATIONS
-- =============================================
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view registrations for their events" ON public.event_registrations FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = (SELECT organizer_id FROM public.events WHERE id = event_id)
);
CREATE POLICY "Users can register" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel registration" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. POSTS (FIL D'ACTUALITÉ)
-- =============================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type post_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- =============================================
-- 10. POST REACTIONS
-- =============================================
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, emoji)
);
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by authenticated" ON public.post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can react" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reactions" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 11. COMMENTS
-- =============================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- =============================================
-- 12. NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 13. BADGES & PROGRESSION
-- =============================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  condition_type TEXT NOT NULL,
  condition_value INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges viewable by all" ON public.badges FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can grant badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- =============================================
-- 14. OBJECTIVES / PROGRESSION
-- =============================================
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INT DEFAULT 100,
  current_value INT DEFAULT 0,
  category TEXT,
  deadline TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their objectives" ON public.objectives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create objectives" ON public.objectives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update objectives" ON public.objectives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete objectives" ON public.objectives FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 15. PITCH DECKS
-- =============================================
CREATE TABLE public.pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Mon Pitch Deck',
  template TEXT DEFAULT 'classic',
  slides JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their decks" ON public.pitch_decks FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create decks" ON public.pitch_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update decks" ON public.pitch_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete decks" ON public.pitch_decks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 16. FUNDRAISING TRACKER
-- =============================================
CREATE TABLE public.fundraising_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2),
  raised_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  stage TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fundraising_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their rounds" ON public.fundraising_rounds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create rounds" ON public.fundraising_rounds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update rounds" ON public.fundraising_rounds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete rounds" ON public.fundraising_rounds FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.investor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.fundraising_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  investor_name TEXT NOT NULL,
  firm TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'identified',
  notes TEXT,
  next_step TEXT,
  next_step_date TIMESTAMPTZ,
  amount_committed NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their contacts" ON public.investor_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contacts" ON public.investor_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update contacts" ON public.investor_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete contacts" ON public.investor_contacts FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 17. MESSAGES PRIVÉS
-- =============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- =============================================
-- 18. UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON public.coaches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coaching_sessions_updated_at BEFORE UPDATE ON public.coaching_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pitch_decks_updated_at BEFORE UPDATE ON public.pitch_decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fundraising_rounds_updated_at BEFORE UPDATE ON public.fundraising_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_investor_contacts_updated_at BEFORE UPDATE ON public.investor_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 19. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'startup');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 20. INDEXES
-- =============================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_coaching_sessions_coach ON public.coaching_sessions(coach_id);
CREATE INDEX idx_coaching_sessions_learner ON public.coaching_sessions(learner_id);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_investor_contacts_round ON public.investor_contacts(round_id);
