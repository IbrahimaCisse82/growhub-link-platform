
-- ===================== CONNECTIONS =====================
INSERT INTO connections (requester_id, receiver_id, status, match_score) VALUES
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'accepted', 92),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, '7636a20d-3277-4a41-805a-8c44db62a3c7'::uuid, 'accepted', 88),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'accepted', 85),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, '0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'accepted', 80),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'accepted', 78),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'a1b2c3d4-0008-4000-8000-000000000008'::uuid, 'pending', 90),
('a1b2c3d4-0009-4000-8000-000000000009'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'pending', 82),
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, '7636a20d-3277-4a41-805a-8c44db62a3c7'::uuid, 'accepted', 75),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'accepted', 88),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'a1b2c3d4-0006-4000-8000-000000000006'::uuid, 'accepted', 70),
('a1b2c3d4-0008-4000-8000-000000000008'::uuid, 'a1b2c3d4-0009-4000-8000-000000000009'::uuid, 'accepted', 85),
('ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'accepted', 91)
ON CONFLICT DO NOTHING;

-- ===================== COACHING SESSIONS =====================
INSERT INTO coaching_sessions (coach_id, learner_id, scheduled_at, status, topic, duration_minutes, rating, feedback) VALUES
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, now() + interval '3 days', 'scheduled', 'Stratégie go-to-market B2B', 60, null, null),
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, now() - interval '7 days', 'completed', 'Pitch deck investisseurs', 60, 5, 'Marc m''a aidé à structurer mon pitch.'),
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, now() - interval '21 days', 'completed', 'Scaling B2B SaaS', 45, 4, 'Très utile sur la stratégie de pricing.'),
('73d81533-f352-45b1-9a01-c38c7979ca8a'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, now() - interval '14 days', 'completed', 'Growth hacking', 60, 5, 'Thomas connaît tous les leviers growth.'),
('73d81533-f352-45b1-9a01-c38c7979ca8a'::uuid, 'a1b2c3d4-0010-4000-8000-000000000010'::uuid, now() + interval '5 days', 'scheduled', 'Marketing HealthTech', 45, null, null),
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, 'ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, now() - interval '10 days', 'completed', 'Fundraising Seed HealthTech', 60, 5, 'Marc a un réseau incroyable.');

-- ===================== MESSAGES =====================
INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Salut Sophie ! On devrait discuter de synergies entre TechVert et mon réseau CleanTech.', true),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'Merci Marc ! Avec plaisir, tu es dispo cette semaine ?', true),
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Jeudi 14h pour un call de 30 min ?', false),
('7636a20d-3277-4a41-805a-8c44db62a3c7'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Bonjour Sophie, votre projet TechVert m''intéresse. Ouverte à discuter d''un investissement Série A ?', false),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Hey Sophie ! On utilise la même stack chez DataFlow AI. Curieux de partager nos retours.', false),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Sophie, voici le template marketing que je t''avais promis après notre session.', false),
('a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'Nabil, on pourrait collaborer sur l''intégration IA dans MedFlow ?', false),
('a1b2c3d4-0009-4000-8000-000000000009'::uuid, 'a1b2c3d4-0008-4000-8000-000000000008'::uuid, 'Emma, j''ai un deal intéressant en CleanTech. On co-investit ?', true);

-- ===================== ENDORSEMENTS =====================
INSERT INTO endorsements (endorser_id, endorsed_id, skill) VALUES
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Fundraising'),
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Product Management'),
('7636a20d-3277-4a41-805a-8c44db62a3c7'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Pitch'),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'Growth Hacking'),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'Strategy'),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'Machine Learning'),
('ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, 'a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'Python'),
('a1b2c3d4-0008-4000-8000-000000000008'::uuid, 'a1b2c3d4-0009-4000-8000-000000000009'::uuid, 'Angel');

-- ===================== MILESTONES =====================
INSERT INTO milestones (user_id, milestone_type, title, description, milestone_value, is_shared) VALUES
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'connections', '5 connexions atteintes !', 'Vous avez dépassé les 5 connexions.', 5, true),
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'coaching', 'Première session coaching', 'Vous avez complété votre première session.', 1, false),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'posts', 'Premier post publié', 'Premier post sur le feed.', 1, true),
('a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'fundraising', 'Levée réussie', 'MedFlow a bouclé un Seed de 1.8M EUR.', 1800000, true);

-- ===================== CIRCLES =====================
INSERT INTO circles (created_by, name, description, category, is_private, max_members) VALUES
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'GreenTech Founders', 'Cercle pour fondateurs dans la transition écologique.', 'GreenTech', false, 50),
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'Scale-Up Club', 'Pour les startups en phase de scaling.', 'Business', false, 30),
('7636a20d-3277-4a41-805a-8c44db62a3c7'::uuid, 'VC & Founders', 'Échanges VCs et founders.', 'Finance', true, 20),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'AI/ML Engineers', 'Communauté technique IA et ML.', 'Tech', false, 100),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'Growth Hackers FR', 'Growth marketing, A/B tests, funnels.', 'Marketing', false, 75);

