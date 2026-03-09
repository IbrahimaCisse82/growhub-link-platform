import { useNavigate } from "react-router-dom";
import { GHCard, MetricCard, Tag, StatRow } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, TrendingUp, BookOpen, DollarSign, Briefcase, GraduationCap, Building2, Star, Code2, Target, Lightbulb } from "lucide-react";

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
interface RoleMetricsProps {
  role: string;
}

export function RoleMetrics({ role }: RoleMetricsProps) {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["role-metrics", role, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const userId = user!.id;
      // Common stats
      const [connRes, sessRes, postRes] = await Promise.all([
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "accepted"),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).or(`learner_id.eq.${userId},coach_id.in.(select id from coaches where user_id='${userId}')`),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId),
      ]);
      return {
        connections: connRes.count ?? 0,
        sessions: sessRes.count ?? 0,
        posts: postRes.count ?? 0,
      };
    },
  });

  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5 mb-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  const metricsMap: Record<string, { icon: string; value: string; label: string; badge: string; badgeType: "up" | "down" | "neutral" }[]> = {
    startup: [
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Connexions", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(stats?.sessions ?? 0), label: "Sessions coaching", badge: "Total", badgeType: "up" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Publications", badge: "Actif", badgeType: "neutral" },
      { icon: "🚀", value: "—", label: "Levée en cours", badge: "Fundraising", badgeType: "neutral" },
    ],
    mentor: [
      { icon: "🎯", value: String(stats?.sessions ?? 0), label: "Sessions données", badge: "Coach", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Mentorés", badge: "Réseau", badgeType: "up" },
      { icon: "⭐", value: "—", label: "Note moyenne", badge: "Feedback", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Conseils partagés", badge: "Contenu", badgeType: "neutral" },
    ],
    investor: [
      { icon: "💎", value: "—", label: "Deal flow", badge: "Pipeline", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Startups suivies", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(stats?.sessions ?? 0), label: "Meetings", badge: "Agenda", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Publications", badge: "Actif", badgeType: "neutral" },
    ],
    expert: [
      { icon: "🧠", value: String(stats?.sessions ?? 0), label: "Consultations", badge: "Expert", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Clients", badge: "Réseau", badgeType: "up" },
      { icon: "⭐", value: "—", label: "Satisfaction", badge: "NPS", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Articles", badge: "Expertise", badgeType: "neutral" },
    ],
    freelance: [
      { icon: "💼", value: "—", label: "Missions actives", badge: "En cours", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Contacts", badge: "Réseau", badgeType: "up" },
      { icon: "⭐", value: "—", label: "Note clients", badge: "Réputation", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Publications", badge: "Visibilité", badgeType: "neutral" },
    ],
    incubateur: [
      { icon: "🏗️", value: "—", label: "Startups incubées", badge: "Cohorte", badgeType: "up" },
      { icon: "📅", value: String(stats?.sessions ?? 0), label: "Sessions", badge: "Mentorat", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Réseau", badge: "Actif", badgeType: "neutral" },
      { icon: "🎯", value: "—", label: "Taux de succès", badge: "Impact", badgeType: "neutral" },
    ],
    etudiant: [
      { icon: "📚", value: String(stats?.sessions ?? 0), label: "Sessions suivies", badge: "Apprentissage", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Mentors contactés", badge: "Réseau", badgeType: "up" },
      { icon: "🎯", value: "—", label: "Objectifs atteints", badge: "Progrès", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Participations", badge: "Communauté", badgeType: "neutral" },
    ],
    aspirationnel: [
      { icon: "✨", value: String(stats?.connections ?? 0), label: "Rencontres", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: "—", label: "Events inscrits", badge: "Agenda", badgeType: "neutral" },
      { icon: "📚", value: String(stats?.sessions ?? 0), label: "Sessions", badge: "Découverte", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Interactions", badge: "Engagement", badgeType: "neutral" },
    ],
    professionnel: [
      { icon: "🤝", value: String(stats?.connections ?? 0), label: "Connexions pro", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(stats?.sessions ?? 0), label: "Meetings", badge: "Agenda", badgeType: "up" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Publications", badge: "Actif", badgeType: "neutral" },
      { icon: "🎯", value: "—", label: "Opportunités", badge: "Pipeline", badgeType: "neutral" },
    ],
    corporate: [
      { icon: "🏢", value: "—", label: "Startups scouttées", badge: "Pipeline", badgeType: "up" },
      { icon: "👥", value: String(stats?.connections ?? 0), label: "Partenariats", badge: "Réseau", badgeType: "up" },
      { icon: "📅", value: String(stats?.sessions ?? 0), label: "Réunions", badge: "Agenda", badgeType: "neutral" },
      { icon: "💬", value: String(stats?.posts ?? 0), label: "Publications", badge: "Innovation", badgeType: "neutral" },
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
interface RoleActionsProps {
  role: string;
}

export function RoleQuickActions({ role }: RoleActionsProps) {
  const navigate = useNavigate();

  const actionsMap: Record<string, { emoji: string; label: string; path: string; variant: "primary" | "secondary" }[]> = {
    startup: [
      { emoji: "📊", label: "Pitch Deck", path: "/pitchdeck", variant: "primary" },
      { emoji: "💰", label: "Levée de fonds", path: "/fundraising", variant: "secondary" },
      { emoji: "✍️", label: "Coaching", path: "/coaching", variant: "secondary" },
    ],
    mentor: [
      { emoji: "📅", label: "Mes sessions", path: "/coaching", variant: "primary" },
      { emoji: "👥", label: "Mes mentorés", path: "/networking", variant: "secondary" },
      { emoji: "💬", label: "Publier un conseil", path: "/feed", variant: "secondary" },
    ],
    investor: [
      { emoji: "🔒", label: "Deal Room", path: "/deal-room", variant: "primary" },
      { emoji: "👥", label: "Startups", path: "/networking", variant: "secondary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
    ],
    expert: [
      { emoji: "🛒", label: "Mes services", path: "/marketplace", variant: "primary" },
      { emoji: "✍️", label: "Mes consultations", path: "/coaching", variant: "secondary" },
      { emoji: "📝", label: "Publier", path: "/feed", variant: "secondary" },
    ],
    freelance: [
      { emoji: "🛒", label: "Mes offres", path: "/marketplace", variant: "primary" },
      { emoji: "👥", label: "Réseau", path: "/networking", variant: "secondary" },
      { emoji: "📅", label: "Calendrier", path: "/content-calendar", variant: "secondary" },
    ],
    incubateur: [
      { emoji: "🏗️", label: "Mes startups", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📊", label: "Analytics", path: "/analytics", variant: "secondary" },
    ],
    etudiant: [
      { emoji: "🎓", label: "Trouver un mentor", path: "/coaching", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "👥", label: "Networking", path: "/networking", variant: "secondary" },
    ],
    aspirationnel: [
      { emoji: "✨", label: "Explorer", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "📚", label: "Fil d'inspiration", path: "/feed", variant: "secondary" },
    ],
    professionnel: [
      { emoji: "🤝", label: "Networking", path: "/networking", variant: "primary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
      { emoji: "💬", label: "Messages", path: "/messaging", variant: "secondary" },
    ],
    corporate: [
      { emoji: "🔍", label: "Scouter startups", path: "/networking", variant: "primary" },
      { emoji: "🔒", label: "Deal Room", path: "/deal-room", variant: "secondary" },
      { emoji: "📅", label: "Événements", path: "/events", variant: "secondary" },
    ],
  };

  const actions = actionsMap[role] ?? actionsMap.startup;

  return (
    <div className="flex gap-1.5 md:gap-2.5 flex-wrap">
      {actions.map((a) => (
        <button
          key={a.path}
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
  const tipsMap: Record<string, { icon: string; title: string; items: string[] }> = {
    startup: {
      icon: "🚀", title: "Prochaines étapes pour votre startup",
      items: ["Complétez votre pitch deck", "Connectez-vous avec 5 mentors", "Publiez votre premier post", "Inscrivez-vous à un événement"],
    },
    mentor: {
      icon: "🎯", title: "Maximisez votre impact de mentor",
      items: ["Définissez vos créneaux de disponibilité", "Complétez votre profil coach", "Répondez aux demandes de session", "Partagez votre expertise via le fil d'actu"],
    },
    investor: {
      icon: "💎", title: "Optimisez votre deal flow",
      items: ["Créez votre Deal Room", "Filtrez les startups par secteur", "Participez aux Demo Days", "Connectez-vous avec d'autres investisseurs"],
    },
    expert: {
      icon: "🧠", title: "Développez votre expertise",
      items: ["Créez vos offres de service sur le marketplace", "Publiez des articles d'expertise", "Proposez des workshops", "Collectez des avis clients"],
    },
    freelance: {
      icon: "⚡", title: "Boostez votre activité freelance",
      items: ["Créez vos offres sur le marketplace", "Complétez votre portfolio", "Réseautez dans les cercles pro", "Définissez vos tarifs et disponibilités"],
    },
    incubateur: {
      icon: "🏗️", title: "Pilotez vos cohortes",
      items: ["Créez un cercle pour votre cohorte", "Organisez des événements de mentorat", "Suivez les progrès des startups", "Connectez startups et investisseurs"],
    },
    etudiant: {
      icon: "🎓", title: "Lancez-vous dans l'aventure",
      items: ["Trouvez un mentor dans votre secteur", "Participez aux événements networking", "Rejoignez un cercle thématique", "Commencez à construire votre réseau"],
    },
    aspirationnel: {
      icon: "✨", title: "Découvrez l'écosystème",
      items: ["Explorez les profils inspirants", "Assistez à un webinar ou meetup", "Lisez le fil d'inspiration", "Identifiez votre secteur d'intérêt"],
    },
    professionnel: {
      icon: "🤝", title: "Élargissez vos horizons",
      items: ["Connectez-vous avec des entrepreneurs", "Participez aux événements pro", "Proposez vos compétences", "Explorez les opportunités de collaboration"],
    },
    corporate: {
      icon: "🏢", title: "Innovez avec les startups",
      items: ["Identifiez des startups partenaires", "Créez votre page entreprise", "Organisez un challenge d'innovation", "Participez aux Demo Days"],
    },
  };

  const tips = tipsMap[role] ?? tipsMap.startup;

  return (
    <GHCard title={`${tips.icon} ${tips.title}`} className="mb-[18px]">
      <div className="space-y-2">
        {tips.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-extrabold text-primary flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-xs text-foreground/80">{item}</span>
          </div>
        ))}
      </div>
    </GHCard>
  );
}

export { roleHeroConfig };
