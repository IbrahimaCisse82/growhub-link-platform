-- Create a SECURITY DEFINER function to allow users to set their own role during onboarding
-- This bypasses RLS but only allows non-admin roles
CREATE OR REPLACE FUNCTION public.set_user_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow non-admin roles
  IF _role = 'admin' THEN
    RAISE EXCEPTION 'Cannot self-assign admin role';
  END IF;
  
  -- Update existing role (from default 'startup' set by trigger)
  UPDATE public.user_roles 
  SET role = _role 
  WHERE user_id = auth.uid();
  
  -- If no row was updated, insert
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), _role);
  END IF;
END;
$$;