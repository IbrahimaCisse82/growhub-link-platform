import { motion } from "framer-motion";
import { GHCard, Tag, SectionHeader, StatRow, ProgressBar } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useObjectives, useCoachingSessions, usePosts } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import ActivationChecklist from "@/components/ActivationChecklist";
import SmartMatching from "@/components/SmartMatching";
import { StreakBadge, LeaderboardWidget } from "@/components/StreakLeaderboard";
import SmartNotifications from "@/components/SmartNotifications";
import SmartMatchCards from "@/components/SmartMatchCards";
import MilestoneDetector from "@/components/MilestoneDetector";
import WeeklyDigest from "@/components/WeeklyDigest";
import ProfileCompletionCard from "@/components/ProfileCompletionCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useActivatedTools } from "@/hooks/useActivatedTools";
import { useUserRole } from "@/hooks/useUserRole";
import { RoleMetrics, RoleQuickActions, RoleGuidance, roleHeroConfig } from "@/components/RoleDashboard";

export default function DashboardPage() {
  usePageMeta({ title: "Dashboard", description: "Tableau de bord GrowHub — suivez vos KPIs en temps réel." });
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: objectives } = useObjectives();
  const { data: sessions } = useCoachingSessions();
  const { data: posts } = usePosts();
  const { isActivated } = useActivatedTools();
  const { role } = useUserRole();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Membre";
  const nextSession = sessions?.find(s => s.status === "scheduled" && new Date(s.scheduled_at) > new Date());
  const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
  const recentPosts = posts?.slice(0, 2) ?? [];

  const heroConfig = roleHeroConfig[role] ?? roleHeroConfig.startup;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Hero — role-specific */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-2xl md:rounded-[20px] p-4 md:p-9 mb-4 md:mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-32 w-56 h-56 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 md:gap-2 mb-2.5 md:mb-3.5 flex-wrap">
            <div className="inline-flex items-center gap-1 md:gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2 md:px-2.5 py-[2px] md:py-[3px] text-[8px] md:text-[10px] font-bold text-primary uppercase tracking-wider">
              <span className="w-1 h-1 md:w-[5px] md:h-[5px] bg-primary rounded-full animate-pulse-dot" />
              {heroConfig.badge}
            </div>
            <StreakBadge />
          </div>
          <h1 className="font-heading text-lg md:text-[32px] font-extrabold leading-tight mb-1.5 md:mb-2">
            {heroConfig.title(displayName)}
          </h1>
          <p className="text-foreground/60 text-xs md:text-sm leading-relaxed max-w-[460px] mb-4 md:mb-6">
            {nextSession
              ? `Session prévue le ${new Date(nextSession.scheduled_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`
              : heroConfig.subtitle}
          </p>

          {/* Role-specific quick actions */}
          <RoleQuickActions role={role} />
        </div>
      </div>

      {/* Smart Notifications */}
      <SmartNotifications />

      {/* Milestone Detection */}
      <MilestoneDetector />

      {/* Weekly Digest */}
      <WeeklyDigest />

      {/* Profile Completion */}
      <ProfileCompletionCard />

      {/* Activation Checklist */}
      <ActivationChecklist />

      {/* Role-specific metrics */}
      <RoleMetrics role={role} />

      {/* Smart Match Cards */}
      <SmartMatchCards />

      {/* Smart Matching */}
      <SmartMatching />

      {/* Role-specific guidance */}
      <RoleGuidance role={role} />

      {/* Activity Feed */}
      <GHCard title="Activité récente" className="mb-[18px]">
        <ActivityFeed />
      </GHCard>

      {/* Objectives + Coaching + Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-[18px] mb-4 md:mb-[18px]">
        <div className="md:col-span-2 space-y-[18px]">
          {isActivated("progression") && (
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
          )}

          {isActivated("coaching") && (
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
            </GHCard>
          )}
        </div>

        <div>
          <LeaderboardWidget />
        </div>
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
