import { motion } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles, useConnections, usePendingRequests, useSendConnection, useRespondConnection } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

  const acceptedCount = connections?.filter(c => c.status === "accepted").length ?? 0;
  const pendingCount = pendingRequests?.length ?? 0;

  const handleConnect = (receiverId: string) => {
    sendConnection.mutate({ receiverId }, {
      onSuccess: () => toast.success("Demande envoyée !"),
      onError: () => toast.error("Erreur lors de l'envoi"),
    });
  };

  const handleRespond = (connectionId: string, status: "accepted" | "rejected") => {
    respondConnection.mutate({ connectionId, status }, {
      onSuccess: () => toast.success(status === "accepted" ? "Connexion acceptée !" : "Demande ignorée"),
    });
  };

  // IDs of people already connected to
  const connectedUserIds = new Set(
    connections?.map(c => c.requester_id === user?.id ? c.receiver_id : c.requester_id) ?? []
  );

  const suggestions = profiles?.filter(p => !connectedUserIds.has(p.user_id)) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
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
          <div className="flex gap-5 mt-4">
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">{acceptedCount}</div><div className="text-[11px] text-muted-foreground">Connexions</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">{pendingCount}</div><div className="text-[11px] text-muted-foreground">En attente</div></div>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button className="h-[34px] px-3 rounded-lg bg-primary/10 border border-primary/35 text-xs font-semibold text-primary font-heading">Suggestions</button>
        <button className="h-[34px] px-3 rounded-lg bg-card border border-border text-xs font-semibold text-foreground/70 font-heading hover:bg-primary/10 hover:border-primary/35 hover:text-primary transition-all">Mes connexions ({acceptedCount})</button>
        <button className="h-[34px] px-3 rounded-lg bg-card border border-border text-xs font-semibold text-foreground/70 font-heading hover:bg-primary/10 hover:border-primary/35 hover:text-primary transition-all">Demandes reçues ({pendingCount})</button>
      </div>

      {/* Suggestion cards */}
      {profilesLoading ? (
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : suggestions.length === 0 ? (
        <GHCard className="text-center py-8 mb-5">
          <p className="text-xs text-muted-foreground">Aucune suggestion pour le moment. D'autres membres vous seront proposés bientôt.</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {suggestions.slice(0, 8).map((s, idx) => (
            <GHCard key={s.id} className="text-center cursor-pointer">
              <div className={`w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-base font-extrabold text-white mx-auto mb-2.5`}>
                {s.display_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-[13px] font-bold mb-[2px]">{s.display_name}</div>
              <div className="text-[11px] text-muted-foreground mb-1.5">{s.company_name ?? s.sector ?? "Membre"}</div>
              {s.sector && <Tag>{s.sector}</Tag>}
              <div className="flex gap-1.5 justify-center mt-3">
                <button
                  onClick={() => handleConnect(s.user_id)}
                  disabled={sendConnection.isPending}
                  className="flex-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  Connecter
                </button>
              </div>
            </GHCard>
          ))}
        </div>
      )}

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-[18px]">
        <GHCard title="⏳ Demandes reçues">
          {!pendingRequests || pendingRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune demande en attente.</p>
          ) : (
            pendingRequests.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-[10px] mb-2">
                <div className={`w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-heading text-xs font-extrabold text-white flex-shrink-0`}>
                  {(r.requester_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{r.requester_profile?.display_name ?? "Membre"}</div>
                  <div className="text-[11px] text-muted-foreground">{r.requester_profile?.company_name ?? ""}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRespond(r.id, "accepted")} className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold">Accepter</button>
                  <button onClick={() => handleRespond(r.id, "rejected")} className="px-2.5 py-1 rounded-lg bg-card border border-border font-heading text-[10px] font-bold">Ignorer</button>
                </div>
              </div>
            ))
          )}
        </GHCard>

        <GHCard title="🌐 Votre réseau">
          <div className="flex flex-col">
            {[
              ["Connexions actives", String(acceptedCount)],
              ["Demandes en attente", String(pendingCount)],
              ["Vues de profil", String(user ? "—" : 0)],
            ].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-b-0">
                <span className="text-xs text-foreground/70">{l}</span>
                <span className="font-heading text-sm font-bold">{v}</span>
              </div>
            ))}
          </div>
        </GHCard>
      </div>
    </motion.div>
  );
}
