-- Set password Demo2024! for all demo users
UPDATE auth.users 
SET encrypted_password = crypt('Demo2024!', gen_salt('bf'))
WHERE email IN ('marc.dubois@demo.com', 'claire.bernard@demo.com', 'thomas.petit@demo.com', 'laura.chen@demo.com');