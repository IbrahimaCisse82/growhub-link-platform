
-- 1. Reposts table
CREATE TABLE public.reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, original_post_id)
);

ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reposts viewable by authenticated" ON public.reposts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can repost" ON public.reposts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete reposts" ON public.reposts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add shares_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;

-- 2. Warm intros table
CREATE TABLE public.warm_intros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  introducer_id uuid NOT NULL,
  target_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  introducer_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.warm_intros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their intros" ON public.warm_intros FOR SELECT TO authenticated 
  USING (auth.uid() = requester_id OR auth.uid() = introducer_id OR auth.uid() = target_id);
CREATE POLICY "Users can request intros" ON public.warm_intros FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update intros" ON public.warm_intros FOR UPDATE TO authenticated 
  USING (auth.uid() = introducer_id OR auth.uid() = requester_id);

-- 3. Company pages table
CREATE TABLE public.company_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  logo_url text,
  cover_url text,
  description text,
  website text,
  sector text,
  stage text,
  founded_year integer,
  team_size text,
  location text,
  metrics jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public company pages viewable by all" ON public.company_pages FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = owner_id);
CREATE POLICY "Owners can create pages" ON public.company_pages FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update pages" ON public.company_pages FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete pages" ON public.company_pages FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Company team members
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_pages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  title text,
  joined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members viewable by all" ON public.company_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage members" ON public.company_members FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM company_pages WHERE id = company_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can remove members" ON public.company_members FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM company_pages WHERE id = company_id AND owner_id = auth.uid()));

-- 4. Public recommendations table (cross-recommendations)
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommender_id uuid NOT NULL,
  recommended_id uuid NOT NULL,
  skill text NOT NULL,
  message text,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(recommender_id, recommended_id, skill)
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public recommendations viewable" ON public.recommendations FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Users can recommend" ON public.recommendations FOR INSERT TO authenticated WITH CHECK (auth.uid() = recommender_id AND auth.uid() != recommended_id);
CREATE POLICY "Users can delete their recommendations" ON public.recommendations FOR DELETE TO authenticated USING (auth.uid() = recommender_id);
