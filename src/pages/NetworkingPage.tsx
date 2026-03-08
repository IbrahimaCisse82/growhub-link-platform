import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles, useConnections, usePendingRequests, useSendConnection, useRespondConnection } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, UserPlus, Check, X, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import NetworkGraph from "@/components/NetworkGraph";
import { IntentEditor, IntentMatchResults } from "@/components/IntentMatching";
import DailyMatchFeed from "@/components/DailyMatchFeed";

const gradients = ["from-[#200a30] to-[#A064FF]","from-[#103050] to-[#4096FF]","from-[#1a3a10] to-[#5CBF00]","from-[#301a08] to-[#D06020]","from-[#0a3040] to-[#00B8A0]"];

export default function NetworkingPage() {
  usePageMeta({ title: "Networking", description: "Développez votre réseau professionnel et trouvez des partenaires." });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: connections } = useConnections();
  const { data: pendingRequests } = usePendingRequests();
  const sendConnection = useSendConnection();
  const respondConnection = useRespondConnection();
  const [activeTab, setActiveTab] = useState<"suggestions"|"connections"|"pending">("suggestions");
  const [searchTerm, setSearchTerm] = useState("");

  const acceptedConnections = connections?.filter(c => c.status === "accepted") ?? [];
  const pendingCount = pendingRequests?.length ?? 0;
  const connectedUserIds = new Set(connections?.map(c => c.requester_id === user?.id ? c.receiver_id : c.requester_id) ?? []);
  const suggestions = (profiles ?? []).filter(p => !connectedUserIds.has(p.user_id) && (!searchTerm || p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sector ?? "").toLowerCase().includes(searchTerm.toLowerCase())));

  const handleConnect = (receiverId: string) => { sendConnection.mutate({ receiverId }, { onSuccess: () => toast.success("Demande envoyée !"), onError: () => toast.error("Erreur") }); };
  const handleRespond = (connectionId: string, status: "accepted"|"rejected", requesterId?: string) => { respondConnection.mutate({ connectionId, status, requesterId }, { onSuccess: () => toast.success(status === "accepted" ? "Acceptée !" : "Refusée") }); };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5"><span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> Networking</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Votre <span className="text-primary">réseau</span> professionnel</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👥" value={String(acceptedConnections.length)} label="Connexions" badge="Actives" badgeType="up" />
        <MetricCard icon="📩" value={String(pendingCount)} label="En attente" badge="Demandes" badgeType={pendingCount > 0 ? "up" : "neutral"} />
        <MetricCard icon="🔍" value={String(suggestions.length)} label="Suggestions" badge="Disponibles" badgeType="neutral" />
        <MetricCard icon="🌐" value={String((profiles ?? []).length)} label="Membres" badge="Réseau" badgeType="neutral" />
      </div>
      {/* Intent Matching */}
      <IntentEditor />
      <IntentMatchResults />

      {/* Network Graph Visualization */}
      <div className="mb-5">
        <NetworkGraph />
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {([{ key: "suggestions" as const, label: "Suggestions", icon: UserPlus },{ key: "connections" as const, label: `Connexions (${acceptedConnections.length})`, icon: Users },{ key: "pending" as const, label: `En attente (${pendingCount})`, icon: MessageSquare }]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors", activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/70 hover:border-primary/35")}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "suggestions" && (<>
        <div className="flex items-center bg-secondary border border-border rounded-xl px-3 gap-2 h-10 mb-4 max-w-md"><Search className="w-4 h-4 text-muted-foreground" /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className="bg-transparent outline-none text-sm w-full" /></div>
        {profilesLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
        : suggestions.length === 0 ? <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune suggestion</p></GHCard>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((p, idx) => (
            <GHCard key={p.id} className="cursor-pointer" onClick={() => navigate(`/profile/${p.user_id}`)}>
              <div className="flex gap-3 items-start mb-3">
                {p.avatar_url ? <img src={p.avatar_url} className="w-11 h-11 rounded-full object-cover" alt="" /> : <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{p.display_name.substring(0, 2).toUpperCase()}</div>}
                <div className="flex-1 min-w-0"><div className="font-heading text-sm font-bold truncate">{p.display_name}</div><div className="text-[11px] text-muted-foreground truncate">{p.company_name ?? ""}{p.sector ? ` · ${p.sector}` : ""}</div></div>
              </div>
              {p.skills && p.skills.length > 0 && <div className="flex flex-wrap gap-1 mb-3">{p.skills.slice(0, 3).map((s: string) => <Tag key={s} variant="green">{s}</Tag>)}</div>}
              <button onClick={e => { e.stopPropagation(); handleConnect(p.user_id); }} className="w-full bg-primary/10 text-primary rounded-lg py-2 text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Se connecter</button>
            </GHCard>
          ))}
        </div>}
      </>)}
      {activeTab === "connections" && (acceptedConnections.length === 0 ? <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune connexion</p></GHCard> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{acceptedConnections.map((c: any, idx: number) => (
        <GHCard key={c.id} className="cursor-pointer" onClick={() => navigate(`/profile/${c.partner_profile?.user_id}`)}>
          <div className="flex gap-3 items-center">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{(c.partner_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><div className="font-heading text-sm font-bold truncate">{c.partner_profile?.display_name ?? "Membre"}</div><div className="text-[11px] text-muted-foreground truncate">{c.partner_profile?.company_name ?? ""}</div></div>
            <button onClick={e => { e.stopPropagation(); navigate("/messaging"); }} className="text-primary"><MessageSquare className="w-4 h-4" /></button>
          </div>
        </GHCard>
      ))}</div>)}
      {activeTab === "pending" && (!pendingRequests || pendingRequests.length === 0 ? <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Aucune demande</p></GHCard> : <div className="space-y-3">{pendingRequests.map((r: any) => (
        <GHCard key={r.id}><div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{(r.requester_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}</div>
          <div className="flex-1"><div className="font-heading text-sm font-bold">{r.requester_profile?.display_name ?? "Membre"}</div><div className="text-[11px] text-muted-foreground">{r.requester_profile?.company_name ?? ""}</div></div>
          <div className="flex gap-2">
            <button onClick={() => handleRespond(r.id, "accepted", r.requester_id)} className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Accepter</button>
            <button onClick={() => handleRespond(r.id, "rejected")} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Refuser</button>
          </div>
        </div></GHCard>
      ))}</div>)}
    </motion.div>
  );
}
