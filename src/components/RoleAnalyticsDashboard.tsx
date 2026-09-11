import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useSSI } from "@/hooks/useSSI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp, Users, Target, DollarSign, Briefcase, BookOpen,
  Star, Zap, Award, BarChart3, Lightbulb, Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface RoleKPI {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  description: string;
  color: string;
}

interface RoleBenchmark {
  label: string;
  userValue: number;
  avgValue: number;
  unit?: string;
}

function useRoleAnalytics() {
  const { user } = useAuth();

  const roleData = useQuery({
    queryKey: ["user-role-analytics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).limit(1).maybeSingle();
      return role?.role ?? "startup";
    },
  });

  const coachingData = useQuery({
    queryKey: ["role-coaching-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: sessions } = await supabase.from("coaching_sessions")
        .select("status, rating")
        .or(`learner_id.eq.${user!.id},coach_id.in.(select id from coaches where user_id = '${user!.id}')`);
      const completed = (sessions ?? []).filter(s => s.status === "completed");
      const ratings = completed.filter(s => s.rating).map(s => s.rating!);
      return {
        total: sessions?.length ?? 0,
        completed: completed.length,
        avgRating: ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0",
      };
    },
  });

  const fundraisingData = useQuery({
    queryKey: ["role-fundraising", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("fundraising_rounds").select("raised_amount, target_amount, status").eq("user_id", user!.id);
      const totalRaised = (data ?? []).reduce((s, r) => s + (r.raised_amount ?? 0), 0);
      const totalTarget = (data ?? []).reduce((s, r) => s + (r.target_amount ?? 0), 0);
      return { totalRaised, totalTarget, rounds: data?.length ?? 0, activeRounds: (data ?? []).filter(r => r.status === "active").length };
    },
  });

  const dealRoomsData = useQuery({
    queryKey: ["role-deal-rooms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: owned } = await supabase.from("deal_rooms").select("id, status").eq("owner_id", user!.id);
      const { data: member } = await supabase.from("deal_room_members").select("deal_room_id").eq("user_id", user!.id);
      const activeOwned = (owned ?? []).filter(r => r.status === "active").length;
      return { ownedCount: owned?.length ?? 0, memberCount: member?.length ?? 0, activeCount: activeOwned + (member?.length ?? 0) };
    },
  });

  const servicesData = useQuery({
    queryKey: ["role-services", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_services").select("id, is_active, total_bookings").eq("user_id", user!.id);
      const activeServices = (data ?? []).filter(s => s.is_active).length;
      const totalBookings = (data ?? []).reduce((s, svc) => s + (svc.total_bookings ?? 0), 0);
      return { total: data?.length ?? 0, active: activeServices, bookings: totalBookings };
    },
  });

  const bookingsData = useQuery({
    queryKey: ["role-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("service_bookings").select("id, status").eq("seller_id", user!.id);
      const inProgress = (data ?? []).filter(b => b.status === "in_progress" || b.status === "pending").length;
      return { total: data?.length ?? 0, inProgress };
    },
  });

  return { roleData, coachingData, fundraisingData, dealRoomsData, servicesData, bookingsData };
}

function BenchmarkBar({ benchmark }: { benchmark: RoleBenchmark }) {
  const { t } = useTranslation();
  const maxVal = Math.max(benchmark.userValue, benchmark.avgValue, 1);
  const userPct = (benchmark.userValue / maxVal) * 100;
  const avgPct = (benchmark.avgValue / maxVal) * 100;
  const isAbove = benchmark.userValue >= benchmark.avgValue;

  return (
    <div className="py-2.5 border-b border-border/40 last:border-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-medium">{benchmark.label}</span>
        <span className={cn("text-xs font-bold", isAbove ? "text-primary" : "text-muted-foreground")}>
          {benchmark.userValue}{benchmark.unit ?? ""}
          <span className="text-muted-foreground font-normal"> {t("c3.roleAnalyticsDashboard.vsAvgLabel", { value: `${benchmark.avgValue}${benchmark.unit ?? ""}` })}</span>
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" style={{ width: `${avgPct}%` }} />
        <div className={cn("h-full rounded-full transition-all", isAbove ? "bg-primary" : "bg-muted-foreground/40")} style={{ width: `${userPct}%` }} />
      </div>
    </div>
  );
}

