
-- Intent profiles table for intent-based matching
CREATE TABLE public.intent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  intent_type text NOT NULL DEFAULT 'looking_for',
  intent_text text NOT NULL,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.intent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active intents" ON public.intent_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create intents" ON public.intent_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their intents" ON public.intent_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their intents" ON public.intent_profiles FOR DELETE USING (auth.uid() = user_id);
