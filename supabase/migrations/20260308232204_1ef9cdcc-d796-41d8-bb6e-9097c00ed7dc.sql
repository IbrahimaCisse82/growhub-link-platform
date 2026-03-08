
-- ===================== CIRCLE MEMBERS (with proper UUID casting) =====================
INSERT INTO circle_members (circle_id, user_id, role)
SELECT c.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'admin' FROM circles c WHERE c.name = 'GreenTech Founders 🌱'
UNION ALL
SELECT c.id, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'member' FROM circles c WHERE c.name = 'GreenTech Founders 🌱'
UNION ALL
SELECT c.id, 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'member' FROM circles c WHERE c.name = 'GreenTech Founders 🌱'
UNION ALL
SELECT c.id, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'admin' FROM circles c WHERE c.name = 'Scale-Up Club'
UNION ALL
SELECT c.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'member' FROM circles c WHERE c.name = 'Scale-Up Club'
UNION ALL
SELECT c.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'member' FROM circles c WHERE c.name = 'Growth Hackers FR'
UNION ALL
SELECT c.id, 'a1b2c3d4-0006-4000-8000-000000000006'::uuid, 'admin' FROM circles c WHERE c.name = 'Growth Hackers FR';

-- ===================== SPACE MEMBERS =====================
INSERT INTO space_members (space_id, user_id, role)
SELECT s.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'owner' FROM spaces s WHERE s.name = 'TechVert — Équipe'
UNION ALL
SELECT s.id, '0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'member' FROM spaces s WHERE s.name = 'TechVert — Équipe'
UNION ALL
SELECT s.id, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'owner' FROM spaces s WHERE s.name = 'DataFlow R&D'
UNION ALL
SELECT s.id, 'ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, 'member' FROM spaces s WHERE s.name = 'DataFlow R&D'
UNION ALL
SELECT s.id, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'owner' FROM spaces s WHERE s.name = 'Mentoring Circle'
UNION ALL
SELECT s.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'member' FROM spaces s WHERE s.name = 'Mentoring Circle';

-- ===================== CHALLENGE PARTICIPANTS =====================
INSERT INTO challenge_participants (challenge_id, user_id, current_value, completed)
SELECT c.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 3, false FROM challenges c WHERE c.title = 'Networking Sprint 🤝'
UNION ALL
SELECT c.id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 1, false FROM challenges c WHERE c.title = 'Content Creator 📝'
UNION ALL
SELECT c.id, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 4, false FROM challenges c WHERE c.title = 'Networking Sprint 🤝'
UNION ALL
SELECT c.id, 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, 2, false FROM challenges c WHERE c.title = 'Content Creator 📝';

-- ===================== EVENT REGISTRATIONS =====================
INSERT INTO event_registrations (event_id, user_id)
SELECT id, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid FROM events LIMIT 2;

INSERT INTO event_registrations (event_id, user_id)
SELECT id, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid FROM events LIMIT 1;

INSERT INTO event_registrations (event_id, user_id)
SELECT id, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid FROM events LIMIT 2;

-- ===================== USER BADGES =====================
INSERT INTO user_badges (user_id, badge_id) 
SELECT '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, id FROM badges ORDER BY created_at LIMIT 5;

INSERT INTO user_badges (user_id, badge_id)
SELECT '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, id FROM badges ORDER BY created_at LIMIT 8;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, id FROM badges ORDER BY created_at LIMIT 4;

INSERT INTO user_badges (user_id, badge_id)
SELECT 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, id FROM badges ORDER BY created_at LIMIT 3;

-- ===================== INVESTOR CONTACTS =====================
INSERT INTO investor_contacts (round_id, user_id, investor_name, firm, status, amount_committed, email, next_step, next_step_date) 
SELECT fr.id, fr.user_id, 'Claire Bernard', 'InnoVentures Capital', 'in_discussion', 300000, 'claire@innoventures.com', 'Due diligence', now() + interval '10 days'
FROM fundraising_rounds fr WHERE fr.user_id = '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid LIMIT 1;

INSERT INTO investor_contacts (round_id, user_id, investor_name, firm, status, amount_committed, email, next_step, next_step_date)
SELECT fr.id, fr.user_id, 'Emma Viallet', 'Partech', 'contacted', null, 'emma@partech.com', 'Premier call', now() + interval '5 days'
FROM fundraising_rounds fr WHERE fr.user_id = '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid LIMIT 1;

INSERT INTO investor_contacts (round_id, user_id, investor_name, firm, status, amount_committed, email, next_step, next_step_date)
SELECT fr.id, fr.user_id, 'Pierre Dumont', 'Angel', 'identified', null, 'pierre@angel.fr', 'Intro via Marc', now() + interval '14 days'
FROM fundraising_rounds fr WHERE fr.user_id = '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid LIMIT 1;
