import { motion } from "framer-motion";
import PredictiveAnalytics from "@/components/PredictiveAnalytics";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useSSI } from "@/hooks/useSSI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GHCard, Tag, ProgressBar } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Users, Target, Calendar, MessageSquare, Award,
  Shield, Eye, Zap, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
  UserCheck, BookOpen, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import NetworkGraph from "@/components/NetworkGraph";
import NetworkAnalytics from "@/components/NetworkAnalytics";
import NetworkingROI from "@/components/NetworkingROI";
import ShareableAchievementCards from "@/components/ShareableAchievementCards";

const PIE_COLORS = [
  "hsl(93, 100%, 37%)", "hsl(213, 82%, 51%)", "hsl(23, 88%, 49%)",
  "hsl(258, 70%, 59%)", "hsl(173, 100%, 33%)", "hsl(44, 100%, 50%)",
];

function useAnalyticsData() {
  const { user } = useAuth();

  const objectivesByCategory = useQuery({
    queryKey: ["analytics-obj-cat", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("objectives").select("category, is_completed").eq("user_id", user!.id);
      const cats: Record<string, { total: number; done: number }> = {};
      (data ?? []).forEach((o) => { const c = o.category || "Autre"; if (!cats[c]) cats[c] = { total: 0, done: 0 }; cats[c].total++; if (o.is_completed) cats[c].done++; });
      return Object.entries(cats).map(([name, v]) => ({ name, total: v.total, done: v.done, pct: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0 }));
    },
  });

  const postActivity = useQuery({
    queryKey: ["analytics-posts-activity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("created_at, likes_count, comments_count").order("created_at", { ascending: true }).limit(100);
      const byMonth: Record<string, { posts: number; likes: number; comments: number }> = {};
      (data ?? []).forEach((p) => { const m = new Date(p.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }); if (!byMonth[m]) byMonth[m] = { posts: 0, likes: 0, comments: 0 }; byMonth[m].posts++; byMonth[m].likes += p.likes_count ?? 0; byMonth[m].comments += p.comments_count ?? 0; });
      return Object.entries(byMonth).map(([month, v]) => ({ month, ...v }));
    },
  });

  const sessionsByStatus = useQuery({
    queryKey: ["analytics-sessions-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("coaching_sessions").select("status").eq("learner_id", user!.id);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((s) => { counts[s.status] = (counts[s.status] ?? 0) + 1; });
      const labels: Record<string, string> = { scheduled: "Planifiées", in_progress: "En cours", completed: "Terminées", cancelled: "Annulées" };
      return Object.entries(counts).map(([status, value]) => ({ name: labels[status] || status, value }));
    },
  });

  const connectionGrowth = useQuery({
    queryKey: ["analytics-conn-growth", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("connections").select("created_at, status").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted").order("created_at", { ascending: true });
      let cumulative = 0;
      const byMonth: Record<string, number> = {};
      (data ?? []).forEach((c) => { const m = new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }); cumulative++; byMonth[m] = cumulative; });
      return Object.entries(byMonth).map(([month, count]) => ({ month, count }));
    },
  });

  return { objectivesByCategory, postActivity, sessionsByStatus, connectionGrowth };
}

const chartConfigBar: ChartConfig = { total: { label: "Total", color: "hsl(var(--primary))" }, done: { label: "Terminés", color: "hsl(var(--green))" } };
const chartConfigLine: ChartConfig = { posts: { label: "Posts", color: "hsl(var(--primary))" }, likes: { label: "Likes", color: "hsl(var(--blue))" }, comments: { label: "Commentaires", color: "hsl(var(--orange))" } };
const chartConfigArea: ChartConfig = { count: { label: "Connexions", color: "hsl(var(--primary))" } };
const chartConfigPie: ChartConfig = { value: { label: "Sessions" } };

