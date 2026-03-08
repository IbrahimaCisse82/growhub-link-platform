import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Handshake, MessageSquare, ArrowUpRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkROI {
  totalConnections: number;
  activeConnections: number;
  warmIntrosGiven: number;
  warmIntrosReceived: number;
  collaborationsStarted: number;
  messagesExchanged: number;
  avgResponseRate: number;
  topSectors: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
  connectionsByMonth: { month: string; count: number }[];
}

export default function NetworkAnalytics() {
  const { user } = useAuth();

  const { data: roi, isLoading } = useQuery({
    queryKey: ["network-roi", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<NetworkROI> => {
      const [connRes, introsGivenRes, introsRecvRes, collabRes, msgsRes, profilesRes] = await Promise.all([
        supabase.from("connections").select("id, created_at, requester_id, receiver_id, status")
          .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from("warm_intros").select("id").eq("introducer_id", user!.id),
        supabase.from("warm_intros").select("id").or(`requester_id.eq.${user!.id},target_id.eq.${user!.id}`),
        supabase.from("collaborations").select("id").or(`user_id.eq.${user!.id},partner_id.eq.${user!.id}`),
        supabase.from("messages").select("id").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        // Get connected profiles for analysis
        supabase.from("connections").select("requester_id, receiver_id")
          .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
      ]);

      const allConns = connRes.data ?? [];
      const accepted = allConns.filter(c => c.status === "accepted");
      
      // Get partner profiles
      const partnerIds = accepted.map(c => c.requester_id === user!.id ? c.receiver_id : c.requester_id);
      const { data: partnerProfiles } = await supabase.from("profiles")
        .select("sector, city").in("user_id", partnerIds.length > 0 ? partnerIds : ["none"]);

      // Sector distribution
      const sectorMap: Record<string, number> = {};
      (partnerProfiles ?? []).forEach(p => {
        if (p.sector) sectorMap[p.sector] = (sectorMap[p.sector] ?? 0) + 1;
      });
      const topSectors = Object.entries(sectorMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // City distribution
      const cityMap: Record<string, number> = {};
      (partnerProfiles ?? []).forEach(p => {
        if (p.city) cityMap[p.city] = (cityMap[p.city] ?? 0) + 1;
      });
      const topCities = Object.entries(cityMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Connections by month
      const byMonth: Record<string, number> = {};
      accepted.forEach(c => {
        const m = new Date(c.created_at).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        byMonth[m] = (byMonth[m] ?? 0) + 1;
      });
      const connectionsByMonth = Object.entries(byMonth).map(([month, count]) => ({ month, count }));

      // Active = messaged in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: recentMsgs } = await supabase.from("messages")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const activePartners = new Set<string>();
      (recentMsgs ?? []).forEach(m => {
        const partner = m.sender_id === user!.id ? m.receiver_id : m.sender_id;
        if (partnerIds.includes(partner)) activePartners.add(partner);
      });

      return {
        totalConnections: accepted.length,
        activeConnections: activePartners.size,
        warmIntrosGiven: introsGivenRes.data?.length ?? 0,
        warmIntrosReceived: introsRecvRes.data?.length ?? 0,
        collaborationsStarted: collabRes.data?.length ?? 0,
        messagesExchanged: msgsRes.data?.length ?? 0,
        avgResponseRate: accepted.length > 0 ? Math.round((activePartners.size / accepted.length) * 100) : 0,
        topSectors,
        topCities,
        connectionsByMonth,
      };
    },
    staleTime: 120_000,
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!roi) return null;

  const roiMetrics = [
    { icon: Users, label: "Connexions actives", value: `${roi.activeConnections}/${roi.totalConnections}`, sub: `${roi.avgResponseRate}% taux d'engagement`, color: "text-primary" },
    { icon: Handshake, label: "Introductions", value: roi.warmIntrosGiven + roi.warmIntrosReceived, sub: `${roi.warmIntrosGiven} données · ${roi.warmIntrosReceived} reçues`, color: "text-ghorange" },
    { icon: Target, label: "Collaborations", value: roi.collaborationsStarted, sub: "projets démarrés", color: "text-ghpurple" },
    { icon: MessageSquare, label: "Messages", value: roi.messagesExchanged, sub: "échangés au total", color: "text-ghblue" },
  ];

  return (
    <div className="space-y-4">
      {/* ROI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roiMetrics.map(m => (
          <GHCard key={m.label} className="py-4">
            <m.icon className={cn("w-5 h-5 mb-2", m.color)} />
            <div className="font-heading text-xl font-extrabold">{m.value}</div>
            <div className="text-xs font-medium text-foreground/80">{m.label}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{m.sub}</div>
          </GHCard>
        ))}
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GHCard title="Réseau par secteur" headerRight={<Tag variant="blue">Distribution</Tag>}>
          {roi.topSectors.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Pas assez de données</p>
          ) : (
            <div className="space-y-2.5">
              {roi.topSectors.map(s => {
                const pct = roi.totalConnections > 0 ? Math.round((s.count / roi.totalConnections) * 100) : 0;
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GHCard>

        <GHCard title="Réseau par ville" headerRight={<Tag variant="teal">Géographie</Tag>}>
          {roi.topCities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Pas assez de données</p>
          ) : (
            <div className="space-y-2.5">
              {roi.topCities.map(c => {
                const pct = roi.totalConnections > 0 ? Math.round((c.count / roi.totalConnections) * 100) : 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-ghblue rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GHCard>
      </div>
    </div>
  );
}
