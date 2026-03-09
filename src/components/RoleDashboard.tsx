import { useNavigate } from "react-router-dom";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Role-specific hero configs ──────────────────────────────
const roleHeroConfig: Record<string, { badge: string; title: (name: string) => JSX.Element; subtitle: string }> = {
  startup: {
    badge: "Growth Command Center",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> accélérez votre croissance</span> 🚀</>,
    subtitle: "Suivez vos KPIs, connectez-vous et développez votre startup.",
  },
  mentor: {
    badge: "Espace Mentor",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> guidez la prochaine génération</span> 🎯</>,
    subtitle: "Gérez vos mentorés, sessions et partagez votre expertise.",
  },
  investor: {
    badge: "Investor Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> découvrez les opportunités</span> 💎</>,
    subtitle: "Suivez votre deal flow, vos investissements et le pipeline.",
  },
  expert: {
    badge: "Expert Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> partagez votre savoir</span> 🧠</>,
    subtitle: "Proposez vos services, formations et accompagnements.",
  },
  freelance: {
    badge: "Freelance Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> développez votre activité</span> ⚡</>,
    subtitle: "Gérez vos missions, clients et visibilité sur le marketplace.",
  },
  incubateur: {
    badge: "Incubateur Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> pilotez vos cohortes</span> 🏗️</>,
    subtitle: "Suivez vos startups incubées, événements et ressources.",
  },
  etudiant: {
    badge: "Campus Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> préparez votre avenir</span> 🎓</>,
    subtitle: "Apprenez, réseautez et lancez votre premier projet.",
  },
  aspirationnel: {
    badge: "Explorer Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> explorez l'entrepreneuriat</span> ✨</>,
    subtitle: "Découvrez les opportunités, inspirez-vous et passez à l'action.",
  },
  professionnel: {
    badge: "Pro Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> élargissez votre réseau</span> 🤝</>,
    subtitle: "Connectez-vous, trouvez des partenaires et des opportunités.",
  },
  corporate: {
    badge: "Corporate Hub",
    title: (name) => <>Bonjour {name},<br className="hidden md:block" /><span className="text-primary"> innovez avec les startups</span> 🏢</>,
    subtitle: "Identifiez des startups partenaires et pilotez l'open innovation.",
  },
};

// ─── Role-specific metrics ──────────────────────────────
interface RoleMetricsProps { role: string; }

