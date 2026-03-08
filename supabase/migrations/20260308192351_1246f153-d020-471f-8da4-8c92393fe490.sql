-- Delete old demo users with wrong emails
DELETE FROM auth.users WHERE email IN ('marc.dubois@demo.com','claire.bernard@demo.com','thomas.petit@demo.com','laura.chen@demo.com');