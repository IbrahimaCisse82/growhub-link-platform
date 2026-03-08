
-- Deal Room Members (create first before policies reference it)
CREATE TABLE public.deal_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  invited_at timestamptz NOT NULL DEFAULT now(),
  nda_accepted boolean DEFAULT false,
  nda_accepted_at timestamptz,
  UNIQUE(deal_room_id, user_id)
);

-- Deal Room table
CREATE TABLE public.deal_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL,
  startup_id uuid,
  status text NOT NULL DEFAULT 'active',
  nda_signed boolean DEFAULT false,
  nda_signed_at timestamptz,
  access_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add FK after both tables exist
ALTER TABLE public.deal_room_members ADD CONSTRAINT deal_room_members_deal_room_id_fkey FOREIGN KEY (deal_room_id) REFERENCES public.deal_rooms(id) ON DELETE CASCADE;

ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage deal rooms" ON public.deal_rooms FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view deal rooms" ON public.deal_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.deal_room_members WHERE deal_room_id = deal_rooms.id AND user_id = auth.uid())
);

ALTER TABLE public.deal_room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view membership" ON public.deal_room_members FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = deal_room_members.deal_room_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can manage members" ON public.deal_room_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = deal_room_members.deal_room_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can remove members" ON public.deal_room_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = deal_room_members.deal_room_id AND owner_id = auth.uid()) OR auth.uid() = user_id
);

-- Deal Room Documents
CREATE TABLE public.deal_room_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_room_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room members can view docs" ON public.deal_room_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.deal_room_members WHERE deal_room_id = deal_room_documents.deal_room_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = deal_room_documents.deal_room_id AND owner_id = auth.uid())
);
CREATE POLICY "Room members can upload docs" ON public.deal_room_documents FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND (
    EXISTS (SELECT 1 FROM public.deal_room_members WHERE deal_room_id = deal_room_documents.deal_room_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.deal_rooms WHERE id = deal_room_documents.deal_room_id AND owner_id = auth.uid())
  )
);

-- Community Challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL DEFAULT 'networking',
  target_value integer NOT NULL DEFAULT 5,
  reward_points integer DEFAULT 100,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges viewable by all" ON public.challenges FOR SELECT USING (true);

-- Challenge Participants
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  current_value integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable by all" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update progress" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- AI Coach Conversations
CREATE TABLE public.ai_coach_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  topic text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations" ON public.ai_coach_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.ai_coach_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update conversations" ON public.ai_coach_conversations FOR UPDATE USING (auth.uid() = user_id);
