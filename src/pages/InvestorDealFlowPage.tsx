import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import { TrendingUp, Eye, FileText, Users, Filter, ArrowUpRight } from "lucide-react";

const stageColors: Record<string, string> = {
  "Pre-Seed": "bg-blue-500/10 text-blue-600",
  "Seed": "bg-green-500/10 text-green-600",
  "Serie A": "bg-amber-500/10 text-amber-600",
  "Serie B": "bg-purple-500/10 text-purple-600",
  "Serie C+": "bg-red-500/10 text-red-600",
};

function InvestorContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState("all");
  const [tab, setTab] = useState<"pipeline" | "rooms" | "pitchdecks">("pipeline");

  // Deal rooms (owned + member)
  const { data: ownedRooms = [] } = useQuery({
    queryKey: ["investor-deal-rooms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("deal_rooms").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: memberRooms = [] } = useQuery({
    queryKey: ["investor-member-rooms", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("deal_room_members").select("*, deal_rooms(*)").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  // Public pitch decks
  const { data: pitchDecks = [] } = useQuery({
    queryKey: ["investor-pitch-decks"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pitch_decks").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  // Pitch deck author profiles
  const deckAuthorIds = [...new Set(pitchDecks.map(d => d.user_id))];
  const { data: deckProfiles = {} } = useQuery({
    queryKey: ["investor-deck-profiles", deckAuthorIds],
    enabled: deckAuthorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, company_name, sector, company_stage").in("user_id", deckAuthorIds);
      return Object.fromEntries((data ?? []).map(p => [p.user_id, p]));
    },
  });

  // Connections (startups followed)
  const { data: connections = [] } = useQuery({
    queryKey: ["investor-connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("connections").select("*").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted");
      return data ?? [];
    },
  });

  const allRooms = [...ownedRooms, ...memberRooms.map((m: any) => m.deal_rooms).filter(Boolean)];
  const activeRooms = ownedRooms.filter(r => r.status === "active");

  const filteredDecks = stageFilter === "all" ? pitchDecks : pitchDecks.filter(d => {
    const profile = (deckProfiles as any)[d.user_id];
    return profile?.company_stage === stageFilter;
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="💎" value={String(allRooms.length)} label="Deal Rooms" badge="Total" badgeType="up" />
        <MetricCard icon="📊" value={String(pitchDecks.length)} label="Pitch Decks" badge="Publics" badgeType="neutral" />
        <MetricCard icon="👥" value={String(connections.length)} label="Startups suivies" badge="Réseau" badgeType="up" />
        <MetricCard icon="🔒" value={String(activeRooms.length)} label="Rooms actives" badge="En cours" badgeType={activeRooms.length > 0 ? "up" : "neutral"} />
      </div>

      <div className="flex gap-1.5 mb-5">
        {([
          { key: "pipeline" as const, label: "💎 Deal Flow", count: allRooms.length },
          { key: "pitchdecks" as const, label: "📊 Pitch Decks", count: pitchDecks.length },
          { key: "rooms" as const, label: "🔒 Mes Rooms", count: ownedRooms.length },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground/50 hover:border-primary/30"
            }`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Pipeline */}
      {tab === "pipeline" && (
        <div className="space-y-3">
          {allRooms.length === 0 ? (
            <GHCard className="text-center py-10">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Votre pipeline est vide</p>
              <p className="text-xs text-muted-foreground mb-4">Créez une Deal Room ou parcourez les Pitch Decks pour alimenter votre pipeline.</p>
              <button onClick={() => navigate("/deal-room")} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold">
                Créer une Deal Room
              </button>
            </GHCard>
          ) : allRooms.map((room: any) => (
            <GHCard key={room.id} className="flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate("/deal-room")}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{room.name}</div>
                <div className="text-[11px] text-muted-foreground">{room.description || "Aucune description"}</div>
              </div>
              <Tag variant={room.status === "active" ? "green" : "default"}>{room.status === "active" ? "Active" : "Archivée"}</Tag>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </GHCard>
          ))}
        </div>
      )}

      {/* Pitch Decks */}
      {tab === "pitchdecks" && (
        <>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {["all", "Pre-Seed", "Seed", "Serie A", "Serie B", "Serie C+"].map(s => (
              <button key={s} onClick={() => setStageFilter(s)}
                className={`h-[30px] px-3 rounded-lg text-[11px] font-bold border transition-colors ${
                  stageFilter === s ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50"
                }`}>
                {s === "all" ? "Tous" : s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDecks.length === 0 ? (
              <GHCard className="col-span-full text-center py-8"><p className="text-sm text-muted-foreground">Aucun pitch deck trouvé.</p></GHCard>
            ) : filteredDecks.map(deck => {
              const author = (deckProfiles as any)[deck.user_id];
              return (
                <GHCard key={deck.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate("/pitchdeck")}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-heading text-xs font-extrabold text-primary flex-shrink-0">
                      {(author?.display_name ?? "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-heading text-sm font-bold">{deck.title}</div>
                      <div className="text-[11px] text-muted-foreground">{author?.display_name ?? "Startup"} {author?.company_name ? `· ${author.company_name}` : ""}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {author?.sector && <Tag variant="green">{author.sector}</Tag>}
                    {author?.company_stage && <Tag variant="default">{author.company_stage}</Tag>}
                    <Tag>{deck.view_count ?? 0} vues</Tag>
                  </div>
                </GHCard>
              );
            })}
          </div>
        </>
      )}

      {/* My Rooms */}
      {tab === "rooms" && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <button onClick={() => navigate("/deal-room")} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold">
              Gérer mes Deal Rooms →
            </button>
          </div>
          {ownedRooms.length === 0 ? (
            <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune Deal Room créée.</p></GHCard>
          ) : ownedRooms.map(room => (
            <GHCard key={room.id} className="flex items-center gap-4 cursor-pointer hover:border-primary/30" onClick={() => navigate("/deal-room")}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{room.name}</div>
                <div className="text-[11px] text-muted-foreground">Code: {room.access_code}</div>
              </div>
              <Tag variant={room.status === "active" ? "green" : "default"}>{room.status === "active" ? "Active" : "Archivée"}</Tag>
            </GHCard>
          ))}
        </div>
      )}
    </>
  );
}

export default function InvestorDealFlowPage() {
  usePageMeta({ title: "Deal Flow", description: "Gérez votre pipeline d'investissement et explorez les pitch decks." });

  return (
    <RoleGuard allowedRoles={["investor", "corporate"]} fallbackMessage="Le Deal Flow est réservé aux profils Investisseur et Corporate.">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <TrendingUp className="w-3 h-3" /> Deal Flow
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Votre <span className="text-primary">pipeline</span> d'investissement</h1>
            <p className="text-sm text-muted-foreground max-w-lg">Explorez les pitch decks, gérez vos deal rooms et suivez vos opportunités.</p>
          </div>
        </div>
        <InvestorContent />
      </motion.div>
    </RoleGuard>
  );
}
