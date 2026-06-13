import { motion } from "framer-motion";
import { GHCard, MetricCard, SectionHeader, Tag } from "@/components/ui-custom";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, TrendingUp, Zap } from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function Analytics() {
  usePageMeta({ title: "Analytics produit", description: "DAU/WAU/MAU, rétention, fonctionnalités plébiscitées." });
  const { user } = useAuth();

  const usage = useQuery({
    queryKey: ["product-analytics-usage"],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [posts, conns, regs, sessions, signups] = await Promise.all([
        supabase.from("posts").select("author_id, created_at").gte("created_at", since),
        supabase.from("connections").select("requester_id, receiver_id, created_at").gte("created_at", since),
        supabase.from("event_registrations").select("user_id, created_at").gte("created_at", since),
        supabase.from("coaching_sessions").select("learner_id, created_at").gte("created_at", since),
        supabase.from("profiles").select("user_id, created_at").gte("created_at", since),
      ]);

      // Build per-day active users set
      const dayUsers: Record<string, Set<string>> = {};
      const addEvent = (date: string, userIds: (string | null | undefined)[]) => {
        const k = date.slice(0, 10);
        if (!dayUsers[k]) dayUsers[k] = new Set();
        userIds.forEach(id => id && dayUsers[k].add(id));
      };
      (posts.data ?? []).forEach((p: any) => addEvent(p.created_at, [p.author_id]));
      (conns.data ?? []).forEach((c: any) => addEvent(c.created_at, [c.requester_id, c.receiver_id]));
      (regs.data ?? []).forEach((r: any) => addEvent(r.created_at, [r.user_id]));
      (sessions.data ?? []).forEach((s: any) => addEvent(s.created_at, [s.learner_id]));

      const days: { day: string; dau: number; signups: number }[] = [];
      const signupsByDay: Record<string, number> = {};
      (signups.data ?? []).forEach((s: any) => {
        const k = s.created_at.slice(0, 10);
        signupsByDay[k] = (signupsByDay[k] ?? 0) + 1;
      });

      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const k = dayKey(d);
        days.push({
          day: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          dau: dayUsers[k]?.size ?? 0,
          signups: signupsByDay[k] ?? 0,
        });
      }

      // WAU = unique users last 7d, MAU = unique last 30d
      const wauSet = new Set<string>();
      const mauSet = new Set<string>();
      const now = Date.now();
      Object.entries(dayUsers).forEach(([k, set]) => {
        const ageDays = (now - new Date(k).getTime()) / 86400000;
        if (ageDays <= 7) set.forEach(u => wauSet.add(u));
        if (ageDays <= 30) set.forEach(u => mauSet.add(u));
      });

      const dauToday = days[days.length - 1]?.dau ?? 0;
      const totalSignups30 = (signups.data ?? []).length;

      return {
        days,
        dau: dauToday,
        wau: wauSet.size,
        mau: mauSet.size,
        signups30: totalSignups30,
        stickiness: mauSet.size ? Math.round((dauToday / mauSet.size) * 100) : 0,
      };
    },
  });

  const tools = useQuery({
    queryKey: ["product-analytics-tools"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_activated_tools").select("tool_key");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((t: any) => { counts[t.tool_key] = (counts[t.tool_key] ?? 0) + 1; });
      return Object.entries(counts)
        .map(([tool, count]) => ({ tool, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  const stats = usage.data;
  const usageConfig: ChartConfig = {
    dau: { label: "Utilisateurs actifs", color: "hsl(var(--primary))" },
    signups: { label: "Inscriptions", color: "hsl(var(--primary) / 0.5)" },
  };
  const toolConfig: ChartConfig = { count: { label: "Activations", color: "hsl(var(--primary))" } };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics produit
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Engagement & <span className="text-primary">rétention</span>
          </h1>
          <p className="text-foreground/60 text-sm max-w-[520px]">
            Mesurez l'usage réel de la plateforme : utilisateurs actifs, inscriptions, outils plébiscités.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {usage.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <MetricCard icon="⚡" value={String(stats?.dau ?? 0)} label="DAU" badge="Aujourd'hui" badgeType="up" />
            <MetricCard icon="📅" value={String(stats?.wau ?? 0)} label="WAU" badge="7 jours" badgeType="up" />
            <MetricCard icon="🗓️" value={String(stats?.mau ?? 0)} label="MAU" badge="30 jours" badgeType="up" />
            <MetricCard icon="🪝" value={`${stats?.stickiness ?? 0}%`} label="Stickiness" badge="DAU/MAU" badgeType={(stats?.stickiness ?? 0) >= 20 ? "up" : "neutral"} />
          </>
        )}
      </div>

      <SectionHeader title="Activité quotidienne (30 jours)" />
      <GHCard className="mb-5" headerRight={<Tag variant="green">Temps réel</Tag>}>
        {usage.isLoading ? <Skeleton className="h-60" /> : (
          <ChartContainer config={usageConfig} className="h-60 w-full">
            <AreaChart data={stats?.days ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="dau" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.18)" strokeWidth={2} name="DAU" />
              <Area type="monotone" dataKey="signups" stroke="hsl(var(--primary) / 0.6)" fill="hsl(var(--primary) / 0.08)" strokeWidth={2} name="Inscriptions" />
            </AreaChart>
          </ChartContainer>
        )}
      </GHCard>

      <SectionHeader title="Outils les plus activés" />
      <GHCard headerRight={<Tag variant="blue">Top 10</Tag>}>
        {tools.isLoading ? <Skeleton className="h-60" /> : !tools.data?.length ? (
          <p className="text-xs text-muted-foreground text-center py-8">Aucune activation enregistrée.</p>
        ) : (
          <ChartContainer config={toolConfig} className="h-60 w-full">
            <BarChart data={tools.data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="tool" tick={{ fontSize: 10 }} width={110} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Activations" />
            </BarChart>
          </ChartContainer>
        )}
      </GHCard>
    </motion.div>
  );
}

export default function ProductAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} fallbackMessage="Analytics produit réservé aux administrateurs.">
      <Analytics />
    </RoleGuard>
  );
}
