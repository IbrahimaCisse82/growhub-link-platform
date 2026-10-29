DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public'
    AND tablename NOT IN ('profiles','coaches','coach_reviews','events','connections','coaching_sessions','ambassadors','courses','badges','challenges')
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
  END LOOP;
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public'
    AND tablename IN ('profiles','coaches','coach_reviews','events','connections','coaching_sessions','ambassadors','courses','badges','challenges')
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon', t);
  END LOOP;
END $$;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;