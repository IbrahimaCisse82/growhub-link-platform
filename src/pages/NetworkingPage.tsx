import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles, useConnections, usePendingRequests, useSendConnection, useRespondConnection } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface NetworkingPageProps {
  onNavigate: (page: string) => void;
}

const gradients = [
  "from-[#200a30] to-[#A064FF]",
  "from-[#1a1a30] to-[#6060D0]",
  "from-[#1a3a10] to-[#5CBF00]",
  "from-[#301a08] to-[#D06020]",
  "from-[#0a1a30] to-[#204080]",
  "from-[#1a300a] to-[#60A020]",
  "from-[#200a30] to-[#8040C0]",
  "from-[#301a20] to-[#C04060]",
];

export default function NetworkingPage({ onNavigate }: NetworkingPageProps) {
  const { user } = useAuth();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: connections } = useConnections();
  const { data: pendingRequests } = usePendingRequests();
  const sendConnection = useSendConnection();
  const respondConnection = useRespondConnection();
  const [activeTab, setActiveTab] = useState<"suggestions" | "connections" | "pending">("suggestions");
  const [searchTerm, setSearchTerm] = useState("");

  const acceptedConnections = connections?.filter(c => c.status === "accepted") ?? [];
  const pendingCount = pendingRequests?.length ?? 0;

  const handleConnect = (receiverId: string) => {
    sendConnection.mutate({ receiverId }, {
      onSuccess: () => toast.success("Demande envoyée !"),
      onError: () => toast.error("Erreur lors de l'envoi"),
    });
  };

  const handleRespond = (connectionId: string, status: "accepted" | "rejected", requesterId: string) => {
    respondConnection.mutate({ connectionId, status, requesterId }, {
      onSuccess: () => toast.success(status === "accepted" ? "Connexion acceptée !" : "Demande ignorée"),
    });
  };

  const connectedUserIds = new Set(
    connections?.map(c => c.requester_id === user?.id ? c.receiver_id : c.requester_id) ?? []
  );

  const suggestions = (profiles?.filter(p => !connectedUserIds.has(p.user_id)) ?? [])
    .filter(p => !searchTerm || p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sector ?? "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Networking — Mise en relation intelligente
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Développez votre <span className="text-primary">réseau</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Connexions qualifiées selon votre profil, secteur et objectifs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🤝" value={String(acceptedConnections.length)} label="Connexions actives" badge="Réseau" badgeType="up" />
        <MetricCard icon="⏳" value={String(pendingCount)} label="Demandes reçues" badge="En attente" badgeType={pendingCount > 0 ? "up" : "neutral"} />
        <MetricCard icon="👥" value={String(suggestions.length)} label="Suggestions" badge="Disponibles" badgeType="neutral" />
        <MetricCard icon="📊" value={String(user ? profiles?.length ?? 0 : 0)} label="Membres actifs" badge="Communauté" badgeType="neutral" />
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: "suggestions", label: `Suggestions (${suggestions.length})` },
          { key: "connections", label: `Mes connexions (${acceptedConnections.length})` },
          { key: "pending", label: `Demandes reçues (${pendingCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "h-[34px] px-3 rounded-lg text-xs font-semibold font-heading border transition-all",
              activeTab === tab.key ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/70 hover:bg-primary/10 hover:border-primary/35 hover:text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher..."
          className="ml-auto h-[34px] px-3 rounded-lg bg-secondary/50 border border-border text-xs outline-none focus:border-primary/40 w-48"
        />
      </div>

      {/* Suggestions */}
      {activeTab === "suggestions" && (
        profilesLoading ? (
          <div className="grid grid-cols-4 gap-3.5 mb-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : suggestions.length === 0 ? (
          <GHCard className="text-center py-8 mb-5">
            <p className="text-xs text-muted-foreground">Aucune suggestion trouvée.</p>
          </GHCard>
        ) : (
          <div className="grid grid-cols-4 gap-3.5 mb-5">
            {suggestions.slice(0, 12).map((s, idx) => (
              <GHCard key={s.id} className="text-center">
                <div className={`w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-base font-extrabold text-white mx-auto mb-2.5`}>
                  {s.display_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-[13px] font-bold mb-[2px]">{s.display_name}</div>
                <div className="text-[11px] text-muted-foreground mb-1.5">{s.company_name ?? s.sector ?? "Membre"}</div>
                {s.sector && <Tag>{s.sector}</Tag>}
                {s.city && <div className="text-[10px] text-muted-foreground mt-1">{s.city}, {s.country}</div>}
                <button
                  onClick={() => handleConnect(s.user_id)}
                  disabled={sendConnection.isPending}
                  className="w-full mt-3 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  Connecter
                </button>
              </GHCard>
            ))}
          </div>
        )
      )}

      {/* My connections */}
      {activeTab === "connections" && (
        acceptedConnections.length === 0 ? (
          <GHCard className="text-center py-8">
            <p className="text-xs text-muted-foreground">Aucune connexion. Explorez les suggestions !</p>
          </GHCard>
        ) : (
          <div className="grid grid-cols-4 gap-3.5">
            {acceptedConnections.map((conn, idx) => {
              const profile = (conn as any).partner_profile;
              return (
                <GHCard key={conn.id} className="text-center">
                  <div className={`w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-base font-extrabold text-white mx-auto mb-2.5`}>
                    {(profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-[13px] font-bold mb-[2px]">{profile?.display_name ?? "Membre"}</div>
                  <div className="text-[11px] text-muted-foreground mb-1.5">{profile?.company_name ?? profile?.sector ?? ""}</div>
                  <Tag variant="green">Connecté</Tag>
                  <button
                    onClick={() => onNavigate("messaging")}
                    className="w-full mt-3 px-2.5 py-1.5 rounded-lg bg-card border border-border font-heading text-[10px] font-bold hover:bg-secondary transition-all flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> Message
                  </button>
                </GHCard>
              );
            })}
          </div>
        )
      )}

      {/* Pending */}
      {activeTab === "pending" && (
        !pendingRequests || pendingRequests.length === 0 ? (
          <GHCard className="text-center py-8">
            <p className="text-xs text-muted-foreground">Aucune demande en attente.</p>
          </GHCard>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((r, idx) => (
              <GHCard key={r.id} className="flex items-center gap-3">
                <div className={`w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-xs font-extrabold text-white flex-shrink-0`}>
                  {(r.requester_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{r.requester_profile?.display_name ?? "Membre"}</div>
                  <div className="text-[11px] text-muted-foreground">{r.requester_profile?.company_name ?? r.requester_profile?.sector ?? ""}</div>
                  {r.message && <div className="text-[11px] text-foreground/60 italic mt-1">"{r.message}"</div>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRespond(r.id, "accepted", r.requester_id)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold">Accepter</button>
                  <button onClick={() => handleRespond(r.id, "rejected", r.requester_id)} className="px-3 py-1.5 rounded-lg bg-card border border-border font-heading text-[10px] font-bold">Ignorer</button>
                </div>
              </GHCard>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}
