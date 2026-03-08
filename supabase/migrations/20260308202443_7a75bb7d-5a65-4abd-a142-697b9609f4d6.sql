
-- Circles (groups/communities)
CREATE TABLE public.circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  category text,
  is_private boolean DEFAULT false,
  max_members integer DEFAULT 50,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Circle members
CREATE TABLE public.circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Circle posts (reuse posts table with circle_id)
ALTER TABLE public.posts ADD COLUMN circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL;

-- RLS for circles
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

-- Circles: viewable by all authenticated
CREATE POLICY "Circles viewable by authenticated" ON public.circles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create circles" ON public.circles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update circles" ON public.circles FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete circles" ON public.circles FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Circle members
CREATE POLICY "Members viewable by authenticated" ON public.circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join circles" ON public.circle_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave circles" ON public.circle_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON public.circles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
