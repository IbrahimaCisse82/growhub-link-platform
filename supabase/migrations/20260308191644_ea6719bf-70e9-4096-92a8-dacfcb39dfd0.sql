-- Fix NULL confirmation_token causing "Database error querying schema" on login
UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email IN (
  'sophie.martin@demo.com',
  'julia.chen@demo.com',
  'marc.lefevre@demo.com',
  'laure.bernard@demo.com',
  'thomas.moreau@demo.com'
);