-- ===================== CHALLENGES =====================
INSERT INTO challenges (title, description, challenge_type, target_value, reward_points, starts_at, ends_at, is_active) VALUES
('Networking Sprint', 'Connectez-vous avec 5 nouveaux membres cette semaine !', 'networking', 5, 150, now(), now() + interval '7 days', true),
('Content Creator', 'Publiez 3 posts de qualité en 2 semaines.', 'content', 3, 200, now(), now() + interval '14 days', true),
('Coaching Champion', 'Participez à 2 sessions de coaching ce mois-ci.', 'coaching', 2, 250, now(), now() + interval '30 days', true),
('Event Explorer', 'Inscrivez-vous à 3 événements ce mois.', 'events', 3, 100, now(), now() + interval '30 days', true);

-- ===================== MARKETPLACE SERVICES =====================
INSERT INTO marketplace_services (user_id, title, description, category, price, price_type, duration_minutes, tags, is_active) VALUES
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'Coaching Scale-Up B2B', 'Session de coaching pour scaler votre startup B2B.', 'consulting', 250, 'per_session', 90, ARRAY['B2B', 'scaling', 'strategy'], true),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'Audit Growth Marketing', 'Audit complet acquisition + plan 90 jours.', 'marketing', 500, 'fixed', 120, ARRAY['growth', 'SEO', 'acquisition'], true),
('0808035c-da96-4159-95ea-8ac206fb6dbe'::uuid, 'Workshop SEO/SEA', 'Formation pratique 3h sur le search.', 'formation', 350, 'fixed', 180, ARRAY['SEO', 'SEA', 'workshop'], true),
('a1b2c3d4-0006-4000-8000-000000000006'::uuid, 'Pack Ads Facebook/Instagram', 'Campagnes paid social pour 1 mois.', 'marketing', 800, 'fixed', null, ARRAY['paid ads', 'social', 'CRO'], true),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'Consulting Architecture Data', 'Audit pipeline data / ML avec rapport.', 'consulting', 400, 'per_session', 120, ARRAY['data', 'ML', 'architecture'], true),
('a1b2c3d4-0009-4000-8000-000000000009'::uuid, 'Mentorat Fundraising', 'Accompagnement levée de fonds gratuit.', 'consulting', 0, 'free', 60, ARRAY['fundraising', 'mentorat'], true);

-- ===================== COMPANY PAGES =====================
INSERT INTO company_pages (owner_id, name, description, sector, stage, location, team_size, founded_year, is_public, website) VALUES
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'TechVert', 'Solutions pour la transition écologique des entreprises.', 'GreenTech', 'Série A', 'Paris', '15-25', 2023, true, 'https://techvert.io'),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'DataFlow AI', 'Infrastructure IA pour données non structurées.', 'IA & Data', 'Seed', 'Paris', '5-10', 2024, true, 'https://dataflow.ai'),
('a1b2c3d4-0010-4000-8000-000000000010'::uuid, 'MedFlow', 'Digitalisation des parcours patients.', 'HealthTech', 'Seed', 'Paris', '8-12', 2024, true, 'https://medflow.health'),
('ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, 'AIHealth', 'IA pour diagnostic médical.', 'HealthTech / IA', 'Seed', 'Toulouse', '3-5', 2025, true, null);

-- ===================== SPACES =====================
INSERT INTO spaces (created_by, name, description, cover_color) VALUES
('9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 'TechVert Equipe', 'Espace collaboratif TechVert.', '#22c55e'),
('a1b2c3d4-0007-4000-8000-000000000007'::uuid, 'DataFlow R&D', 'R&D DataFlow AI.', '#3b82f6'),
('7498fb1f-4dcb-4a2c-ba14-88a89df7d92f'::uuid, 'Mentoring Circle', 'Suivi startups mentorées.', '#f59e0b');

-- ===================== COACH REVIEWS =====================
INSERT INTO coach_reviews (coach_id, reviewer_id, rating, review_text, is_public) VALUES
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 5, 'Marc est un mentor exceptionnel pour le scaling B2B.', true),
('e5379265-8856-44bd-9a12-84e0d0926dde'::uuid, 'ada5f467-f373-4ab5-b184-4581a3e79082'::uuid, 5, 'Excellente session fundraising. Réseau impressionnant.', true),
('73d81533-f352-45b1-9a01-c38c7979ca8a'::uuid, '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid, 5, 'Thomas maîtrise le growth hacking. Session actionnable.', true);

-- ===================== UPDATE FUNDRAISING =====================
UPDATE fundraising_rounds SET raised_amount = 750000 WHERE user_id = '9daca1d0-d97c-4ea9-ab8d-eb38434b6079'::uuid;
