
-- Extend existing deal_room_documents
ALTER TABLE public.deal_room_documents
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deal_room_documents_size_chk') THEN
    ALTER TABLE public.deal_room_documents
      ADD CONSTRAINT deal_room_documents_size_chk CHECK (file_size IS NULL OR file_size <= 26214400);
  END IF;
END $$;

ALTER TABLE public.deal_room_documents ENABLE ROW LEVEL SECURITY;

-- NDAs
CREATE TABLE IF NOT EXISTS public.deal_room_ndas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  signature_hash text NOT NULL,
  nda_text text NOT NULL,
  UNIQUE(deal_room_id, user_id)
);
ALTER TABLE public.deal_room_ndas ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE IF NOT EXISTS public.deal_room_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  target_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deal_room_audit_logs ENABLE ROW LEVEL SECURITY;

-- Fundraising metrics
CREATE TABLE IF NOT EXISTS public.fundraising_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  amount_raised numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XOF',
  investors_contacted int NOT NULL DEFAULT 0,
  meetings_held int NOT NULL DEFAULT 0,
  term_sheets int NOT NULL DEFAULT 0,
  closed_deals int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fundraising_metrics ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.is_deal_room_member(_room uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user)
      OR EXISTS(SELECT 1 FROM public.deal_room_members WHERE deal_room_id = _room AND user_id = _user);
$$;

CREATE OR REPLACE FUNCTION public.has_signed_nda(_room uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = _room AND owner_id = _user)
      OR EXISTS(SELECT 1 FROM public.deal_room_ndas WHERE deal_room_id = _room AND user_id = _user);
$$;

-- Policies: documents
DROP POLICY IF EXISTS "documents_view" ON public.deal_room_documents;
CREATE POLICY "documents_view" ON public.deal_room_documents
  FOR SELECT USING (public.is_deal_room_member(deal_room_id, auth.uid()) AND public.has_signed_nda(deal_room_id, auth.uid()));

DROP POLICY IF EXISTS "documents_upload" ON public.deal_room_documents;
CREATE POLICY "documents_upload" ON public.deal_room_documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by AND public.is_deal_room_member(deal_room_id, auth.uid()));

DROP POLICY IF EXISTS "documents_delete" ON public.deal_room_documents;
CREATE POLICY "documents_delete" ON public.deal_room_documents
  FOR DELETE USING (
    auth.uid() = uploaded_by
    OR EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = deal_room_id AND owner_id = auth.uid())
  );

-- Policies: NDAs
DROP POLICY IF EXISTS "ndas_view" ON public.deal_room_ndas;
CREATE POLICY "ndas_view" ON public.deal_room_ndas
  FOR SELECT USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = deal_room_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "ndas_sign" ON public.deal_room_ndas;
CREATE POLICY "ndas_sign" ON public.deal_room_ndas
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_deal_room_member(deal_room_id, auth.uid()));

-- Policies: audit
DROP POLICY IF EXISTS "audit_view" ON public.deal_room_audit_logs;
CREATE POLICY "audit_view" ON public.deal_room_audit_logs
  FOR SELECT USING (EXISTS(SELECT 1 FROM public.deal_rooms WHERE id = deal_room_id AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "audit_insert" ON public.deal_room_audit_logs;
CREATE POLICY "audit_insert" ON public.deal_room_audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_deal_room_member(deal_room_id, auth.uid()));

-- Policies: metrics
DROP POLICY IF EXISTS "metrics_owner_all" ON public.fundraising_metrics;
CREATE POLICY "metrics_owner_all" ON public.fundraising_metrics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE OR REPLACE FUNCTION public.log_document_upload()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.deal_room_audit_logs (deal_room_id, user_id, action, target_id, metadata)
  VALUES (NEW.deal_room_id, NEW.uploaded_by, 'upload', NEW.id,
          jsonb_build_object('name', NEW.file_name, 'size', NEW.file_size));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_log_document_upload ON public.deal_room_documents;
CREATE TRIGGER trg_log_document_upload AFTER INSERT ON public.deal_room_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_document_upload();

CREATE OR REPLACE FUNCTION public.log_nda_signature()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.deal_room_audit_logs (deal_room_id, user_id, action, target_id)
  VALUES (NEW.deal_room_id, NEW.user_id, 'nda_sign', NEW.id);
  UPDATE public.deal_room_members SET nda_accepted = true, nda_accepted_at = now()
    WHERE deal_room_id = NEW.deal_room_id AND user_id = NEW.user_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_log_nda_signature ON public.deal_room_ndas;
CREATE TRIGGER trg_log_nda_signature AFTER INSERT ON public.deal_room_ndas
  FOR EACH ROW EXECUTE FUNCTION public.log_nda_signature();

CREATE OR REPLACE FUNCTION public.update_metrics_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_update_metrics_ts ON public.fundraising_metrics;
CREATE TRIGGER trg_update_metrics_ts BEFORE UPDATE ON public.fundraising_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_metrics_timestamp();

-- Storage bucket (private, 25 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('deal-room-docs', 'deal-room-docs', false, 26214400)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 26214400, public = false;

DROP POLICY IF EXISTS "deal_docs_read" ON storage.objects;
CREATE POLICY "deal_docs_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deal-room-docs'
    AND EXISTS (
      SELECT 1 FROM public.deal_room_documents d
      WHERE d.file_path = storage.objects.name
        AND public.is_deal_room_member(d.deal_room_id, auth.uid())
        AND public.has_signed_nda(d.deal_room_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "deal_docs_upload" ON storage.objects;
CREATE POLICY "deal_docs_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deal-room-docs' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deal_docs_delete" ON storage.objects;
CREATE POLICY "deal_docs_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deal-room-docs'
    AND EXISTS (
      SELECT 1 FROM public.deal_room_documents d
      WHERE d.file_path = storage.objects.name
        AND (d.uploaded_by = auth.uid()
             OR EXISTS(SELECT 1 FROM public.deal_rooms r WHERE r.id = d.deal_room_id AND r.owner_id = auth.uid()))
    )
  );
