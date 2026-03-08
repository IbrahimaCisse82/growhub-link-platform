-- Update Sophie's password to Demo2024! to match the UI
UPDATE auth.users 
SET encrypted_password = crypt('Demo2024!', gen_salt('bf'))
WHERE email = 'sophie.martin@demo.com';