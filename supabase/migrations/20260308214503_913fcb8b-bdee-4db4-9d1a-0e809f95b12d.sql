
-- Collaborative Spaces
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  cover_color TEXT DEFAULT 'primary',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.space_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(space_id, user_id)
);

CREATE TABLE public.space_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.space_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Milestones tracking
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  is_shared BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for spaces
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Spaces: members can view
CREATE POLICY "Space members can view spaces" ON public.spaces
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = spaces.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create spaces" ON public.spaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update spaces" ON public.spaces
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete spaces" ON public.spaces
  FOR DELETE USING (auth.uid() = created_by);

-- Space members
CREATE POLICY "Members can view space members" ON public.space_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.space_members sm WHERE sm.space_id = space_members.space_id AND sm.user_id = auth.uid())
  );

CREATE POLICY "Space creators can add members" ON public.space_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.spaces WHERE id = space_members.space_id AND created_by = auth.uid())
    OR auth.uid() = user_id
  );

CREATE POLICY "Members can leave" ON public.space_members
  FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.spaces WHERE id = space_members.space_id AND created_by = auth.uid()));

-- Space tasks
CREATE POLICY "Space members can view tasks" ON public.space_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_tasks.space_id AND user_id = auth.uid())
  );

CREATE POLICY "Space members can create tasks" ON public.space_tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_tasks.space_id AND user_id = auth.uid())
  );

CREATE POLICY "Space members can update tasks" ON public.space_tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_tasks.space_id AND user_id = auth.uid())
  );

CREATE POLICY "Task creators can delete" ON public.space_tasks
  FOR DELETE USING (auth.uid() = created_by);

-- Space messages
CREATE POLICY "Space members can view messages" ON public.space_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_messages.space_id AND user_id = auth.uid())
  );

CREATE POLICY "Space members can send messages" ON public.space_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.space_members WHERE space_id = space_messages.space_id AND user_id = auth.uid())
  );

-- Milestones
CREATE POLICY "Users can view their milestones" ON public.milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create milestones" ON public.milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update milestones" ON public.milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for space messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.space_messages;
