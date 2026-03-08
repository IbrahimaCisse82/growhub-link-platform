
-- Marketplace services table
CREATE TABLE public.marketplace_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'consulting',
  price_type TEXT NOT NULL DEFAULT 'fixed',
  price NUMERIC,
  currency TEXT DEFAULT 'EUR',
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services viewable by all" ON public.marketplace_services FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "Users can create services" ON public.marketplace_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their services" ON public.marketplace_services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their services" ON public.marketplace_services FOR DELETE USING (auth.uid() = user_id);

-- Service bookings
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.marketplace_services(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create bookings" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update bookings" ON public.service_bookings FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Message templates
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'networking',
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their templates and public ones" ON public.message_templates FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create templates" ON public.message_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their templates" ON public.message_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their templates" ON public.message_templates FOR DELETE USING (auth.uid() = user_id);
