import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Users, Target, Calendar, MessageSquare, Award } from "lucide-react";

const PIE_COLORS = [
  "hsl(93, 100%, 37%)",
  "hsl(213, 82%, 51%)",
  "hsl(23, 88%, 49%)",
  "hsl(258, 70%, 59%)",
  "hsl(173, 100%, 33%)",
  "hsl(44, 100%, 50%)",
];

function useAnalyticsData() {
  const { user } = useAuth();

  const objectivesByCategory = useQuery({
    queryKey: ["analytics-obj-cat", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("objectives")
        .select("category, is_completed")
        .eq("user_id", user!.id);
      const cats: Record<string, { total: number; done: number }> = {};
      (data ?? []).forEach((o) => {
        const c = o.category || "Autre";
        if (!cats[c]) cats[c] = { total: 0, done: 0 };
        cats[c].total++;
        if (o.is_completed) cats[c].done++;
      });
      return Object.entries(cats).map(([name, v]) => ({
        name,
        total: v.total,
        done: v.done,
        pct: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
      }));
    },
  });

  const postActivity = useQuery({
    queryKey: ["analytics-posts-activity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("created_at, likes_count, comments_count")
        .order("created_at", { ascending: true })
        .limit(100);
      const byMonth: Record<string, { posts: number; likes: number; comments: number }> = {};
      (data ?? []).forEach((p) => {
        const m = new Date(p.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        if (!byMonth[m]) byMonth[m] = { posts: 0, likes: 0, comments: 0 };
        byMonth[m].posts++;
        byMonth[m].likes += p.likes_count ?? 0;
        byMonth[m].comments += p.comments_count ?? 0;
      });
      return Object.entries(byMonth).map(([month, v]) => ({ month, ...v }));
    },
  });

  const sessionsByStatus = useQuery({
    queryKey: ["analytics-sessions-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("coaching_sessions")
        .select("status")
        .eq("learner_id", user!.id);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((s) => {
        counts[s.status] = (counts[s.status] ?? 0) + 1;
      });
      const labels: Record<string, string> = {
        scheduled: "Planifiées",
        in_progress: "En cours",
        completed: "Terminées",
        cancelled: "Annulées",
      };
      return Object.entries(counts).map(([status, value]) => ({
        name: labels[status] || status,
        value,
      }));
    },
  });

  const connectionGrowth = useQuery({
    queryKey: ["analytics-conn-growth", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("connections")
        .select("created_at, status")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .eq("status", "accepted")
        .order("created_at", { ascending: true });
      let cumulative = 0;
      const byMonth: Record<string, number> = {};
      (data ?? []).forEach((c) => {
        const m = new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        cumulative++;
        byMonth[m] = cumulative;
      });
      return Object.entries(byMonth).map(([month, count]) => ({ month, count }));
    },
  });

  return { objectivesByCategory, postActivity, sessionsByStatus, connectionGrowth };
}

const chartConfigBar: ChartConfig = {
  total: { label: "Total", color: "hsl(var(--primary))" },
  done: { label: "Terminés", color: "hsl(var(--green))" },
};

const chartConfigLine: ChartConfig = {
  posts: { label: "Posts", color: "hsl(var(--primary))" },
  likes: { label: "Likes", color: "hsl(var(--blue))" },
  comments: { label: "Commentaires", color: "hsl(var(--orange))" },
};

const chartConfigArea: ChartConfig = {
  count: { label: "Connexions", color: "hsl(var(--primary))" },
};

const chartConfigPie: ChartConfig = {
  value: { label: "Sessions" },
};

export default function AnalyticsPage() {
  usePageMeta({
    title: "Analytics",
    description: "Tableaux de bord et KPIs pour piloter votre croissance startup.",
  });

  const { data: stats, isLoading } = useDashboardStats();
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="main"
      aria-label="Page Analytics"
    >
      <header className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold">
          📊 Analytics & <span className="text-primary">Performance</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visualisez vos KPIs et suivez votre progression.</p>
      </header>

      {/* KPIs */}
      <section aria-label="Indicateurs clés" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : kpis.map((kpi) => (
              <GHCard key={kpi.label} className="text-center py-4">
                <kpi.icon className={`w-5 h-5 mx-auto mb-1.5 ${kpi.color}`} aria-hidden="true" />
                <div className="font-heading text-xl font-extrabold">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground">{kpi.label}</div>
              </GHCard>
            ))}
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objectives by Category */}
        <GHCard title="Objectifs par catégorie" headerRight={<Tag variant="green">Barres</Tag>}>
          {objectivesByCategory.isLoading ? (
            <Skeleton className="h-52" />
          ) : !objectivesByCategory.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucun objectif à afficher.</p>
          ) : (
            <ChartContainer config={chartConfigBar} className="h-52 w-full">
              <BarChart data={objectivesByCategory.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="done" fill="hsl(var(--green-dark))" radius={[4, 4, 0, 0]} name="Terminés" />
              </BarChart>
            </ChartContainer>
          )}
        </GHCard>

        {/* Coaching Sessions Pie */}
        <GHCard title="Sessions coaching" headerRight={<Tag variant="blue">Répartition</Tag>}>
          {sessionsByStatus.isLoading ? (
            <Skeleton className="h-52" />
          ) : !sessionsByStatus.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune session à afficher.</p>
          ) : (
            <ChartContainer config={chartConfigPie} className="h-52 w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={sessionsByStatus.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sessionsByStatus.data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </GHCard>

        {/* Post Activity Line */}
        <GHCard title="Activité du feed" headerRight={<Tag variant="purple">Tendance</Tag>}>
          {postActivity.isLoading ? (
            <Skeleton className="h-52" />
          ) : !postActivity.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune activité à afficher.</p>
          ) : (
            <ChartContainer config={chartConfigLine} className="h-52 w-full">
              <LineChart data={postActivity.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Posts" />
                <Line type="monotone" dataKey="likes" stroke="hsl(var(--blue))" strokeWidth={2} dot={false} name="Likes" />
                <Line type="monotone" dataKey="comments" stroke="hsl(var(--orange))" strokeWidth={2} dot={false} name="Commentaires" />
              </LineChart>
            </ChartContainer>
          )}
        </GHCard>

        {/* Connection Growth Area */}
        <GHCard title="Croissance réseau" headerRight={<Tag variant="teal">Cumulatif</Tag>}>
          {connectionGrowth.isLoading ? (
            <Skeleton className="h-52" />
          ) : !connectionGrowth.data?.length ? (
            <p className="text-xs text-muted-foreground text-center py-8">Aucune donnée de connexion.</p>
          ) : (
            <ChartContainer config={chartConfigArea} className="h-52 w-full">
              <AreaChart data={connectionGrowth.data} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.15)"
                  strokeWidth={2}
                  name="Connexions"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </GHCard>
      </div>
    </motion.div>
  );
}
