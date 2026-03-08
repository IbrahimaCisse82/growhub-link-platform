import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GHCard, Tag, StatRow } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowRight, Handshake, Users, MessageSquare, Zap } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

const funnelConfig: ChartConfig = {
  value: { label: "Total", color: "hsl(var(--primary))" },
};

const roiConfig: ChartConfig = {
  connections: { label: "Connexions", color: "hsl(var(--primary))" },
  intros: { label: "Intros", color: "hsl(var(--blue))" },
  collabs: { label: "Collabs", color: "hsl(var(--orange))" },
};

interface ROIData {
  totalConnections: number;
  acceptedRate: number;
  warmIntrosSent: number;
  warmIntrosAccepted: number;
  introConversionRate: number;
  collaborationsStarted: number;
  coachingSessions: number;
  messagesExchanged: number;
  networkingScore: number;
  funnel: { stage: string; value: number; color: string }[];
  monthlyActivity: { month: string; connections: number; intros: number; collabs: number }[];
}

export default function NetworkingROI() {
  const { user } = useAuth();

  const { data: roi, isLoading } = useQuery({
    queryKey: ["networking-roi", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ROIData> => {
      const [connsRes, warmRes, collabRes, coachRes, msgsRes] = await Promise.all([
        supabase.from("connections").select("status, created_at").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from("warm_intros").select("status, created_at").or(`requester_id.eq.${user!.id},introducer_id.eq.${user!.id}`),
        supabase.from("collaborations").select("created_at").or(`user_id.eq.${user!.id},partner_id.eq.${user!.id}`),
        supabase.from("coaching_sessions").select("created_at, status").eq("learner_id", user!.id).eq("status", "completed"),
        supabase.from("messages").select("id", { count: "exact", head: true }).or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
      ]);

      const conns = connsRes.data ?? [];
      const accepted = conns.filter(c => c.status === "accepted");
      const warm = warmRes.data ?? [];
      const warmAccepted = warm.filter(w => w.status === "accepted");
      const collabs = collabRes.data ?? [];
      const sessions = coachRes.data ?? [];

      const totalConnections = conns.length;
      const acceptedRate = totalConnections > 0 ? Math.round((accepted.length / totalConnections) * 100) : 0;
      const warmIntrosSent = warm.length;
      const warmIntrosAccepted = warmAccepted.length;
      const introConversionRate = warmIntrosSent > 0 ? Math.round((warmIntrosAccepted / warmIntrosSent) * 100) : 0;

      // Networking score: weighted sum
      const networkingScore = Math.min(100, Math.round(
        (Math.min(accepted.length, 50) / 50) * 30 +
        (Math.min(warmIntrosAccepted, 10) / 10) * 25 +
        (Math.min(collabs.length, 10) / 10) * 25 +
        (Math.min(sessions.length, 10) / 10) * 20
      ));

      // Funnel
      const funnel = [
        { stage: "Demandes envoyées", value: totalConnections, color: "hsl(var(--primary))" },
        { stage: "Connexions acceptées", value: accepted.length, color: "hsl(var(--blue))" },
        { stage: "Intros chaleureuses", value: warmIntrosSent, color: "hsl(var(--orange))" },
        { stage: "Collaborations", value: collabs.length, color: "hsl(var(--purple))" },
      ];

      // Monthly activity (last 6 months)
      const months: Record<string, { connections: number; intros: number; collabs: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("fr-FR", { month: "short" });
        months[key] = { connections: 0, intros: 0, collabs: 0 };
      }
      accepted.forEach(c => {
        const key = new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short" });
        if (months[key]) months[key].connections++;
      });
      warm.forEach(w => {
        const key = new Date(w.created_at).toLocaleDateString("fr-FR", { month: "short" });
        if (months[key]) months[key].intros++;
      });
      collabs.forEach(c => {
        const key = new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short" });
        if (months[key]) months[key].collabs++;
      });

      return {
        totalConnections,
        acceptedRate,
        warmIntrosSent,
        warmIntrosAccepted,
        introConversionRate,
        collaborationsStarted: collabs.length,
        coachingSessions: sessions.length,
        messagesExchanged: msgsRes.count ?? 0,
        networkingScore,
        funnel,
        monthlyActivity: Object.entries(months).map(([month, v]) => ({ month, ...v })),
      };
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!roi) return null;

  return (
    <div className="space-y-4">
      {/* ROI Score + KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <GHCard className="flex flex-col items-center justify-center py-5">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-secondary" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="stroke-primary" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={`${roi.networkingScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-xl font-extrabold text-primary">{roi.networkingScore}</span>
              <span className="text-[9px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-xs font-bold text-muted-foreground">ROI Score</div>
        </GHCard>

        <GHCard>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Connexions</span>
          </div>
          <StatRow label="Total demandes" value={String(roi.totalConnections)} />
          <StatRow label="Taux d'acceptation" value={`${roi.acceptedRate}%`} valueColor={roi.acceptedRate > 50 ? "text-primary" : "text-ghorange"} />
        </GHCard>

        <GHCard>
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-4 h-4 text-ghblue" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Intros</span>
          </div>
          <StatRow label="Intros envoyées" value={String(roi.warmIntrosSent)} />
          <StatRow label="Taux conversion" value={`${roi.introConversionRate}%`} valueColor={roi.introConversionRate > 40 ? "text-primary" : "text-ghorange"} />
        </GHCard>

        <GHCard>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-ghorange" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Résultats</span>
          </div>
          <StatRow label="Collaborations" value={String(roi.collaborationsStarted)} />
          <StatRow label="Messages échangés" value={String(roi.messagesExchanged)} />
        </GHCard>
      </div>

      {/* Funnel + Monthly Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GHCard title="Funnel de conversion" headerRight={<Tag variant="green">Entonnoir</Tag>}>
          <div className="space-y-3">
            {roi.funnel.map((stage, i) => {
              const maxVal = Math.max(...roi.funnel.map(f => f.value), 1);
              const pct = Math.round((stage.value / maxVal) * 100);
              return (
                <div key={stage.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <span className="font-bold font-heading">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  {i < roi.funnel.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GHCard>

        <GHCard title="Activité mensuelle" headerRight={<Tag variant="blue">6 mois</Tag>}>
          <ChartContainer config={roiConfig} className="h-52 w-full">
            <BarChart data={roi.monthlyActivity} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="connections" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Connexions" />
              <Bar dataKey="intros" fill="hsl(var(--blue))" radius={[4, 4, 0, 0]} name="Intros" />
              <Bar dataKey="collabs" fill="hsl(var(--orange))" radius={[4, 4, 0, 0]} name="Collabs" />
            </BarChart>
          </ChartContainer>
        </GHCard>
      </div>
    </div>
  );
}
