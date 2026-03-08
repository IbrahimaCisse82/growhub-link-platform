-- Reset demo user passwords using crypt
UPDATE auth.users 
SET encrypted_password = crypt('Demo2024!', gen_salt('bf'))
WHERE email IN (
  'sophie.martin@demo.com',
  'julia.chen@demo.com', 
  'marc.lefevre@demo.com',
  'laure.bernard@demo.com',
  'thomas.moreau@demo.com'
);