import { useNavigate } from "react-router-dom";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

// ─── Role-specific hero configs ──────────────────────────────
const roleHeroConfig: Record<string, { badge: string; title: (name: string) => JSX.Element; subtitle: string }> = {
  startup: {
    get badge() { return i18n.t("c3.roleDashboard.hero.startup.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.startup.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.startup.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.startup.subtitle"); },
  },
  mentor: {
    get badge() { return i18n.t("c3.roleDashboard.hero.mentor.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.mentor.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.mentor.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.mentor.subtitle"); },
  },
  investor: {
    get badge() { return i18n.t("c3.roleDashboard.hero.investor.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.investor.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.investor.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.investor.subtitle"); },
  },
  expert: {
    get badge() { return i18n.t("c3.roleDashboard.hero.expert.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.expert.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.expert.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.expert.subtitle"); },
  },
  freelance: {
    get badge() { return i18n.t("c3.roleDashboard.hero.freelance.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.freelance.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.freelance.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.freelance.subtitle"); },
  },
  incubateur: {
    get badge() { return i18n.t("c3.roleDashboard.hero.incubateur.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.incubateur.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.incubateur.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.incubateur.subtitle"); },
  },
  etudiant: {
    get badge() { return i18n.t("c3.roleDashboard.hero.etudiant.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.etudiant.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.etudiant.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.etudiant.subtitle"); },
  },
  aspirationnel: {
    get badge() { return i18n.t("c3.roleDashboard.hero.aspirationnel.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.aspirationnel.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.aspirationnel.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.aspirationnel.subtitle"); },
  },
  professionnel: {
    get badge() { return i18n.t("c3.roleDashboard.hero.professionnel.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.professionnel.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.professionnel.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.professionnel.subtitle"); },
  },
  corporate: {
    get badge() { return i18n.t("c3.roleDashboard.hero.corporate.badge"); },
    title: (name) => <>{i18n.t("c3.roleDashboard.greeting", { name })}<br className="hidden md:block" /><span className="text-primary"> {i18n.t("c3.roleDashboard.hero.corporate.titleHighlight")}</span> {i18n.t("c3.roleDashboard.hero.corporate.emoji")}</>,
    get subtitle() { return i18n.t("c3.roleDashboard.hero.corporate.subtitle"); },
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
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.startup.0.label"), badge: t("c3.roleDashboard.metrics.startup.0.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.learnerSessions), label: t("c3.roleDashboard.metrics.startup.1.label"), badge: t("c3.roleDashboard.metrics.startup.1.badge"), badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.startup.2.label"), badge: t("c3.roleDashboard.metrics.startup.2.badge"), badgeType: "neutral" },
      { icon: "🚀", value: String(s.activeRounds), label: t("c3.roleDashboard.metrics.startup.3.label"), badge: t("c3.roleDashboard.metrics.startup.3.badge"), badgeType: s.activeRounds > 0 ? "up" : "neutral" },
    ],
    mentor: [
      { icon: "🎯", value: String(s.coachSessions), label: t("c3.roleDashboard.metrics.mentor.0.label"), badge: t("c3.roleDashboard.metrics.mentor.0.badge"), badgeType: "up" },
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.mentor.1.label"), badge: t("c3.roleDashboard.metrics.mentor.1.badge"), badgeType: "up" },
      { icon: "⭐", value: s.coachRating ?? "—", label: t("c3.roleDashboard.metrics.mentor.2.label"), badge: t("c3.roleDashboard.metrics.mentor.2.badge"), badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.mentor.3.label"), badge: t("c3.roleDashboard.metrics.mentor.3.badge"), badgeType: "neutral" },
    ],
    investor: [
      { icon: "💎", value: String(s.dealRooms), label: t("c3.roleDashboard.metrics.investor.0.label"), badge: t("c3.roleDashboard.metrics.investor.0.badge"), badgeType: s.dealRooms > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.investor.1.label"), badge: t("c3.roleDashboard.metrics.investor.1.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.events), label: t("c3.roleDashboard.metrics.investor.2.label"), badge: t("c3.roleDashboard.metrics.investor.2.badge"), badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.investor.3.label"), badge: t("c3.roleDashboard.metrics.investor.3.badge"), badgeType: "neutral" },
    ],
    expert: [
      { icon: "🧠", value: String(s.coachSessions), label: t("c3.roleDashboard.metrics.expert.0.label"), badge: t("c3.roleDashboard.metrics.expert.0.badge"), badgeType: "up" },
      { icon: "🛒", value: String(s.services), label: t("c3.roleDashboard.metrics.expert.1.label"), badge: t("c3.roleDashboard.metrics.expert.1.badge"), badgeType: s.services > 0 ? "up" : "neutral" },
      { icon: "⭐", value: s.coachRating ?? "—", label: t("c3.roleDashboard.metrics.expert.2.label"), badge: t("c3.roleDashboard.metrics.expert.2.badge"), badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.expert.3.label"), badge: t("c3.roleDashboard.metrics.expert.3.badge"), badgeType: "neutral" },
    ],
    freelance: [
      { icon: "💼", value: String(s.services), label: t("c3.roleDashboard.metrics.freelance.0.label"), badge: t("c3.roleDashboard.metrics.freelance.0.badge"), badgeType: s.services > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.freelance.1.label"), badge: t("c3.roleDashboard.metrics.freelance.1.badge"), badgeType: "up" },
      { icon: "⭐", value: s.coachRating ?? "—", label: t("c3.roleDashboard.metrics.freelance.2.label"), badge: t("c3.roleDashboard.metrics.freelance.2.badge"), badgeType: s.coachRating ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.freelance.3.label"), badge: t("c3.roleDashboard.metrics.freelance.3.badge"), badgeType: "neutral" },
    ],
    incubateur: [
      { icon: "🏗️", value: String(s.connections), label: t("c3.roleDashboard.metrics.incubateur.0.label"), badge: t("c3.roleDashboard.metrics.incubateur.0.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.events), label: t("c3.roleDashboard.metrics.incubateur.1.label"), badge: t("c3.roleDashboard.metrics.incubateur.1.badge"), badgeType: "neutral" },
      { icon: "🎯", value: String(s.coachSessions), label: t("c3.roleDashboard.metrics.incubateur.2.label"), badge: t("c3.roleDashboard.metrics.incubateur.2.badge"), badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.incubateur.3.label"), badge: t("c3.roleDashboard.metrics.incubateur.3.badge"), badgeType: "neutral" },
    ],
    etudiant: [
      { icon: "📚", value: String(s.learnerSessions), label: t("c3.roleDashboard.metrics.etudiant.0.label"), badge: t("c3.roleDashboard.metrics.etudiant.0.badge"), badgeType: "up" },
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.etudiant.1.label"), badge: t("c3.roleDashboard.metrics.etudiant.1.badge"), badgeType: "up" },
      { icon: "🎯", value: String(s.objectivesCompleted), label: t("c3.roleDashboard.metrics.etudiant.2.label"), badge: t("c3.roleDashboard.metrics.etudiant.2.badge"), badgeType: s.objectivesCompleted > 0 ? "up" : "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.etudiant.3.label"), badge: t("c3.roleDashboard.metrics.etudiant.3.badge"), badgeType: "neutral" },
    ],
    aspirationnel: [
      { icon: "✨", value: String(s.connections), label: t("c3.roleDashboard.metrics.aspirationnel.0.label"), badge: t("c3.roleDashboard.metrics.aspirationnel.0.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.events), label: t("c3.roleDashboard.metrics.aspirationnel.1.label"), badge: t("c3.roleDashboard.metrics.aspirationnel.1.badge"), badgeType: s.events > 0 ? "up" : "neutral" },
      { icon: "📚", value: String(s.learnerSessions), label: t("c3.roleDashboard.metrics.aspirationnel.2.label"), badge: t("c3.roleDashboard.metrics.aspirationnel.2.badge"), badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.aspirationnel.3.label"), badge: t("c3.roleDashboard.metrics.aspirationnel.3.badge"), badgeType: "neutral" },
    ],
    professionnel: [
      { icon: "🤝", value: String(s.connections), label: t("c3.roleDashboard.metrics.professionnel.0.label"), badge: t("c3.roleDashboard.metrics.professionnel.0.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.events), label: t("c3.roleDashboard.metrics.professionnel.1.label"), badge: t("c3.roleDashboard.metrics.professionnel.1.badge"), badgeType: "up" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.professionnel.2.label"), badge: t("c3.roleDashboard.metrics.professionnel.2.badge"), badgeType: "neutral" },
      { icon: "🎯", value: String(s.objectivesCompleted), label: t("c3.roleDashboard.metrics.professionnel.3.label"), badge: t("c3.roleDashboard.metrics.professionnel.3.badge"), badgeType: s.objectivesCompleted > 0 ? "up" : "neutral" },
    ],
    corporate: [
      { icon: "🏢", value: String(s.dealRooms), label: t("c3.roleDashboard.metrics.corporate.0.label"), badge: t("c3.roleDashboard.metrics.corporate.0.badge"), badgeType: s.dealRooms > 0 ? "up" : "neutral" },
      { icon: "👥", value: String(s.connections), label: t("c3.roleDashboard.metrics.corporate.1.label"), badge: t("c3.roleDashboard.metrics.corporate.1.badge"), badgeType: "up" },
      { icon: "📅", value: String(s.events), label: t("c3.roleDashboard.metrics.corporate.2.label"), badge: t("c3.roleDashboard.metrics.corporate.2.badge"), badgeType: "neutral" },
      { icon: "💬", value: String(s.posts), label: t("c3.roleDashboard.metrics.corporate.3.label"), badge: t("c3.roleDashboard.metrics.corporate.3.badge"), badgeType: "neutral" },
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
      { emoji: "💎", label: "Deal Flow", path: "/deal-flow", variant: "primary" },
      { emoji: "🔒", label: "Deal Room", path: "/deal-room", variant: "secondary" },
      { emoji: "👥", label: "Startups", path: "/networking", variant: "secondary" },
      { emoji: "📊", label: "Pitch Decks", path: "/pitchdeck", variant: "secondary" },
    ],
    expert: [
      { emoji: "🛒", label: "Mes services", path: "/marketplace", variant: "primary" },
      { emoji: "✍️", label: "Consultations", path: "/coaching", variant: "secondary" },
      { emoji: "📝", label: "Publier", path: "/feed", variant: "secondary" },
      { emoji: "📊", label: "Analytics", path: "/analytics", variant: "secondary" },
    ],
    freelance: [
      { emoji: "📊", label: "Mon pipeline", path: "/pipeline", variant: "primary" },
      { emoji: "🛒", label: "Mes offres", path: "/marketplace", variant: "secondary" },
      { emoji: "👥", label: "Réseau", path: "/networking", variant: "secondary" },
      { emoji: "📣", label: "Leads", path: "/marketing", variant: "secondary" },
    ],
    incubateur: [
      { emoji: "🏗️", label: "Mes cohortes", path: "/cohorts", variant: "primary" },
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
