import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import { Users, Calendar, Star, MessageSquare, TrendingUp, Clock } from "lucide-react";

function MentorContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mentees" | "sessions" | "reviews">("mentees");

  // Get coach profile
  const { data: coach } = useQuery({
    queryKey: ["mentor-coach-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coaches").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  // Sessions as coach
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["mentor-sessions", coach?.id],
    enabled: !!coach,
    queryFn: async () => {
      const { data } = await supabase.from("coaching_sessions").select("*").eq("coach_id", coach!.id).order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  // Get mentee profiles
  const menteeIds = [...new Set(sessions.map(s => s.learner_id))];
  const { data: menteeProfiles = {} } = useQuery({
    queryKey: ["mentor-mentee-profiles", menteeIds],
    enabled: menteeIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, headline, company_name, sector").in("user_id", menteeIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["mentor-reviews", coach?.id],
    enabled: !!coach,
    queryFn: async () => {
      const { data } = await supabase.from("coach_reviews").select("*").eq("coach_id", coach!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Reviewer profiles
  const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))];
  const { data: reviewerProfiles = {} } = useQuery({
    queryKey: ["mentor-reviewer-profiles", reviewerIds],
    enabled: reviewerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", reviewerIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  const scheduled = sessions.filter(s => s.status === "scheduled" && new Date(s.scheduled_at) > new Date());
  const completed = sessions.filter(s => s.status === "completed");
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  // Per-mentee stats
  const menteeStats = menteeIds.map(id => {
    const menteeSessions = sessions.filter(s => s.learner_id === id);
    const completedCount = menteeSessions.filter(s => s.status === "completed").length;
    const nextSession = menteeSessions.find(s => s.status === "scheduled" && new Date(s.scheduled_at) > new Date());
    const profile = (menteeProfiles as any)[id];
    return { id, profile, totalSessions: menteeSessions.length, completedCount, nextSession };
  });

  if (!coach) {
    return (
      <GHCard className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h2 className="font-heading text-lg font-bold mb-2">Profil coach non configuré</h2>
        <p className="text-sm text-muted-foreground mb-4">Créez votre profil coach pour commencer à accueillir des mentorés.</p>
        <button onClick={() => navigate("/coaching")} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold">
          Configurer mon profil coach
        </button>
      </GHCard>
    );
  }

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👥" value={String(menteeIds.length)} label="Mentorés" badge="Actifs" badgeType="up" />
        <MetricCard icon="📅" value={String(scheduled.length)} label="Sessions à venir" badge="Planifiées" badgeType="up" />
        <MetricCard icon="✅" value={String(completed.length)} label="Sessions terminées" badge="Total" badgeType="neutral" />
        <MetricCard icon="⭐" value={avgRating} label="Note moyenne" badge="/5" badgeType={avgRating !== "—" ? "up" : "neutral"} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {([
          { key: "mentees" as const, label: "👥 Mes mentorés", count: menteeIds.length },
          { key: "sessions" as const, label: "📅 Sessions", count: sessions.length },
          { key: "reviews" as const, label: "⭐ Avis", count: reviews.length },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground/50 hover:border-primary/30"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Mentees tab */}
      {tab === "mentees" && (
        <div className="space-y-3">
          {menteeStats.length === 0 ? (
            <GHCard className="text-center py-8">
              <p className="text-sm text-muted-foreground">Aucun mentoré pour le moment. Partagez votre profil pour recevoir des demandes.</p>
            </GHCard>
          ) : menteeStats.map(m => (
            <GHCard key={m.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-heading text-sm font-extrabold text-primary flex-shrink-0">
                {(m.profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading text-sm font-bold">{m.profile?.display_name ?? "Mentoré"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {m.profile?.company_name && <span>{m.profile.company_name} · </span>}
                  {m.profile?.sector && <span>{m.profile.sector}</span>}
                </div>
                <div className="flex gap-1.5 mt-1">
                  <Tag variant="green">{m.completedCount} sessions</Tag>
                  {m.nextSession && <Tag>Prochaine: {new Date(m.nextSession.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</Tag>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/profile/${m.id}`)} className="text-xs text-primary font-bold hover:underline">Profil</button>
                <button onClick={() => navigate("/messaging")} className="text-xs text-muted-foreground hover:text-foreground">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {/* Sessions tab */}
      {tab === "sessions" && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune session.</p></GHCard>
          ) : sessions.map(s => {
            const mentee = (menteeProfiles as any)[s.learner_id];
            const isPast = new Date(s.scheduled_at) < new Date();
            return (
              <GHCard key={s.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === "completed" ? "bg-green-500/10" : s.status === "cancelled" ? "bg-destructive/10" : "bg-primary/10"}`}>
                  {s.status === "completed" ? <Star className="w-4 h-4 text-green-600" /> : s.status === "cancelled" ? <Clock className="w-4 h-4 text-destructive" /> : <Calendar className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-sm font-bold">{mentee?.display_name ?? "Mentoré"}</div>
                  <div className="text-[11px] text-muted-foreground">{s.topic ?? "Session"} · {new Date(s.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <Tag variant={s.status === "completed" ? "green" : s.status === "cancelled" ? "red" : "default"}>
                  {s.status === "completed" ? "Terminée" : s.status === "cancelled" ? "Annulée" : "Planifiée"}
                </Tag>
                {s.rating && <span className="text-xs font-bold text-primary">⭐ {s.rating}/5</span>}
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Reviews tab */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucun avis reçu.</p></GHCard>
          ) : reviews.map(r => {
            const reviewer = (reviewerProfiles as any)[r.reviewer_id];
            return (
              <GHCard key={r.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-heading text-xs font-extrabold text-primary flex-shrink-0">
                    {(reviewer?.display_name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-sm font-bold">{reviewer?.display_name ?? "Membre"}</span>
                      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />)}</div>
                    </div>
                    {r.review_text && <p className="text-xs text-foreground/70">{r.review_text}</p>}
                    <div className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              </GHCard>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function MentorDashboardPage() {
  usePageMeta({ title: "Espace Mentor", description: "Gérez vos mentorés et sessions de coaching." });

  return (
    <RoleGuard allowedRoles={["mentor", "expert"]} fallbackMessage="L'espace mentor est réservé aux profils Mentor et Expert.">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Users className="w-3 h-3" /> Espace Mentor
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Vos <span className="text-primary">mentorés</span> & sessions</h1>
            <p className="text-sm text-muted-foreground max-w-lg">Suivez vos mentorés, gérez vos sessions et consultez vos avis.</p>
          </div>
        </div>
        <MentorContent />
      </motion.div>
    </RoleGuard>
  );
}
