-- 1. Student career profile
CREATE TABLE public.student_career_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  university TEXT,
  degree TEXT,
  graduation_year INTEGER,
  field_of_study TEXT,
  looking_for TEXT CHECK (looking_for IN ('internship', 'job', 'both', 'mentorship')),
  cv_url TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  career_interests TEXT[],
  availability TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student profiles publicly viewable" ON public.student_career_profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own student profile" ON public.student_career_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Student applications
CREATE TABLE public.student_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  application_type TEXT CHECK (application_type IN ('internship', 'job', 'apprenticeship')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'interview', 'offer', 'rejected', 'accepted')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own applications" ON public.student_applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users manage own applications" ON public.student_applications FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- 3. Corporate challenges
CREATE TABLE public.corporate_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT,
  budget_range TEXT,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'reviewing', 'closed', 'awarded')),
  tags TEXT[],
  requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corporate_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open challenges visible to all" ON public.corporate_challenges FOR SELECT USING (status != 'draft' OR auth.uid() = corporate_id);
CREATE POLICY "Corporate manages own challenges" ON public.corporate_challenges FOR ALL USING (auth.uid() = corporate_id) WITH CHECK (auth.uid() = corporate_id);

-- 4. Challenge submissions
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.corporate_challenges(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL,
  pitch TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'rejected', 'winner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, startup_id)
);
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Submissions visible to startup and corporate" ON public.challenge_submissions FOR SELECT USING (
  auth.uid() = startup_id OR auth.uid() IN (SELECT corporate_id FROM public.corporate_challenges WHERE id = challenge_id)
);
CREATE POLICY "Startup manages own submissions" ON public.challenge_submissions FOR ALL USING (auth.uid() = startup_id) WITH CHECK (auth.uid() = startup_id);
CREATE POLICY "Corporate updates submissions on own challenge" ON public.challenge_submissions FOR UPDATE USING (
  auth.uid() IN (SELECT corporate_id FROM public.corporate_challenges WHERE id = challenge_id)
);

-- 5. Pro development goals
CREATE TABLE public.pro_development_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_target TEXT NOT NULL,
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planned', 'in_progress', 'completed', 'paused')),
  resources TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pro_development_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dev goals" ON public.pro_development_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Aspirational journey
CREATE TABLE public.aspirational_journey (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_key TEXT NOT NULL,
  step_title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  resource_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_key)
);
ALTER TABLE public.aspirational_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey" ON public.aspirational_journey FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Incubator cohorts
CREATE TABLE public.incubator_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incubator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  capacity INTEGER DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'active', 'completed', 'cancelled')),
  program_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incubator_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cohorts visible to all" ON public.incubator_cohorts FOR SELECT USING (true);
CREATE POLICY "Incubator manages own cohorts" ON public.incubator_cohorts FOR ALL USING (auth.uid() = incubator_id) WITH CHECK (auth.uid() = incubator_id);

-- 8. Cohort members
CREATE TABLE public.cohort_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL REFERENCES public.incubator_cohorts(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'graduated', 'dropped')),
  progress_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, startup_id)
);
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members visible to incubator and startup" ON public.cohort_members FOR SELECT USING (
  auth.uid() = startup_id OR auth.uid() IN (SELECT incubator_id FROM public.incubator_cohorts WHERE id = cohort_id)
);
CREATE POLICY "Incubator manages cohort members" ON public.cohort_members FOR ALL USING (
  auth.uid() IN (SELECT incubator_id FROM public.incubator_cohorts WHERE id = cohort_id)
) WITH CHECK (
  auth.uid() IN (SELECT incubator_id FROM public.incubator_cohorts WHERE id = cohort_id)
);
CREATE POLICY "Startup can join cohort" ON public.cohort_members FOR INSERT WITH CHECK (auth.uid() = startup_id);

-- Triggers updated_at
CREATE TRIGGER trg_student_profiles_updated BEFORE UPDATE ON public.student_career_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_student_apps_updated BEFORE UPDATE ON public.student_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_challenges_updated BEFORE UPDATE ON public.corporate_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_submissions_updated BEFORE UPDATE ON public.challenge_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dev_goals_updated BEFORE UPDATE ON public.pro_development_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_journey_updated BEFORE UPDATE ON public.aspirational_journey FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cohorts_updated BEFORE UPDATE ON public.incubator_cohorts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cohort_members_updated BEFORE UPDATE ON public.cohort_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_challenges_corporate ON public.corporate_challenges(corporate_id);
CREATE INDEX idx_challenges_status ON public.corporate_challenges(status);
CREATE INDEX idx_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX idx_apps_student ON public.student_applications(student_id);
CREATE INDEX idx_dev_goals_user ON public.pro_development_goals(user_id);
CREATE INDEX idx_journey_user ON public.aspirational_journey(user_id);
CREATE INDEX idx_cohorts_incubator ON public.incubator_cohorts(incubator_id);
CREATE INDEX idx_cohort_members_cohort ON public.cohort_members(cohort_id);