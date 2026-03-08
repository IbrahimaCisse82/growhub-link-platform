
-- Sophie Martin (startup GreenTech)
UPDATE profiles SET 
  headline = 'Fondatrice TechVert · GreenTech · Série A',
  looking_for = ARRAY['Investisseurs CleanTech', 'CTO technique', 'Partenaires distribution'],
  offering = ARRAY['Retour d''expérience fundraising', 'Connexions écosystème GreenTech', 'Mentorat produit'],
  linkedin_url = 'https://linkedin.com/in/sophie-martin-techvert',
  website_url = 'https://techvert.io',
  is_verified = true,
  verified_at = now()
WHERE user_id = '9daca1d0-d97c-4ea9-ab8d-eb38434b6079';

-- Marc Dubois (mentor consulting)
UPDATE profiles SET 
  headline = 'Serial Entrepreneur · 3 Exits · Mentor B2B SaaS',
  looking_for = ARRAY['Startups à mentorer', 'Co-investissements early-stage', 'Speakers conférences'],
  offering = ARRAY['Mentorat scaling', 'Coaching fundraising', 'Stratégie go-to-market B2B'],
  linkedin_url = 'https://linkedin.com/in/marc-dubois-mentor',
  website_url = 'https://duboisconsulting.fr',
  is_verified = true,
  verified_at = now()
WHERE user_id = '7498fb1f-4dcb-4a2c-ba14-88a89df7d92f';

-- Claire Bernard (VC)
UPDATE profiles SET 
  headline = 'Partner InnoVentures Capital · DeepTech & HealthTech',
  looking_for = ARRAY['Deal flow DeepTech', 'Startups HealthTech Seed/A', 'Co-investisseurs'],
  offering = ARRAY['Financement Seed à Série A', 'Accès réseau corporate', 'Board advisory'],
  linkedin_url = 'https://linkedin.com/in/claire-bernard-vc',
  website_url = 'https://innoventures.vc',
  is_verified = true,
  verified_at = now()
WHERE user_id = '7636a20d-3277-4a41-805a-8c44db62a3c7';

-- Thomas Petit (growth marketing)
UPDATE profiles SET 
  headline = 'Growth Coach · Marketing Digital · Go-to-Market',
  looking_for = ARRAY['Startups early-stage', 'Projets coaching growth', 'Partenariats agences'],
  offering = ARRAY['Audit growth gratuit', 'Coaching acquisition', 'Stratégie SEO/SEA'],
  linkedin_url = 'https://linkedin.com/in/thomas-petit-growth',
  website_url = 'https://growthlab.fr',
  is_verified = true,
  verified_at = now()
WHERE user_id = '0808035c-da96-4159-95ea-8ac206fb6dbe';

-- Laura Chen (CTO AIHealth)
UPDATE profiles SET 
  headline = 'CTO & Co-fondatrice AIHealth · IA Santé · Seed',
  looking_for = ARRAY['Développeurs ML', 'Partenaires hospitaliers', 'Investisseurs HealthTech'],
  offering = ARRAY['Expertise IA/ML', 'Retour technique architecture', 'Collaboration open-source'],
  linkedin_url = 'https://linkedin.com/in/laura-chen-aihealth',
  website_url = 'https://aihealth.tech',
  is_verified = false
WHERE user_id = 'f1e3d5a7-8c2b-4f16-a9d1-3b5e7c9f2a4d';

-- Aïda Saïdi (growth freelance)
UPDATE profiles SET 
  headline = 'Freelance Growth · Acquisition & Conversion · Startups',
  looking_for = ARRAY['Missions freelance growth', 'Startups e-commerce', 'Formations SEO'],
  offering = ARRAY['Audit acquisition', 'Optimisation CRO', 'Stratégie paid ads'],
  linkedin_url = 'https://linkedin.com/in/aida-saidi-growth',
  is_verified = false
WHERE user_id = 'a1b2c3d4-0006-4000-8000-000000000006';

-- Nabil Khouya (CTO DataFlow)
UPDATE profiles SET 
  headline = 'CTO DataFlow AI · ML & NLP · Architecture Data',
  looking_for = ARRAY['Développeurs senior', 'Clients enterprise', 'Partenaires cloud'],
  offering = ARRAY['Consulting architecture data', 'Formation ML', 'API NLP'],
  linkedin_url = 'https://linkedin.com/in/nabil-khouya-dataflow',
  website_url = 'https://dataflow.ai',
  is_verified = true,
  verified_at = now()
WHERE user_id = 'a1b2c3d4-0007-4000-8000-000000000007';

-- Emma Viallet (VC Partech)
UPDATE profiles SET 
  headline = 'VC Manager Partech · Series A/B · Board Member',
  looking_for = ARRAY['Startups Series A', 'Deal flow CleanTech', 'Co-investissements'],
  offering = ARRAY['Financement Series A/B', 'Réseau corporate', 'Accompagnement board'],
  linkedin_url = 'https://linkedin.com/in/emma-viallet-partech',
  is_verified = true,
  verified_at = now()
WHERE user_id = 'a1b2c3d4-0008-4000-8000-000000000008';

-- Pierre Dumont (Angel)
UPDATE profiles SET 
  headline = 'Business Angel · 15 Exits · Mentor Station F',
  looking_for = ARRAY['Startups pre-seed/seed', 'Co-investisseurs angels', 'Projets B2B'],
  offering = ARRAY['Tickets 50-200K€', 'Mentorat exit strategy', 'Réseau investisseurs'],
  linkedin_url = 'https://linkedin.com/in/pierre-dumont-angel',
  is_verified = true,
  verified_at = now()
WHERE user_id = 'a1b2c3d4-0009-4000-8000-000000000009';

-- Marie Touzet (HealthTech)
UPDATE profiles SET 
  headline = 'Fondatrice MedFlow · HealthTech · Seed €1.8M',
  looking_for = ARRAY['Partenaires hospitaliers', 'Développeurs santé', 'Investisseurs Série A'],
  offering = ARRAY['Retour réglementation santé', 'Réseau HealthTech', 'Collaboration produit'],
  linkedin_url = 'https://linkedin.com/in/marie-touzet-medflow',
  website_url = 'https://medflow.health',
  is_verified = false
WHERE user_id = 'a1b2c3d4-0010-4000-8000-000000000010';
