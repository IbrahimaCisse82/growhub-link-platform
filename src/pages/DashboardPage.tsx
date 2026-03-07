import { motion } from "framer-motion";
import { MetricCard, ProgressBar, GHCard, Tag, SectionHeader, StatRow } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats, useObjectives, useCoachingSessions, usePosts } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: objectives } = useObjectives();
  const { data: sessions } = useCoachingSessions();
  const { data: posts } = usePosts();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Entrepreneur";
  const nextSession = sessions?.find(s => s.status === "scheduled" && new Date(s.scheduled_at) > new Date());
  const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
  const recentPosts = posts?.slice(0, 2) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-32 w-56 h-56 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Startup Dashboard — Growth Command Center
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Bonjour {displayName},<br /><span className="text-primary">accélérez votre croissance</span> 🚀
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px] mb-6">
            {nextSession
              ? `Session coaching prévue le ${new Date(nextSession.scheduled_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`
              : "Votre écosystème est actif. Explorez vos outils ci-dessous."}
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={() => navigate("/pitchdeck")} className="inline-flex items-center gap-[7px] border-none rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-primary text-primary-foreground hover:bg-primary-hover hover:translate-y-[-1px] hover:shadow-glow">
              📊 Pitch Deck Builder
            </button>
            <button onClick={() => navigate("/fundraising")} className="inline-flex items-center gap-[7px] rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-card text-foreground border border-border hover:border-primary/35 hover:bg-secondary">
              💰 Fundraising Tracker
            </button>
            <button onClick={() => navigate("/coaching")} className="inline-flex items-center gap-[7px] rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-card text-foreground border border-border hover:border-primary/35 hover:bg-secondary">
              ✍️ Coaching Hub
            </button>
          </div>

          <div className="flex gap-4 md:gap-7 mt-7 pt-6 border-t border-border flex-wrap">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-28" />)
            ) : (
              <>
                <div><div className="font-heading text-xl md:text-[26px] font-extrabold leading-none mb-[3px]">{stats?.connections ?? 0}</div><div className="text-[11px] text-muted-foreground font-medium">Connexions</div></div>
                <div><div className="font-heading text-xl md:text-[26px] font-extrabold leading-none mb-[3px]">{stats?.completedSessions ?? 0}</div><div className="text-[11px] text-muted-foreground font-medium">Sessions coaching</div></div>
                <div><div className="font-heading text-xl md:text-[26px] font-extrabold leading-none mb-[3px]">{stats?.objectivePct ?? 0}%</div><div className="text-[11px] text-muted-foreground font-medium">Objectifs atteints</div></div>
                <div><div className="font-heading text-xl md:text-[26px] font-extrabold leading-none mb-[3px]">{stats?.avgRating ?? "—"}<span className="text-primary text-base">★</span></div><div className="text-[11px] text-muted-foreground font-medium">NPS coaching</div></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="👥" value={String(stats?.connections ?? 0)} label="Connexions réseau" badge={`${stats?.pendingConnections ?? 0} en attente`} badgeType="up" />
        <MetricCard icon="📅" value={String(stats?.completedSessions ?? 0)} label="Sessions coaching" badge={`★ ${stats?.avgRating ?? "—"}`} badgeType="up" />
        <MetricCard icon="🎯" value={`${stats?.objectivePct ?? 0}%`} label="Objectifs atteints" badge={`${stats?.completedObjectives ?? 0}/${stats?.totalObjectives ?? 0}`} badgeType="up" />
        <MetricCard icon="💬" value={String(stats?.totalPosts ?? 0)} label="Posts communauté" badge="Fil d'actu" badgeType="neutral" />
      </div>

      {/* Objectives + Coaching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] mb-[18px]">
        <GHCard title="Objectifs en cours" headerRight={<Tag variant="green">En cours</Tag>}>
          {!objectives || objectives.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucun objectif défini. Créez-en depuis la page Progression.</p>
          ) : (
            objectives.slice(0, 5).map((obj) => (
              <ProgressBar
                key={obj.id}
                label={obj.title}
                value={`${Math.round(((obj.current_value ?? 0) / (obj.target_value || 1)) * 100)}%`}
                percentage={Math.round(((obj.current_value ?? 0) / (obj.target_value || 1)) * 100)}
              />
            ))
          )}
        </GHCard>

        <GHCard title="Coaching Progress" headerRight={
          <button onClick={() => navigate("/coaching")} className="text-xs text-primary font-semibold hover:opacity-70">Voir →</button>
        }>
          {nextSession ? (
            <div className="flex gap-3.5 items-center bg-card border border-border rounded-xl p-3.5 mb-2.5">
              <div className="w-[42px] h-[42px] rounded-[11px] bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-sm font-extrabold text-primary-foreground flex-shrink-0">
                {((nextSession as any).coach_profile?.display_name ?? "C").substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-heading text-[13px] font-bold mb-[2px]">{(nextSession as any).coach_profile?.display_name ?? "Coach"}</div>
                <div className="text-[11px] text-muted-foreground mb-1.5">{nextSession.topic ?? "Session de coaching"}</div>
                <div className="flex gap-[5px] flex-wrap">
                  <Tag variant="green">{new Date(nextSession.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Tag>
                  <Tag>{nextSession.duration_minutes ?? 60} min</Tag>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune session prévue.</p>
          )}
          <StatRow label="Sessions terminées" value={String(completedSessions.length)} />
          <StatRow label="Satisfaction moyenne" value={`${stats?.avgRating ?? "—"} ★`} />
        </GHCard>
      </div>

      {/* News Feed Widget */}
      {recentPosts.length > 0 && (
        <div className="mt-[18px]">
          <SectionHeader title="🔥 Fil d'actualité — À la une" linkText="Voir tout →" onLink={() => navigate("/feed")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentPosts.map((post) => (
              <GHCard key={post.id} className="cursor-pointer" onClick={() => navigate("/feed")}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0">
                    {((post as any).author?.display_name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{(post as any).author?.display_name ?? "Membre"}</div>
                    <div className="text-[10px] text-muted-foreground">{(post as any).author?.company_name ?? ""}</div>
                  </div>
                  <Tag variant="green">{post.post_type}</Tag>
                </div>
                <div className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{post.content}</div>
                <div className="text-[11px] text-muted-foreground mt-2">👍 {post.likes_count} · 💬 {post.comments_count}</div>
              </GHCard>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <GHCard className="text-center py-8 mt-4">
          <p className="text-sm text-muted-foreground">Connectez-vous pour voir vos données personnalisées.</p>
        </GHCard>
      )}
    </motion.div>
  );
}