export default function RoleAnalyticsDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: ssi } = useSSI();
  const { roleData, coachingData, fundraisingData, dealRoomsData, servicesData, bookingsData } = useRoleAnalytics();

  const role = roleData.data ?? "startup";

  const roleKPIs: Record<string, RoleKPI[]> = {
    startup: [
      { icon: Users, label: t("c3.roleAnalyticsDashboard.kpis.startup.0.label"), value: stats?.connections ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.startup.0.description"), color: "text-primary" },
      { icon: DollarSign, label: t("c3.roleAnalyticsDashboard.kpis.startup.1.label"), value: fundraisingData.data?.totalRaised ? `${(fundraisingData.data.totalRaised / 1000).toFixed(0)}k€` : "0€", description: t("c3.roleAnalyticsDashboard.kpis.startup.1.description"), color: "text-ghgold" },
      { icon: Target, label: t("c3.roleAnalyticsDashboard.kpis.startup.2.label"), value: `${stats?.objectivePct ?? 0}%`, description: t("c3.roleAnalyticsDashboard.kpis.startup.2.description"), color: "text-ghblue" },
      { icon: Zap, label: t("c3.roleAnalyticsDashboard.kpis.startup.3.label"), value: ssi?.totalScore ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.startup.3.description"), color: "text-ghpurple" },
    ],
    mentor: [
      { icon: BookOpen, label: t("c3.roleAnalyticsDashboard.kpis.mentor.0.label"), value: coachingData.data?.completed ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.mentor.0.description"), color: "text-primary" },
      { icon: Star, label: t("c3.roleAnalyticsDashboard.kpis.mentor.1.label"), value: coachingData.data?.avgRating ?? "—", description: t("c3.roleAnalyticsDashboard.kpis.mentor.1.description"), color: "text-ghgold" },
      { icon: Users, label: t("c3.roleAnalyticsDashboard.kpis.mentor.2.label"), value: stats?.connections ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.mentor.2.description"), color: "text-ghblue" },
      { icon: Award, label: t("c3.roleAnalyticsDashboard.kpis.mentor.3.label"), value: stats?.totalBadges ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.mentor.3.description"), color: "text-ghorange" },
    ],
    investor: [
      { icon: DollarSign, label: t("c3.roleAnalyticsDashboard.kpis.investor.0.label"), value: dealRoomsData.data?.activeCount ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.investor.0.description"), color: "text-ghgold" },
      { icon: Briefcase, label: t("c3.roleAnalyticsDashboard.kpis.investor.1.label"), value: stats?.connections ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.investor.1.description"), color: "text-primary" },
      { icon: Target, label: t("c3.roleAnalyticsDashboard.kpis.investor.2.label"), value: fundraisingData.data?.activeRounds ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.investor.2.description"), color: "text-ghblue" },
      { icon: TrendingUp, label: t("c3.roleAnalyticsDashboard.kpis.investor.3.label"), value: stats?.totalEvents ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.investor.3.description"), color: "text-ghpurple" },
    ],
    expert: [
      { icon: Lightbulb, label: t("c3.roleAnalyticsDashboard.kpis.expert.0.label"), value: servicesData.data?.active ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.expert.0.description"), color: "text-ghgold" },
      { icon: BookOpen, label: t("c3.roleAnalyticsDashboard.kpis.expert.1.label"), value: coachingData.data?.total ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.expert.1.description"), color: "text-primary" },
      { icon: Star, label: t("c3.roleAnalyticsDashboard.kpis.expert.2.label"), value: ssi?.totalScore ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.expert.2.description"), color: "text-ghpurple" },
      { icon: Users, label: t("c3.roleAnalyticsDashboard.kpis.expert.3.label"), value: stats?.connections ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.expert.3.description"), color: "text-ghblue" },
    ],
    freelance: [
      { icon: Briefcase, label: t("c3.roleAnalyticsDashboard.kpis.freelance.0.label"), value: bookingsData.data?.inProgress ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.freelance.0.description"), color: "text-primary" },
      { icon: Star, label: t("c3.roleAnalyticsDashboard.kpis.freelance.1.label"), value: coachingData.data?.avgRating ?? "0", description: t("c3.roleAnalyticsDashboard.kpis.freelance.1.description"), color: "text-ghgold" },
      { icon: Users, label: t("c3.roleAnalyticsDashboard.kpis.freelance.2.label"), value: stats?.connections ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.freelance.2.description"), color: "text-ghblue" },
      { icon: Rocket, label: t("c3.roleAnalyticsDashboard.kpis.freelance.3.label"), value: ssi?.details?.profileViews ?? 0, description: t("c3.roleAnalyticsDashboard.kpis.freelance.3.description"), color: "text-ghpurple" },
    ],
  };

  const roleBenchmarks: Record<string, RoleBenchmark[]> = {
    startup: [
      { label: t("c3.roleAnalyticsDashboard.benchmarks.startup.0"), userValue: stats?.connections ?? 0, avgValue: 25 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.startup.1"), userValue: ssi?.totalScore ?? 0, avgValue: 45 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.startup.2"), userValue: stats?.totalPosts ?? 0, avgValue: 8 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.startup.3"), userValue: stats?.objectivePct ?? 0, avgValue: 60, unit: "%" },
    ],
    mentor: [
      { label: t("c3.roleAnalyticsDashboard.benchmarks.mentor.0"), userValue: coachingData.data?.completed ?? 0, avgValue: 12 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.mentor.1"), userValue: ssi?.totalScore ?? 0, avgValue: 55 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.mentor.2"), userValue: stats?.connections ?? 0, avgValue: 40 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.mentor.3"), userValue: stats?.totalBadges ?? 0, avgValue: 5 },
    ],
    investor: [
      { label: t("c3.roleAnalyticsDashboard.benchmarks.investor.0"), userValue: stats?.connections ?? 0, avgValue: 50 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.investor.1"), userValue: stats?.totalEvents ?? 0, avgValue: 10 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.investor.2"), userValue: ssi?.totalScore ?? 0, avgValue: 50 },
      { label: t("c3.roleAnalyticsDashboard.benchmarks.investor.3"), userValue: stats?.totalPosts ?? 0, avgValue: 5 },
    ],
  };

  const kpis = roleKPIs[role] ?? roleKPIs.startup;
  const benchmarks = roleBenchmarks[role] ?? roleBenchmarks.startup;

  const roleLabels: Record<string, string> = {
    startup: t("c3.roleAnalyticsDashboard.roles.startup"), mentor: t("c3.roleAnalyticsDashboard.roles.mentor"), investor: t("c3.roleAnalyticsDashboard.roles.investor"),
    expert: t("c3.roleAnalyticsDashboard.roles.expert"), freelance: t("c3.roleAnalyticsDashboard.roles.freelance"), incubator: t("c3.roleAnalyticsDashboard.roles.incubator"),
    student: t("c3.roleAnalyticsDashboard.roles.student"), corporate: t("c3.roleAnalyticsDashboard.roles.corporate"),
  };

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="space-y-4">
      <GHCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-sm font-bold">{t("c3.roleAnalyticsDashboard.kpisTitle", { role: roleLabels[role] ?? role })}</h3>
          </div>
          <Tag variant="green">{profile?.display_name ?? t("c3.roleAnalyticsDashboard.you")}</Tag>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map(kpi => (
            <div key={kpi.label} className="text-center p-3 bg-secondary/30 rounded-xl">
              <kpi.icon className={cn("w-5 h-5 mx-auto mb-1.5", kpi.color)} />
              <div className="font-heading text-lg font-extrabold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.description}</div>
            </div>
          ))}
        </div>
      </GHCard>

      <GHCard title={t("c3.roleAnalyticsDashboard.benchmarking")} headerRight={<Tag variant="blue">{t("c3.roleAnalyticsDashboard.vsAverage")}</Tag>}>
        <div className="space-y-1">
          {benchmarks.map(b => (
            <BenchmarkBar key={b.label} benchmark={b} />
          ))}
        </div>
      </GHCard>
    </div>
  );
}