function SSIGauge({ score, label, max = 25, color }: { score: number; label: string; max?: number; color: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <path className="stroke-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-sm font-extrabold">{score}</span>
        </div>
      </div>
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function ProfileCheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />}
      <span className={cn("text-xs", ok ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  usePageMeta({ title: "Analytics & SSI", description: "Votre tableau de bord de performance et Social Selling Index." });

  const { data: stats, isLoading } = useDashboardStats();
  const { data: ssi, isLoading: ssiLoading } = useSSI();
  const { objectivesByCategory, postActivity, sessionsByStatus, connectionGrowth } = useAnalyticsData();

  const kpis = [
    { icon: Users, label: "Connexions", value: stats?.connections ?? 0, color: "text-primary" },
    { icon: Target, label: "Objectifs atteints", value: `${stats?.objectivePct ?? 0}%`, color: "text-ghblue" },
    { icon: Calendar, label: "Sessions coaching", value: stats?.completedSessions ?? 0, color: "text-ghorange" },
    { icon: MessageSquare, label: "Posts", value: stats?.totalPosts ?? 0, color: "text-ghpurple" },
    { icon: Award, label: "Badges", value: stats?.totalBadges ?? 0, color: "text-ghgold" },
    { icon: TrendingUp, label: "Événements", value: stats?.totalEvents ?? 0, color: "text-ghteal" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} role="main" aria-label="Page Analytics">
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <Zap className="w-3.5 h-3.5" /> Analytics & Performance
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Votre <span className="text-primary">Social Selling Index</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[460px]">
            Mesurez votre impact, votre visibilité et la qualité de votre réseau.
          </p>
        </div>
      </div>

      {/* SSI Score */}
      {ssiLoading ? (
        <Skeleton className="h-48 rounded-2xl mb-5" />
      ) : ssi && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Main SSI Score */}
          <GHCard className="md:col-span-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-28 h-28 mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-secondary" strokeWidth="2.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-primary" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray={`${ssi.totalScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-3xl font-extrabold text-primary">{ssi.totalScore}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
            </div>
            <h3 className="font-heading text-sm font-bold mb-1">Social Selling Index</h3>
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold",
              ssi.weeklyChange >= 0 ? "text-primary" : "text-destructive"
            )}>
              {ssi.weeklyChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {ssi.weeklyChange >= 0 ? "+" : ""}{ssi.weeklyChange} cette semaine
            </div>
          </GHCard>

          {/* SSI Breakdown */}
          <GHCard className="md:col-span-1">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Détail SSI</h4>
            <div className="grid grid-cols-2 gap-4">
              <SSIGauge score={ssi.profileStrength} label="Profil" color="stroke-primary" />
              <SSIGauge score={ssi.networkQuality} label="Réseau" color="stroke-ghblue" />
              <SSIGauge score={ssi.engagement} label="Engagement" color="stroke-ghorange" />
              <SSIGauge score={ssi.visibility} label="Visibilité" color="stroke-ghpurple" />
            </div>
          </GHCard>

          {/* Profile Checklist */}
          <GHCard className="md:col-span-1">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Optimiser votre profil</h4>
            <ProfileCheckItem ok={ssi.details.hasAvatar} label="Photo de profil" />
            <ProfileCheckItem ok={ssi.details.hasBio} label="Biographie complète" />
            <ProfileCheckItem ok={ssi.details.hasSkills} label="3+ compétences" />
            <ProfileCheckItem ok={ssi.details.hasInterests} label="2+ intérêts" />
            <ProfileCheckItem ok={ssi.details.hasLinkedin} label="LinkedIn connecté" />
            <ProfileCheckItem ok={ssi.details.hasWebsite} label="Site web ajouté" />
          </GHCard>
        </div>
      )}

      {/* Activity KPIs */}
      {ssi && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <GHCard className="text-center py-3">
            <Eye className="w-4 h-4 mx-auto mb-1 text-ghpurple" />
            <div className="font-heading text-lg font-extrabold">{ssi.details.profileViews}</div>
            <div className="text-[10px] text-muted-foreground">Vues profil</div>
          </GHCard>
          <GHCard className="text-center py-3">
            <UserCheck className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="font-heading text-lg font-extrabold">{ssi.details.endorsementsReceived}</div>
            <div className="text-[10px] text-muted-foreground">Recommandations</div>
          </GHCard>
          <GHCard className="text-center py-3">
            <BookOpen className="w-4 h-4 mx-auto mb-1 text-ghblue" />
            <div className="font-heading text-lg font-extrabold">{ssi.details.postCount}</div>
            <div className="text-[10px] text-muted-foreground">Publications</div>
          </GHCard>
          <GHCard className="text-center py-3">
            <Star className="w-4 h-4 mx-auto mb-1 text-ghorange" />
            <div className="font-heading text-lg font-extrabold">{ssi.details.coachingSessions}</div>
            <div className="text-[10px] text-muted-foreground">Sessions coaching</div>
          </GHCard>
        </div>
      )}

      {/* KPIs */}
      <section aria-label="Indicateurs clés" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : kpis.map((kpi) => (
              <GHCard key={kpi.label} className="text-center py-4">
                <kpi.icon className={`w-5 h-5 mx-auto mb-1.5 ${kpi.color}`} />
                <div className="font-heading text-xl font-extrabold">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground">{kpi.label}</div>
              </GHCard>
            ))}
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GHCard title="Objectifs par catégorie" headerRight={<Tag variant="green">Barres</Tag>}>
          {objectivesByCategory.isLoading ? <Skeleton className="h-52" /> : !objectivesByCategory.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucun objectif.</p>
          ) : (
            <ChartContainer config={chartConfigBar} className="h-52 w-full">
              <BarChart data={objectivesByCategory.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="done" fill="hsl(var(--green-dark))" radius={[4, 4, 0, 0]} name="Terminés" />
              </BarChart>
            </ChartContainer>
          )}
        </GHCard>

        <GHCard title="Sessions coaching" headerRight={<Tag variant="blue">Répartition</Tag>}>
          {sessionsByStatus.isLoading ? <Skeleton className="h-52" /> : !sessionsByStatus.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune session.</p>
          ) : (
            <ChartContainer config={chartConfigPie} className="h-52 w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={sessionsByStatus.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {sessionsByStatus.data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </GHCard>

        <GHCard title="Activité du feed" headerRight={<Tag variant="purple">Tendance</Tag>}>
          {postActivity.isLoading ? <Skeleton className="h-52" /> : !postActivity.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune activité.</p>
          ) : (
            <ChartContainer config={chartConfigLine} className="h-52 w-full">
              <LineChart data={postActivity.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Posts" />
                <Line type="monotone" dataKey="likes" stroke="hsl(var(--blue))" strokeWidth={2} dot={false} name="Likes" />
                <Line type="monotone" dataKey="comments" stroke="hsl(var(--orange))" strokeWidth={2} dot={false} name="Commentaires" />
              </LineChart>
            </ChartContainer>
          )}
        </GHCard>

        <GHCard title="Croissance réseau" headerRight={<Tag variant="teal">Cumulatif</Tag>}>
          {connectionGrowth.isLoading ? <Skeleton className="h-52" /> : !connectionGrowth.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune donnée.</p>
          ) : (
            <ChartContainer config={chartConfigArea} className="h-52 w-full">
              <AreaChart data={connectionGrowth.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Connexions" />
              </AreaChart>
            </ChartContainer>
          )}
        </GHCard>
      </div>

      {/* Network Graph */}
      <div className="mt-5">
        <NetworkGraph />
      </div>

      {/* Network ROI Analytics */}
      <div className="mt-5">
        <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> ROI Networking
        </h2>
        <NetworkAnalytics />
      </div>

      {/* Networking ROI Tracker */}
      <div className="mt-5">
        <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-ghblue" /> Networking ROI Tracker
        </h2>
        <NetworkingROI />
      </div>

      {/* Shareable Achievement Cards */}
      <div className="mt-5">
        <ShareableAchievementCards />
      </div>
    </motion.div>
  );
}
