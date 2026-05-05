
-- 1. Niveaux mentor + champs profil coach
DO $$ BEGIN
  CREATE TYPE coach_level AS ENUM ('bronze','silver','gold','platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS level coach_level NOT NULL DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS years_experience integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS niche_tags text[] DEFAULT '{}'::text[];

-- Function to recompute level
CREATE OR REPLACE FUNCTION public.recompute_coach_level(_coach_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _completed int;
  _avg numeric;
  _new_level coach_level;
BEGIN
  SELECT COUNT(*) INTO _completed FROM coaching_sessions
    WHERE coach_id = _coach_id AND status = 'completed';
  SELECT COALESCE(AVG(rating),0) INTO _avg FROM coach_reviews
    WHERE coach_id = _coach_id;

  IF _completed >= 100 AND _avg >= 4.7 THEN _new_level := 'platinum';
  ELSIF _completed >= 50 AND _avg >= 4.5 THEN _new_level := 'gold';
  ELSIF _completed >= 20 AND _avg >= 4.0 THEN _new_level := 'silver';
  ELSE _new_level := 'bronze';
  END IF;

  UPDATE coaches SET level = _new_level,
    total_sessions = _completed,
    rating = ROUND(_avg, 2)
    WHERE id = _coach_id;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_recompute_coach_level_session()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM recompute_coach_level(COALESCE(NEW.coach_id, OLD.coach_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS recompute_coach_level_after_session ON coaching_sessions;
CREATE TRIGGER recompute_coach_level_after_session
AFTER INSERT OR UPDATE ON coaching_sessions
FOR EACH ROW EXECUTE FUNCTION trg_recompute_coach_level_session();

CREATE OR REPLACE FUNCTION public.trg_recompute_coach_level_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM recompute_coach_level(COALESCE(NEW.coach_id, OLD.coach_id));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS recompute_coach_level_after_review ON coach_reviews;
CREATE TRIGGER recompute_coach_level_after_review
AFTER INSERT OR UPDATE OR DELETE ON coach_reviews
FOR EACH ROW EXECUTE FUNCTION trg_recompute_coach_level_review();

-- 2. Coaching payments
CREATE TABLE IF NOT EXISTS public.coaching_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL,
  coach_id uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  gross_amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.15,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  net_amount numeric(10,2) NOT NULL DEFAULT 0,
  provider text NOT NULL DEFAULT 'wave', -- wave | orange_money | mtn_momo | card | stripe
  provider_reference text,
  status text NOT NULL DEFAULT 'pending', -- pending | paid | failed | refunded
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_payments_session ON coaching_payments(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_payments_coach ON coaching_payments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_payments_learner ON coaching_payments(learner_id);

-- Enforce server-side commission
CREATE OR REPLACE FUNCTION public.enforce_coaching_payment_commission()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.commission_rate := 0.15;
  NEW.commission_amount := ROUND(NEW.gross_amount * 0.15, 2);
  NEW.net_amount := NEW.gross_amount - NEW.commission_amount;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS enforce_commission_before_write ON coaching_payments;
CREATE TRIGGER enforce_commission_before_write
BEFORE INSERT OR UPDATE ON coaching_payments
FOR EACH ROW EXECUTE FUNCTION enforce_coaching_payment_commission();

ALTER TABLE public.coaching_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner creates own payment" ON public.coaching_payments
  FOR INSERT WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Participants view payment" ON public.coaching_payments
  FOR SELECT USING (
    auth.uid() = learner_id
    OR auth.uid() = (SELECT user_id FROM coaches WHERE id = coaching_payments.coach_id)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins manage payments" ON public.coaching_payments
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Disputes
CREATE TABLE IF NOT EXISTS public.coaching_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open', -- open | reviewing | resolved | rejected
  resolution text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_disputes_session ON coaching_disputes(session_id);

ALTER TABLE public.coaching_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants open dispute" ON public.coaching_disputes
  FOR INSERT WITH CHECK (
    auth.uid() = opened_by
    AND EXISTS (
      SELECT 1 FROM coaching_sessions s
      WHERE s.id = session_id
        AND (s.learner_id = auth.uid()
             OR auth.uid() = (SELECT user_id FROM coaches WHERE id = s.coach_id))
    )
  );

CREATE POLICY "Participants & admins view disputes" ON public.coaching_disputes
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM coaching_sessions s
      WHERE s.id = session_id
        AND (s.learner_id = auth.uid()
             OR auth.uid() = (SELECT user_id FROM coaches WHERE id = s.coach_id))
    )
  );

CREATE POLICY "Admins resolve disputes" ON public.coaching_disputes
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coaching_disputes_updated_at
BEFORE UPDATE ON coaching_disputes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. SMART goals
ALTER TABLE public.objectives
  ADD COLUMN IF NOT EXISTS specific text,
  ADD COLUMN IF NOT EXISTS measurable text,
  ADD COLUMN IF NOT EXISTS achievable text,
  ADD COLUMN IF NOT EXISTS relevant text,
  ADD COLUMN IF NOT EXISTS time_bound text;
