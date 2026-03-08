-- Fix text columns except phone (unique constraint prevents empty string for all)
UPDATE auth.users 
SET 
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change = COALESCE(email_change, ''),
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