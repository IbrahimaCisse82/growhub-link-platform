-- 1. Onboarding resume + privacy
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_matching boolean NOT NULL DEFAULT true;

-- 2. KYC verifications
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  document_type text,
  document_url text,
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS kyc_user_unique ON public.kyc_verifications(user_id);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own KYC" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users submit own KYC" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending KYC" ON public.kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage KYC" ON public.kyc_verifications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Cascade cleanup on user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  DELETE FROM public.user_roles WHERE user_id = OLD.id;
  DELETE FROM public.posts WHERE author_id = OLD.id;
  DELETE FROM public.comments WHERE author_id = OLD.id;
  DELETE FROM public.connections WHERE requester_id = OLD.id OR receiver_id = OLD.id;
  DELETE FROM public.bookmarks WHERE user_id = OLD.id;
  DELETE FROM public.notifications WHERE user_id = OLD.id;
  DELETE FROM public.kyc_verifications WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();