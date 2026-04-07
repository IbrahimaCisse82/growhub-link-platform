
-- Courses table for mini-LMS
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER DEFAULT 30,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  enrollment_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses viewable by all authenticated"
ON public.courses FOR SELECT TO authenticated
USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Users can create courses"
ON public.courses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their courses"
ON public.courses FOR UPDATE TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their courses"
ON public.courses FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- Course enrollments
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their enrollments"
ON public.course_enrollments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
ON public.course_enrollments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their progress"
ON public.course_enrollments FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Ambassadors table
CREATE TABLE public.ambassadors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  motivation TEXT,
  linkedin_url TEXT,
  referral_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own application"
ON public.ambassadors FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit ambassador application"
ON public.ambassadors FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can submit ambassador application"
ON public.ambassadors FOR INSERT TO anon
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at
BEFORE UPDATE ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambassadors_updated_at
BEFORE UPDATE ON public.ambassadors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
