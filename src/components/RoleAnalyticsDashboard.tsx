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
          <span className="text-muted-foreground font-normal"> vs {benchmark.avgValue}{benchmark.unit ?? ""} moy.</span>
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
  const { profile } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: ssi } = useSSI();
  const { roleData, coachingData, fundraisingData, dealRoomsData, servicesData, bookingsData } = useRoleAnalytics();

  const role = roleData.data ?? "startup";

  const roleKPIs: Record<string, RoleKPI[]> = {
    startup: [
      { icon: Users, label: "Réseau", value: stats?.connections ?? 0, description: "Connexions actives", color: "text-primary" },
      { icon: DollarSign, label: "Levée", value: fundraisingData.data?.totalRaised ? `${(fundraisingData.data.totalRaised / 1000).toFixed(0)}k€` : "0€", description: "Montant levé", color: "text-ghgold" },
      { icon: Target, label: "Objectifs", value: `${stats?.objectivePct ?? 0}%`, description: "Taux de complétion", color: "text-ghblue" },
      { icon: Zap, label: "SSI", value: ssi?.totalScore ?? 0, description: "Social Selling Index", color: "text-ghpurple" },
    ],
    mentor: [
      { icon: BookOpen, label: "Sessions", value: coachingData.data?.completed ?? 0, description: "Sessions réalisées", color: "text-primary" },
      { icon: Star, label: "Note", value: coachingData.data?.avgRating ?? "—", description: "Note moyenne", color: "text-ghgold" },
      { icon: Users, label: "Mentorés", value: stats?.connections ?? 0, description: "Connexions", color: "text-ghblue" },
      { icon: Award, label: "Badges", value: stats?.totalBadges ?? 0, description: "Obtenus", color: "text-ghorange" },
    ],
    investor: [
      { icon: DollarSign, label: "Deal rooms", value: dealRoomsData.data?.activeCount ?? 0, description: "Rooms actives", color: "text-ghgold" },
      { icon: Briefcase, label: "Portfolio", value: stats?.connections ?? 0, description: "Startups suivies", color: "text-primary" },
      { icon: Target, label: "Pipeline", value: fundraisingData.data?.activeRounds ?? 0, description: "Rounds actifs", color: "text-ghblue" },
      { icon: TrendingUp, label: "Événements", value: stats?.totalEvents ?? 0, description: "Participations", color: "text-ghpurple" },
    ],
    expert: [
      { icon: Lightbulb, label: "Services", value: servicesData.data?.active ?? 0, description: "Sur la marketplace", color: "text-ghgold" },
      { icon: BookOpen, label: "Sessions", value: coachingData.data?.total ?? 0, description: "Consulting", color: "text-primary" },
      { icon: Star, label: "Réputation", value: ssi?.totalScore ?? 0, description: "Score SSI", color: "text-ghpurple" },
      { icon: Users, label: "Réseau", value: stats?.connections ?? 0, description: "Connexions", color: "text-ghblue" },
    ],
    freelance: [
      { icon: Briefcase, label: "Missions", value: bookingsData.data?.inProgress ?? 0, description: "En cours", color: "text-primary" },
      { icon: Star, label: "Note", value: coachingData.data?.avgRating ?? "0", description: "Clients", color: "text-ghgold" },
      { icon: Users, label: "Réseau", value: stats?.connections ?? 0, description: "Connexions", color: "text-ghblue" },
      { icon: Rocket, label: "Visibilité", value: ssi?.details?.profileViews ?? 0, description: "Vues profil", color: "text-ghpurple" },
    ],
  };

  const roleBenchmarks: Record<string, RoleBenchmark[]> = {
    startup: [
      { label: "Connexions", userValue: stats?.connections ?? 0, avgValue: 25 },
      { label: "Score SSI", userValue: ssi?.totalScore ?? 0, avgValue: 45 },
      { label: "Posts publiés", userValue: stats?.totalPosts ?? 0, avgValue: 8 },
      { label: "Objectifs (%)", userValue: stats?.objectivePct ?? 0, avgValue: 60, unit: "%" },
    ],
    mentor: [
      { label: "Sessions données", userValue: coachingData.data?.completed ?? 0, avgValue: 12 },
      { label: "Score SSI", userValue: ssi?.totalScore ?? 0, avgValue: 55 },
      { label: "Connexions", userValue: stats?.connections ?? 0, avgValue: 40 },
      { label: "Badges", userValue: stats?.totalBadges ?? 0, avgValue: 5 },
    ],
    investor: [
      { label: "Connexions", userValue: stats?.connections ?? 0, avgValue: 50 },
      { label: "Événements", userValue: stats?.totalEvents ?? 0, avgValue: 10 },
      { label: "Score SSI", userValue: ssi?.totalScore ?? 0, avgValue: 50 },
      { label: "Posts", userValue: stats?.totalPosts ?? 0, avgValue: 5 },
    ],
  };

  const kpis = roleKPIs[role] ?? roleKPIs.startup;
  const benchmarks = roleBenchmarks[role] ?? roleBenchmarks.startup;

  const roleLabels: Record<string, string> = {
    startup: "🚀 Startup", mentor: "🎓 Mentor", investor: "💰 Investisseur",
    expert: "🧠 Expert", freelance: "💼 Freelance", incubator: "🏢 Incubateur",
    student: "🎓 Étudiant", corporate: "🏛️ Corporate",
  };

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="space-y-4">
      <GHCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-heading text-sm font-bold">KPIs — {roleLabels[role] ?? role}</h3>
          </div>
          <Tag variant="green">{profile?.display_name ?? "Vous"}</Tag>
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

      <GHCard title="Benchmarking" headerRight={<Tag variant="blue">vs Moyenne plateforme</Tag>}>
        <div className="space-y-1">
          {benchmarks.map(b => (
            <BenchmarkBar key={b.label} benchmark={b} />
          ))}
        </div>
      </GHCard>
    </div>
  );
}
