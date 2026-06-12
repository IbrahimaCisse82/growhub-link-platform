
-- Coach availability slots (recurring weekly)
CREATE TABLE public.coach_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_availability TO authenticated;
GRANT ALL ON public.coach_availability TO service_role;
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view availability"
  ON public.coach_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coach manages own availability"
  ON public.coach_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));

CREATE TRIGGER trg_coach_availability_updated
  BEFORE UPDATE ON public.coach_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payout requests
CREATE TABLE public.coach_payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'XOF',
  method text NOT NULL,
  account_details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_payout_requests TO authenticated;
GRANT ALL ON public.coach_payout_requests TO service_role;
ALTER TABLE public.coach_payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach views own payouts"
  ON public.coach_payout_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid())
         OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Coach creates own payout"
  ON public.coach_payout_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.coaches c WHERE c.id = coach_id AND c.user_id = auth.uid()));
CREATE POLICY "Admin updates payouts"
  ON public.coach_payout_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_coach_payout_updated
  BEFORE UPDATE ON public.coach_payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Coach applications
CREATE TABLE public.coach_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric(12,2),
  currency text DEFAULT 'XOF',
  years_experience int,
  linkedin_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_applications TO authenticated;
GRANT ALL ON public.coach_applications TO service_role;
ALTER TABLE public.coach_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User views own application"
  ON public.coach_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "User submits own application"
  ON public.coach_applications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "User updates own pending application"
  ON public.coach_applications FOR UPDATE TO authenticated
  USING ((user_id = auth.uid() AND status = 'pending') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK ((user_id = auth.uid() AND status = 'pending') OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_coach_app_updated
  BEFORE UPDATE ON public.coach_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: on approval, create coach row
CREATE OR REPLACE FUNCTION public.handle_coach_application_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.coaches (user_id, specialties, languages, hourly_rate, currency, bio, level)
    VALUES (NEW.user_id, NEW.specialties, NEW.languages, NEW.hourly_rate, COALESCE(NEW.currency,'XOF'), NEW.bio, 'bronze')
    ON CONFLICT (user_id) DO NOTHING;
    NEW.reviewed_at := now();
    INSERT INTO public.notifications (user_id, type, title, message, reference_type)
    VALUES (NEW.user_id, 'coach_approved', 'Candidature coach approuvée 🎉',
            'Votre profil coach est actif. Ajoutez vos disponibilités pour recevoir des réservations.', 'coach');
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_at := now();
    INSERT INTO public.notifications (user_id, type, title, message, reference_type)
    VALUES (NEW.user_id, 'coach_rejected', 'Candidature coach refusée',
            COALESCE('Motif : ' || NEW.admin_notes, 'Votre candidature n''a pas été retenue.'), 'coach');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_coach_application_approval
  BEFORE UPDATE ON public.coach_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_coach_application_approval();

-- Ensure coaches.user_id unique (needed by ON CONFLICT)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coaches_user_id_key'
  ) THEN
    ALTER TABLE public.coaches ADD CONSTRAINT coaches_user_id_key UNIQUE (user_id);
  END IF;
END $$;