export function RoleMetrics({ role }: RoleMetricsProps) {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["role-metrics", role, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const userId = user!.id;
      const [connRes, postRes, eventRes, objRes, servRes, dealRes, roundsRes] = await Promise.all([
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "accepted"),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId),
        supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("objectives").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_completed", true),
        supabase.from("marketplace_services").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true),
        supabase.from("deal_rooms").select("id", { count: "exact", head: true }).eq("owner_id", userId),
        supabase.from("fundraising_rounds").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
      ]);

      // Coaching stats — as coach or learner
      const [coachRes, learnerRes, reviewRes] = await Promise.all([
        supabase.from("coaches").select("id, total_sessions, rating").eq("user_id", userId).maybeSingle(),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("learner_id", userId).eq("status", "completed"),
        supabase.from("coach_reviews").select("rating").eq("coach_id", userId),
      ]);

      const avgRating = reviewRes.data && reviewRes.data.length > 0
        ? (reviewRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewRes.data.length).toFixed(1)
        : null;

      return {
        connections: connRes.count ?? 0,
        posts: postRes.count ?? 0,
        events: eventRes.count ?? 0,
        objectivesCompleted: objRes.count ?? 0,
        services: servRes.count ?? 0,
        dealRooms: dealRes.count ?? 0,
        activeRounds: roundsRes.count ?? 0,
        coachSessions: coachRes.data?.total_sessions ?? 0,
        coachRating: coachRes.data?.rating ? Number(coachRes.data.rating).toFixed(1) : avgRating,
        learnerSessions: learnerRes.count ?? 0,
      };
    },
  });

  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 mb-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  const s = stats!;

  const metricsMap: Record<string, { icon: string; value: string; label: string; badge: string; badgeType: "up" | "down" | "neutral" }[]> = {
    startup: [
      { icon: "👥", value: String(s.connections), label: "Connexions", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(s.learnerSessions), label: "Sessions coaching", badge: "Reçues", badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Actif", badgeType: "neutral" },
      { icon: "🚀", value: String(s.activeRounds), label: "Levées actives", badge: "Fundraising", badgeType: s.activeRounds > 0 ? "up" : "neutral" },
    ],
    mentor: [
      { icon: "🎯", value: String(s.coachSessions), label: "Sessions données", badge: "Coach", badgeType: "up" },
      { icon: "👥", value: String(s.connections), label: "Mentorés", badge: "Réseau", badgeType: "up" },
      { icon: "⭐", value: s.coachRating ?? "—", label: "Note moyenne", badge: "/5", badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: "Conseils partagés", badge: "Contenu", badgeType: "neutral" },
    ],
    investor: [
      { icon: "💎", value: String(s.dealRooms), label: "Deal Rooms", badge: "Pipeline", badgeType: s.dealRooms > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: "Startups suivies", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(s.events), label: "Événements", badge: "Agenda", badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Actif", badgeType: "neutral" },
    ],
    expert: [
      { icon: "🧠", value: String(s.coachSessions), label: "Consultations", badge: "Expert", badgeType: "up" },
      { icon: "🛒", value: String(s.services), label: "Services actifs", badge: "Marketplace", badgeType: s.services > 0 ? "up" : "neutral" },
      { icon: "⭐", value: s.coachRating ?? "—", label: "Satisfaction", badge: "/5", badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: "Articles", badge: "Expertise", badgeType: "neutral" },
    ],
    freelance: [
      { icon: "💼", value: String(s.services), label: "Offres actives", badge: "Marketplace", badgeType: s.services > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: "Contacts", badge: "Réseau", badgeType: "up" },
      { icon: "⭐", value: s.coachRating ?? "—", label: "Note clients", badge: "Réputation", badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Visibilité", badgeType: "neutral" },
    ],
    incubateur: [
      { icon: "🏗️", value: String(s.connections), label: "Startups suivies", badge: "Cohorte", badgeType: "up" },
      { icon: "📅", value: String(s.events), label: "Événements créés", badge: "Agenda", badgeType: "neutral" },
      { icon: "🎯", value: String(s.coachSessions), label: "Sessions mentorat", badge: "Impact", badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Communauté", badgeType: "neutral" },
    ],
    etudiant: [
      { icon: "📚", value: String(s.learnerSessions), label: "Sessions suivies", badge: "Apprentissage", badgeType: "up" },
      { icon: "👥", value: String(s.connections), label: "Mentors contactés", badge: "Réseau", badgeType: "up" },
      { icon: "🎯", value: String(s.objectivesCompleted), label: "Objectifs atteints", badge: "Progrès", badgeType: s.objectivesCompleted > 0 ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: "Participations", badge: "Communauté", badgeType: "neutral" },
    ],
    aspirationnel: [
      { icon: "✨", value: String(s.connections), label: "Rencontres", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(s.events), label: "Events inscrits", badge: "Agenda", badgeType: s.events > 0 ? "up" : "neutral" },
      { icon: "📚", value: String(s.learnerSessions), label: "Sessions", badge: "Découverte", badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: "Interactions", badge: "Engagement", badgeType: "neutral" },
    ],
    professionnel: [
      { icon: "🤝", value: String(s.connections), label: "Connexions pro", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(s.events), label: "Événements", badge: "Agenda", badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Actif", badgeType: "neutral" },
      { icon: "🎯", value: String(s.objectivesCompleted), label: "Objectifs atteints", badge: "Progrès", badgeType: s.objectivesCompleted > 0 ? "up" : "neutral" },
    ],
    corporate: [
      { icon: "🏢", value: String(s.dealRooms), label: "Deal Rooms", badge: "Pipeline", badgeType: s.dealRooms > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: "Partenariats", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(s.events), label: "Événements", badge: "Agenda", badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: "Publications", badge: "Innovation", badgeType: "neutral" },
    ],
  };

  const metrics = metricsMap[role] ?? metricsMap.startup;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 mb-4 md:mb-[18px]">
      {metrics.map((m, i) => (
        <MetricCard key={i} icon={m.icon} value={m.value} label={m.label} badge={m.badge} badgeType={m.badgeType} />
      ))}
    </div>
  );
}

// ─── Role-specific quick actions ──────────────────────────────
export function RoleQuickActions({ role }: { role: string }) {
  const navigate = useNavigate();

  const actionsMap: Record<string, { emoji: string; label: string; path: string; variant: "primary" | "secondary" }[]> = {
    startup: [
      { emoji: "📊", label: "Pitch Deck", path: "/pitchdeck", variant: "primary" },
      { emoji: "💰", label: "Levée de fonds", path: "/fundraising", variant: "secondary" },
      { emoji: "✍️", label: "Coaching", path: "/coaching", variant: "secondary" },
      { emoji: "🎯", label: "Objectifs", path: "/progression", variant: "secondary" },
    ],
    mentor: [
      { emoji: "📅", label: "Mes sessions", path: "/coaching", variant: "primary" },
      { emoji: "👥", label: "Mes mentorés", path: "/mentor-dashboard", variant: "secondary" },
      { emoji: "💬", label: "Publier un conseil", path: "/feed", variant: "secondary" },
      { emoji: "📊", label: "Mes avis", path: "/mentor-dashboard", variant: "secondary" },
    ],
    investor: [
      { emoji: "🔒", label: "Deal Room", path: "/deal-room", variant: "primary" },
      { emoji: "👥", label: "Startups", path: "/networking", variant: "secondary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📊", label: "Pitch Decks", path: "/pitchdeck", variant: "secondary" },
    ],
    expert: [
      { emoji: "🛒", label: "Mes services", path: "/marketplace", variant: "primary" },
      { emoji: "✍️", label: "Consultations", path: "/coaching", variant: "secondary" },
      { emoji: "📝", label: "Publier", path: "/feed", variant: "secondary" },
      { emoji: "📊", label: "Analytics", path: "/analytics", variant: "secondary" },
    ],
    freelance: [
      { emoji: "🛒", label: "Mes offres", path: "/marketplace", variant: "primary" },
      { emoji: "👥", label: "Réseau", path: "/networking", variant: "secondary" },
      { emoji: "📅", label: "Calendrier", path: "/content-calendar", variant: "secondary" },
      { emoji: "📣", label: "Leads", path: "/marketing", variant: "secondary" },
    ],
    incubateur: [
      { emoji: "🏗️", label: "Mes startups", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📊", label: "Analytics", path: "/analytics", variant: "secondary" },
      { emoji: "✍️", label: "Coaching", path: "/coaching", variant: "secondary" },
    ],
    etudiant: [
      { emoji: "🎓", label: "Trouver un mentor", path: "/coaching", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "👥", label: "Networking", path: "/networking", variant: "secondary" },
      { emoji: "🎯", label: "Objectifs", path: "/progression", variant: "secondary" },
    ],
    aspirationnel: [
      { emoji: "✨", label: "Explorer", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📚", label: "Fil d'inspiration", path: "/feed", variant: "secondary" },
      { emoji: "🎓", label: "Coaching", path: "/coaching", variant: "secondary" },
    ],
    professionnel: [
      { emoji: "🤝", label: "Networking", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "💬", label: "Messages", path: "/messaging", variant: "secondary" },
      { emoji: "🎯", label: "Objectifs", path: "/progression", variant: "secondary" },
    ],
    corporate: [
      { emoji: "🔍", label: "Scouter startups", path: "/networking", variant: "primary" },
      { emoji: "🔒", label: "Deal Room", path: "/deal-room", variant: "secondary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📊", label: "Analytics", path: "/analytics", variant: "secondary" },
    ],
  };

  const actions = actionsMap[role] ?? actionsMap.startup;

  return (
    <div className="flex gap-1.5 md:gap-2.5 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.path + a.label}
          onClick={() => navigate(a.path)}
          className={`inline-flex items-center gap-1 md:gap-[6px] rounded-lg md:rounded-[10px] px-3 md:px-5 py-1.5 md:py-2.5 font-heading text-[11px] md:text-[13px] font-bold cursor-pointer transition-all ${
            a.variant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary-hover hover:translate-y-[-1px] hover:shadow-glow"
              : "bg-card text-foreground border border-border hover:border-primary/35 hover:bg-secondary"
          }`}
        >
          {a.emoji} {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── Role-specific tips/guidance widget ──────────────────────────────
export function RoleGuidance({ role }: { role: string }) {
  const navigate = useNavigate();

  const tipsMap: Record<string, { icon: string; title: string; items: { text: string; path: string }[] }> = {
    startup: {
      icon: "🚀", title: "Prochaines étapes pour votre startup",
      items: [
        { text: "Complétez votre pitch deck", path: "/pitchdeck" },
        { text: "Connectez-vous avec 5 mentors", path: "/networking" },
        { text: "Publiez votre premier post", path: "/feed" },
        { text: "Inscrivez-vous à un événement", path: "/events" },
      ],
    },
    mentor: {
      icon: "🎯", title: "Maximisez votre impact de mentor",
      items: [
        { text: "Complétez votre profil coach", path: "/coaching" },
        { text: "Définissez vos créneaux de disponibilité", path: "/coaching" },
        { text: "Répondez aux demandes de session", path: "/coaching" },
        { text: "Partagez votre expertise via le fil d'actu", path: "/feed" },
      ],
    },
    investor: {
      icon: "💎", title: "Optimisez votre deal flow",
      items: [
        { text: "Créez votre Deal Room", path: "/deal-room" },
        { text: "Filtrez les startups par secteur", path: "/networking" },
        { text: "Participez aux Demo Days", path: "/events" },
        { text: "Connectez-vous avec d'autres investisseurs", path: "/networking" },
      ],
    },
    expert: {
      icon: "🧠", title: "Développez votre expertise",
      items: [
        { text: "Créez vos offres sur le marketplace", path: "/marketplace" },
        { text: "Publiez des articles d'expertise", path: "/feed" },
        { text: "Proposez des workshops", path: "/events" },
        { text: "Collectez des avis clients", path: "/coaching" },
      ],
    },
    freelance: {
      icon: "⚡", title: "Boostez votre activité freelance",
      items: [
        { text: "Créez vos offres sur le marketplace", path: "/marketplace" },
        { text: "Complétez votre portfolio", path: "/profile" },
        { text: "Réseautez dans les cercles pro", path: "/circles" },
        { text: "Gérez vos leads et prospects", path: "/marketing" },
      ],
    },
    incubateur: {
      icon: "🏗️", title: "Pilotez vos cohortes",
      items: [
        { text: "Créez un cercle pour votre cohorte", path: "/circles" },
        { text: "Organisez des événements de mentorat", path: "/events" },
        { text: "Suivez les progrès des startups", path: "/analytics" },
        { text: "Connectez startups et investisseurs", path: "/networking" },
      ],
    },
    etudiant: {
      icon: "🎓", title: "Lancez-vous dans l'aventure",
      items: [
        { text: "Trouvez un mentor dans votre secteur", path: "/coaching" },
        { text: "Participez aux événements networking", path: "/events" },
        { text: "Rejoignez un cercle thématique", path: "/circles" },
        { text: "Fixez vos premiers objectifs", path: "/progression" },
      ],
    },
    aspirationnel: {
      icon: "✨", title: "Découvrez l'écosystème",
      items: [
        { text: "Explorez les profils inspirants", path: "/networking" },
        { text: "Assistez à un webinar ou meetup", path: "/events" },
        { text: "Lisez le fil d'inspiration", path: "/feed" },
        { text: "Identifiez votre secteur d'intérêt", path: "/profile" },
      ],
    },
    professionnel: {
      icon: "🤝", title: "Élargissez vos horizons",
      items: [
        { text: "Connectez-vous avec des entrepreneurs", path: "/networking" },
        { text: "Participez aux événements pro", path: "/events" },
        { text: "Proposez vos compétences", path: "/marketplace" },
        { text: "Définissez vos objectifs de networking", path: "/progression" },
      ],
    },
    corporate: {
      icon: "🏢", title: "Innovez avec les startups",
      items: [
        { text: "Identifiez des startups partenaires", path: "/networking" },
        { text: "Créez votre page entreprise", path: "/company" },
        { text: "Utilisez le Deal Room", path: "/deal-room" },
        { text: "Participez aux Demo Days", path: "/events" },
      ],
    },
  };

  const tips = tipsMap[role] ?? tipsMap.startup;

  return (
    <GHCard title={`${tips.icon} ${tips.title}`} className="mb-[18px]">
      <div className="space-y-2">
        {tips.items.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0 w-full text-left hover:bg-muted/30 rounded-lg px-1 transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-extrabold text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              {i + 1}
            </div>
            <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors">{item.text}</span>
          </button>
        ))}
      </div>
    </GHCard>
  );
}

export { roleHeroConfig };
