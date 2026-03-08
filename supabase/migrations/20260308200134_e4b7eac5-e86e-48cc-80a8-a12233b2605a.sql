
-- Add 5 new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'freelance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'incubateur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'etudiant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'aspirationnel';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'professionnel';
