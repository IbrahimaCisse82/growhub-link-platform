import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useSSI } from "@/hooks/useSSI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, Users, Target, DollarSign, Handshake, Calendar, ArrowUpRight, Zap, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import PredictiveAnalytics from "@/components/PredictiveAnalytics";

const COLORS = ["hsl(var(--primary))", "hsl(var(--blue, 220 90% 56%))", "hsl(var(--green, 142 76% 36%))", "hsl(var(--orange, 24 95% 53%))"];

const areaConfig: ChartConfig = {
  score: { label: "SSI Score", color: "hsl(var(--primary))" },
  connections: { label: "Connexions", color: "hsl(var(--blue, 220 90% 56%))" },
};

export default function ROIDashboardPage() {
  const { t } = useTranslation();
  usePageMeta({ title: "ROI Dashboard", description: t("roi.description") });
  const { user, profile } = useAuth();
  const { data: stats } = useDashboardStats();
  const { data: ssi } = useSSI();
  const [period, setPeriod] = useState<"7d"|"30d"|"90d">("30d");

  const { data: conversions } = useQuery({
    queryKey: ["roi-conversions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [conns, intros, collabs, sessions, msgs] = await Promise.all([
        supabase.from("connections").select("status, created_at").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from("warm_intros").select("status, created_at").or(`requester_id.eq.${user!.id},introducer_id.eq.${user!.id}`),
        supabase.from("collaborations").select("created_at").or(`user_id.eq.${user!.id},partner_id.eq.${user!.id}`),
        supabase.from("coaching_sessions").select("status").eq("learner_id", user!.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
      ]);

      const allConns = conns.data ?? [];
      const accepted = allConns.filter(c => c.status === "accepted").length;
      const pending = allConns.filter(c => c.status === "pending").length;
      const allIntros = intros.data ?? [];
      const introAccepted = allIntros.filter(i => i.status === "accepted").length;
      const collabCount = collabs.data?.length ?? 0;
      const completedSessions = (sessions.data ?? []).filter(s => s.status === "completed").length;

      // Attribution funnel
      const funnel = [
        { stage: t("roi.stageProfileViewed"), value: profile?.profile_views ?? 0 },
        { stage: t("roi.stageConnections"), value: allConns.length },
        { stage: t("roi.stageAccepted"), value: accepted },
        { stage: t("roi.stageMessages"), value: msgs.count ?? 0 },
        { stage: t("roi.stageIntros"), value: allIntros.length },
        { stage: t("roi.stageCollaborations"), value: collabCount },
      ];

      // Simulated weekly trend
      const trend = Array.from({ length: 8 }, (_, i) => ({
        week: `S${i + 1}`,
        score: Math.max(0, (ssi?.totalScore ?? 20) - (7 - i) * 3 + Math.floor(Math.random() * 4)),
        connections: Math.max(0, accepted - (7 - i) * 2 + Math.floor(Math.random() * 3)),
      }));

      return {
        totalConns: allConns.length,
        accepted,
        pending,
        acceptRate: allConns.length > 0 ? Math.round((accepted / allConns.length) * 100) : 0,
        introsSent: allIntros.length,
        introsAccepted: introAccepted,
        introRate: allIntros.length > 0 ? Math.round((introAccepted / allIntros.length) * 100) : 0,
        collabs: collabCount,
        sessions: completedSessions,
        messages: msgs.count ?? 0,
        funnel,
        trend,
      };
    },
  });

  const roiScore = conversions ? Math.min(100, Math.round(
    (conversions.acceptRate * 0.3) + (conversions.introRate * 0.25) + (Math.min(conversions.collabs, 10) * 3) + (Math.min(conversions.sessions, 10) * 1.5)
  )) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5"><TrendingUp className="w-3 h-3" /> {t("roi.badge")}</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("roi.title")} <span className="text-primary">{t("roi.titleHighlight")}</span></h1>
          <p className="text-sm text-muted-foreground max-w-lg">{t("roi.description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📊" value={`${roiScore}%`} label={t("roi.roiScore")} badge={t("roi.global")} badgeType={roiScore > 50 ? "up" : "neutral"} />
        <MetricCard icon="✅" value={`${conversions?.acceptRate ?? 0}%`} label={t("roi.acceptanceRate")} badge={t("roi.connections")} badgeType="up" />
        <MetricCard icon="🤝" value={`${conversions?.introRate ?? 0}%`} label={t("roi.introConversion")} badge={t("roi.warmIntros")} badgeType="up" />
        <MetricCard icon="💼" value={String(conversions?.collabs ?? 0)} label={t("roi.collaborations")} badge={t("roi.started")} badgeType="up" />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-5">
        {(["7d", "30d", "90d"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {p === "7d" ? t("roi.period7d") : p === "30d" ? t("roi.period30d") : t("roi.period90d")}
          </button>
        ))}
      </div>

      {/* Conversion Funnel */}
      <GHCard className="mb-5">
        <h2 className="font-heading text-sm font-bold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> {t("roi.funnel")}</h2>
        <div className="space-y-3">
          {conversions?.funnel.map((step, i) => {
            const maxVal = Math.max(...(conversions?.funnel.map(f => f.value) ?? [1]));
            const pct = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
            return (
              <div key={step.stage} className="flex items-center gap-3">
                <div className="w-28 text-xs font-medium text-right">{step.stage}</div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-lg flex items-center justify-end pr-2">
                      <span className="text-[10px] font-bold text-primary-foreground">{step.value}</span>
                    </motion.div>
                  </div>
                </div>
                {i > 0 && (
                  <div className="w-12 text-[10px] text-muted-foreground">
                    {conversions.funnel[i - 1].value > 0 ? `${Math.round((step.value / conversions.funnel[i - 1].value) * 100)}%` : "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GHCard>

      {/* Trend chart */}
      <GHCard className="mb-5">
        <h2 className="font-heading text-sm font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> {t("roi.evolution")}</h2>
        <ChartContainer config={areaConfig} className="h-[200px] w-full">
          <AreaChart data={conversions?.trend ?? []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" className="text-[10px]" />
            <YAxis className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
            <Area type="monotone" dataKey="connections" stroke="hsl(var(--blue, 220 90% 56%))" fill="hsl(var(--blue, 220 90% 56%))" fillOpacity={0.1} />
          </AreaChart>
        </ChartContainer>
      </GHCard>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users, label: t("roi.totalConnections"), value: conversions?.totalConns ?? 0, sub: t("roi.accepted", { count: conversions?.accepted ?? 0 }) },
          { icon: Handshake, label: t("roi.warmIntrosLabel"), value: conversions?.introsSent ?? 0, sub: t("roi.accepted", { count: conversions?.introsAccepted ?? 0 }) },
          { icon: DollarSign, label: t("roi.collaborationsLabel"), value: conversions?.collabs ?? 0, sub: t("roi.started") },
          { icon: Calendar, label: t("roi.coachingSessions"), value: conversions?.sessions ?? 0, sub: t("roi.completedLabel") },
          { icon: Zap, label: t("roi.messages"), value: conversions?.messages ?? 0, sub: t("roi.exchanged") },
          { icon: ArrowUpRight, label: t("roi.profileViews"), value: profile?.profile_views ?? 0, sub: t("roi.total") },
        ].map(m => (
          <GHCard key={m.label} className="text-center">
            <m.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-xl font-heading font-extrabold">{m.value}</div>
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
            <div className="text-[9px] text-muted-foreground/60 mt-0.5">{m.sub}</div>
          </GHCard>
        ))}
      </div>

      {/* Predictive Analytics */}
      <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> {t("roi.aiPredictions")}</h2>
      <PredictiveAnalytics />
    </motion.div>
  );
}
