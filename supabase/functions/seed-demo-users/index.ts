import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const demoUsers = [
  {
    email: "sophie.martin@demo.com",
    password: "Demo2024!",
    full_name: "Sophie Martin",
    profile: {
      display_name: "Sophie Martin",
      bio: "Fondatrice de TechVert, startup GreenTech en série A. Passionnée par l'innovation durable.",
      company_name: "TechVert",
      company_stage: "Série A",
      sector: "GreenTech",
      city: "Paris",
      country: "France",
      skills: ["Product Management", "Fundraising", "Growth Hacking", "Pitch"],
      interests: ["ClimateTech", "Impact Investing", "SaaS"],
      network_score: 78,
      profile_views: 234,
    },
    role: "startup",
  },
  {
    email: "marc.lefevre@demo.com",
    password: "Demo2024!",
    full_name: "Marc Lefevre",
    full_name: "Marc Dubois",
    profile: {
      display_name: "Marc Lefevre",
      bio: "Serial entrepreneur, 3 exits. Mentor certifié avec 15 ans d'expérience en scaling de startups B2B SaaS.",
      company_name: "Lefevre Consulting",
      company_stage: "Établi",
      sector: "Consulting",
      city: "Lyon",
      country: "France",
      skills: ["Strategy", "Scaling", "B2B Sales", "Leadership", "Fundraising"],
      interests: ["SaaS", "B2B", "Mentoring", "Angel Investing"],
      network_score: 92,
      profile_views: 567,
    },
    role: "mentor",
  },
  {
    email: "laure.bernard@demo.com",
    password: "Demo2024!",
    full_name: "Laure Bernard",
    full_name: "Claire Bernard",
    profile: {
      display_name: "Laure Bernard",
      bio: "Partner chez InnoVentures Capital. Focus early-stage DeepTech et HealthTech. €50M sous gestion.",
      company_name: "InnoVentures Capital",
      company_stage: "VC Fund",
      sector: "Venture Capital",
      city: "Paris",
      country: "France",
      skills: ["Due Diligence", "Deal Flow", "Portfolio Management", "Board Member"],
      interests: ["DeepTech", "HealthTech", "AI/ML", "Impact"],
      network_score: 95,
      profile_views: 891,
    },
    role: "investor",
  },
  {
    email: "thomas.moreau@demo.com",
    password: "Demo2024!",
    full_name: "Thomas Petit",
    profile: {
      display_name: "Thomas Moreau",
      bio: "Expert Growth & Marketing Digital. Coach certifié spécialisé en go-to-market et acquisition clients.",
      company_name: "Growth Lab",
      company_stage: "Freelance",
      sector: "Marketing Digital",
      city: "Bordeaux",
      country: "France",
      skills: ["Growth Marketing", "SEO/SEA", "Content Strategy", "Analytics"],
      interests: ["MarTech", "Automation", "Data-Driven Marketing"],
      network_score: 85,
      profile_views: 432,
    },
    role: "expert",
  },
  {
    email: "julia.chen@demo.com",
    password: "Demo2024!",
    full_name: "Julia Chen",
    full_name: "Laura Chen",
    profile: {
      display_name: "Julia Chen",
      bio: "CTO & Co-fondatrice d'AIHealth. Développe des solutions IA pour le diagnostic médical.",
      company_name: "AIHealth",
      company_stage: "Seed",
      sector: "HealthTech / IA",
      city: "Toulouse",
      country: "France",
      skills: ["Machine Learning", "Python", "Product Development", "Team Building"],
      interests: ["AI/ML", "HealthTech", "Research", "Open Source"],
      network_score: 71,
      profile_views: 189,
    },
    role: "startup",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = [];

    for (const demo of demoUsers) {
      let userId: string | null = null;

      // Try to create user
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { full_name: demo.full_name },
      });

      if (signUpError) {
        // User exists - find via profiles table
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("display_name", demo.profile.display_name)
          .maybeSingle();
        
        if (profileData) {
          userId = profileData.user_id;
          results.push({ email: demo.email, status: "already_exists", userId });
        } else {
          results.push({ email: demo.email, status: "error", error: signUpError.message });
          continue;
        }
      } else {
        userId = newUser.user.id;
        results.push({ email: demo.email, status: "created", userId });
      }

      // Update profile
      await supabaseAdmin
        .from("profiles")
        .update(demo.profile)
        .eq("user_id", userId);

      // Ensure role exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", demo.role)
        .maybeSingle();

      if (!existingRole) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: userId,
          role: demo.role,
        });
      }

      // Make Marc and Thomas coaches
      if (demo.email === "marc.lefevre@demo.com" || demo.email === "thomas.moreau@demo.com") {
        const { data: existingCoach } = await supabaseAdmin
          .from("coaches")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingCoach) {
          await supabaseAdmin.from("coaches").insert({
            user_id: userId,
            specialties: demo.email === "marc.lefevre@demo.com"
              ? ["Scaling", "Fundraising", "B2B Strategy"]
              : ["Growth Marketing", "Go-to-Market", "SEO/SEA"],
            hourly_rate: demo.email === "marc.lefevre@demo.com" ? 120 : 80,
            rating: demo.email === "marc.lefevre@demo.com" ? 4.8 : 4.6,
            total_sessions: demo.email === "marc.lefevre@demo.com" ? 47 : 32,
            total_reviews: demo.email === "marc.lefevre@demo.com" ? 38 : 25,
            is_active: true,
          });
        }
      }
    }

    // Seed some demo data for Sophie (first user)
    const sophieResult = results.find((r) => r.email === "sophie.martin@demo.com");
    if (sophieResult?.userId) {
      const sophieId = sophieResult.userId;

      // Seed objectives
      const { data: existingObj } = await supabaseAdmin
        .from("objectives")
        .select("id")
        .eq("user_id", sophieId)
        .limit(1);

      if (!existingObj || existingObj.length === 0) {
        await supabaseAdmin.from("objectives").insert([
          { user_id: sophieId, title: "Finaliser le pitch deck", category: "Fundraising", target_value: 100, current_value: 75, description: "Compléter toutes les slides du pitch pour la série A" },
          { user_id: sophieId, title: "Atteindre 50 connexions", category: "Networking", target_value: 50, current_value: 23, description: "Développer le réseau professionnel sur la plateforme" },
          { user_id: sophieId, title: "3 sessions coaching/mois", category: "Coaching", target_value: 3, current_value: 1, description: "Maintenir un rythme régulier de coaching" },
          { user_id: sophieId, title: "ARR 500K€", category: "Business", target_value: 500000, current_value: 320000, description: "Objectif de revenus récurrents annuels" },
        ]);
      }

      // Seed a fundraising round
      const { data: existingRound } = await supabaseAdmin
        .from("fundraising_rounds")
        .select("id")
        .eq("user_id", sophieId)
        .limit(1);

      if (!existingRound || existingRound.length === 0) {
        const { data: round } = await supabaseAdmin.from("fundraising_rounds").insert({
          user_id: sophieId,
          name: "Série A - TechVert",
          target_amount: 3000000,
          raised_amount: 1200000,
          stage: "Serie A",
          status: "active",
        }).select("id").single();

        if (round) {
          await supabaseAdmin.from("investor_contacts").insert([
            { user_id: sophieId, round_id: round.id, investor_name: "Claire Bernard", firm: "InnoVentures Capital", status: "in_discussion", amount_committed: 500000, next_step: "Due diligence", email: "claire.bernard@demo.com" },
            { user_id: sophieId, round_id: round.id, investor_name: "Pierre Moreau", firm: "TechFund Paris", status: "identified", next_step: "Premier contact", email: "pierre@techfund.com" },
            { user_id: sophieId, round_id: round.id, investor_name: "Amélie Roux", firm: "Green Impact VC", status: "term_sheet", amount_committed: 700000, next_step: "Signature", email: "amelie@greenimpact.vc" },
          ]);
        }
      }
    }

    // Seed events
    const { data: existingEvents } = await supabaseAdmin.from("events").select("id").limit(1);
    if (!existingEvents || existingEvents.length === 0) {
      const organizerId = sophieResult?.userId || results[0]?.userId;
      if (organizerId) {
        const now = new Date();
        await supabaseAdmin.from("events").insert([
          { organizer_id: organizerId, title: "Masterclass Fundraising", description: "Comment réussir sa levée de fonds en 2026", event_type: "webinar", starts_at: new Date(now.getTime() + 7 * 86400000).toISOString(), is_online: true, is_free: true, max_attendees: 100, tags: ["fundraising", "startup"] },
          { organizer_id: organizerId, title: "Networking Pitch Night", description: "Présentez votre startup en 3 minutes", event_type: "meetup", starts_at: new Date(now.getTime() + 14 * 86400000).toISOString(), is_online: false, location: "Station F, Paris", max_attendees: 50, tags: ["pitch", "networking"] },
          { organizer_id: organizerId, title: "Workshop Growth Hacking", description: "Techniques d'acquisition client pour startups", event_type: "workshop", starts_at: new Date(now.getTime() + 21 * 86400000).toISOString(), is_online: true, price: 49, is_free: false, max_attendees: 30, tags: ["growth", "marketing"] },
          { organizer_id: organizerId, title: "Demo Day GrowHubLink", description: "Les meilleures startups de l'écosystème présentent", event_type: "demo_day", starts_at: new Date(now.getTime() + 30 * 86400000).toISOString(), is_online: false, location: "Palais Brongniart, Paris", is_free: true, max_attendees: 200, tags: ["demo", "investors"] },
        ]);
      }
    }

    // Seed posts
    const { data: existingPosts } = await supabaseAdmin.from("posts").select("id").limit(1);
    if (!existingPosts || existingPosts.length === 0) {
      const allUserIds = results.filter(r => r.userId).map(r => r.userId!);
      if (allUserIds.length > 0) {
        await supabaseAdmin.from("posts").insert([
          { author_id: allUserIds[0], content: "🚀 Nous venons de franchir le cap des 300K€ ARR chez TechVert ! Merci à toute l'équipe et nos early adopters. La GreenTech a un bel avenir devant elle.", post_type: "milestone", tags: ["greentech", "milestone", "startup"] },
          { author_id: allUserIds[1] || allUserIds[0], content: "💡 Conseil du jour : Ne sous-estimez jamais l'importance du product-market fit avant de scaler. J'ai vu trop de startups brûler du cash en scalant trop tôt.", post_type: "text", tags: ["conseil", "scaling", "mentor"] },
          { author_id: allUserIds[2] || allUserIds[0], content: "🔍 À la recherche de startups DeepTech en phase Seed. Notre fonds InnoVentures a encore des tickets disponibles pour Q1 2026. DM si intéressé !", post_type: "text", tags: ["investment", "deeptech", "seed"] },
          { author_id: allUserIds[0], content: "❓ Question à la communauté : Quel est votre outil préféré pour le suivi des OKR en startup ? On hésite entre plusieurs solutions.", post_type: "question", tags: ["OKR", "tools", "question"] },
          { author_id: allUserIds[3] || allUserIds[0], content: "📈 Nouveau guide : '10 stratégies de Growth Marketing qui fonctionnent vraiment en 2026'. Lien dans mon profil !", post_type: "resource", tags: ["growth", "marketing", "guide"] },
        ]);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
