-- Delete demo users completely so they can be recreated properly via GoTrue API
-- First delete dependent data
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('sophie.martin@demo.com','julia.chen@demo.com','marc.lefevre@demo.com','laure.bernard@demo.com','thomas.moreau@demo.com')
);
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('sophie.martin@demo.com','julia.chen@demo.com','marc.lefevre@demo.com','laure.bernard@demo.com','thomas.moreau@demo.com')
);
-- Delete from auth.users (cascade should handle the rest)
DELETE FROM auth.users WHERE email IN ('sophie.martin@demo.com','julia.chen@demo.com','marc.lefevre@demo.com','laure.bernard@demo.com','thomas.moreau@demo.com');