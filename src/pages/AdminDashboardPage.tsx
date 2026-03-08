import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, SectionHeader, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Users, FileText, Calendar, MessageSquare, TrendingUp,
  BarChart3, Award, Eye, Activity, Clock, AlertTriangle
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

function useAdminStats() {
  const { user } = useAuth();

  const userStats = useQuery({
    queryKey: ["admin-user-stats"],
    enabled: !!user,
    queryFn: async () => {
      const [profiles, connections, posts, events, sessions, badges] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }),
        supabase.from("user_badges").select("id", { count: "exact", head: true }),
      ]);
      return {
        totalUsers: profiles.count ?? 0,
        totalConnections: connections.count ?? 0,
        totalPosts: posts.count ?? 0,
        totalEvents: events.count ?? 0,
        totalSessions: sessions.count ?? 0,
        totalBadges: badges.count ?? 0,
      };
    },
  });

  const roleDistribution = useQuery({
    queryKey: ["admin-role-dist"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      const counts: Record<string, number> = {};
      (data ?? []).forEach(r => { counts[r.role] = (counts[r.role] ?? 0) + 1; });
      return Object.entries(counts).map(([role, count]) => ({ role, count }));
    },
  });

  const recentActivity = useQuery({
    queryKey: ["admin-recent-activity"],
    enabled: !!user,
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: posts } = await supabase.from("posts")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true });
      
      const byDay: Record<string, number> = {};
      (posts ?? []).forEach(p => {
        const day = new Date(p.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
        byDay[day] = (byDay[day] ?? 0) + 1;
      });
      return Object.entries(byDay).map(([day, posts]) => ({ day, posts }));
    },
  });

  const recentUsers = useQuery({
    queryKey: ["admin-recent-users"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles")
        .select("user_id, display_name, avatar_url, created_at, sector, city")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return { userStats, roleDistribution, recentActivity, recentUsers };
}

const roleLabels: Record<string, string> = {
  startup: "Startup", mentor: "Mentor", investor: "Investisseur", expert: "Expert",
  freelance: "Freelance", incubateur: "Incubateur", etudiant: "Étudiant",
  aspirationnel: "Aspirationnel", professionnel: "Professionnel", corporate: "Corporate", admin: "Admin",
};

const chartConfig: ChartConfig = { posts: { label: "Publications", color: "hsl(var(--primary))" } };
const barConfig: ChartConfig = { count: { label: "Utilisateurs", color: "hsl(var(--primary))" } };

export default function AdminDashboardPage() {
  usePageMeta({ title: "Admin Dashboard", description: "Tableau de bord d'administration de la plateforme." });
  const { userStats, roleDistribution, recentActivity, recentUsers } = useAdminStats();
  const stats = userStats.data;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-destructive/5 border-2 border-destructive/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-destructive uppercase tracking-wider mb-3.5">
            <Shield className="w-3.5 h-3.5" /> Administration
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Tableau de bord <span className="text-destructive">Admin</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[460px]">
            Vue d'ensemble de la plateforme, statistiques et gestion.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {userStats.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <MetricCard icon="👥" value={String(stats?.totalUsers ?? 0)} label="Utilisateurs" badge="Total" badgeType="neutral" />
            <MetricCard icon="🤝" value={String(stats?.totalConnections ?? 0)} label="Connexions" badge="Actives" badgeType="up" />
            <MetricCard icon="📝" value={String(stats?.totalPosts ?? 0)} label="Publications" badge="Total" badgeType="neutral" />
            <MetricCard icon="📅" value={String(stats?.totalEvents ?? 0)} label="Événements" badge="Créés" badgeType="up" />
            <MetricCard icon="🎓" value={String(stats?.totalSessions ?? 0)} label="Sessions" badge="Coaching" badgeType="neutral" />
            <MetricCard icon="🏅" value={String(stats?.totalBadges ?? 0)} label="Badges" badge="Distribués" badgeType="up" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Role distribution */}
        <GHCard title="Répartition par rôle" headerRight={<Tag>Utilisateurs</Tag>}>
          {roleDistribution.isLoading ? <Skeleton className="h-52" /> : (
            <ChartContainer config={barConfig} className="h-52 w-full">
              <BarChart data={roleDistribution.data?.map(r => ({ ...r, name: roleLabels[r.role] ?? r.role }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Utilisateurs" />
              </BarChart>
            </ChartContainer>
          )}
        </GHCard>

        {/* Activity trend */}
        <GHCard title="Activité (30 jours)" headerRight={<Tag variant="green">Publications</Tag>}>
          {recentActivity.isLoading ? <Skeleton className="h-52" /> : !recentActivity.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune activité récente.</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-52 w-full">
              <AreaChart data={recentActivity.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="posts" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          )}
        </GHCard>
      </div>

      {/* Recent users */}
      <GHCard title="Derniers inscrits" headerRight={<Tag variant="blue">Récent</Tag>}>
        {recentUsers.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-1.5">
            {recentUsers.data?.map((u: any) => (
              <div key={u.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Users className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-heading text-xs font-bold">{u.display_name || "Sans nom"}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {u.sector && <span>{u.sector}</span>}
                    {u.city && <span>📍 {u.city}</span>}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </GHCard>
    </motion.div>
  );
}
