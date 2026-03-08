import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Zap, Users, Clock, Plus, Calendar, Video, Star, MessageSquare } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function SpeedNetworkingPage() {
  usePageMeta({ title: "Speed Networking", description: "Rencontrez des profils complémentaires en sessions de 5 minutes." });
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newSession, setNewSession] = useState({ title: "Speed Networking", description: "", scheduled_at: "", duration_minutes: 5, max_participants: 20 });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["speed-networking-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speed_networking_sessions")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myParticipations } = useQuery({
    queryKey: ["speed-networking-participations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speed_networking_participants")
        .select("session_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map(p => p.session_id));
    },
  });

  const { data: participantCounts } = useQuery({
    queryKey: ["speed-networking-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speed_networking_participants")
        .select("session_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data ?? []).forEach(p => { counts[p.session_id] = (counts[p.session_id] ?? 0) + 1; });
      return counts;
    },
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("speed_networking_sessions").insert({
        ...newSession,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speed-networking-sessions"] });
      toast.success("Session créée !");
      setShowCreate(false);
      setNewSession({ title: "Speed Networking", description: "", scheduled_at: "", duration_minutes: 5, max_participants: 20 });
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const joinSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from("speed_networking_participants").insert({
        session_id: sessionId,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speed-networking"] });
      toast.success("Inscrit ! Vous serez matché avec un participant complémentaire.");
    },
    onError: () => toast.error("Erreur ou déjà inscrit"),
  });

  const leaveSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from("speed_networking_participants")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["speed-networking"] });
      toast.success("Désinscrit");
    },
  });

  const upcomingSessions = sessions?.filter(s => new Date(s.scheduled_at) > new Date()) ?? [];
  const pastSessions = sessions?.filter(s => new Date(s.scheduled_at) <= new Date()) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> Speed Networking
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Rencontres <span className="text-primary">éclair</span> ⚡
          </h1>
          <p className="text-foreground/60 text-sm max-w-[500px] mb-4">
            Sessions de 5 minutes avec des profils complémentaires. Le matching intelligent trouve les meilleures connexions pour vous.
          </p>
          <button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover hover:shadow-glow transition-all">
            <Plus className="w-4 h-4" /> Organiser une session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="⚡" value={String(upcomingSessions.length)} label="Sessions à venir" badge="Prochaines" badgeType="up" />
        <MetricCard icon="👥" value={String(Object.values(participantCounts ?? {}).reduce((a, b) => a + b, 0))} label="Participants" badge="Total" badgeType="neutral" />
        <MetricCard icon="🎯" value="5 min" label="Par rencontre" badge="Format" badgeType="neutral" />
        <MetricCard icon="🤝" value={String(myParticipations?.size ?? 0)} label="Mes inscriptions" badge="Actives" badgeType="up" />
      </div>

      {/* Create Session Modal */}
      {showCreate && (
        <GHCard title="Nouvelle session" className="mb-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Titre</label>
              <input value={newSession.title} onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Description</label>
              <textarea value={newSession.description} onChange={e => setNewSession({ ...newSession, description: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[60px] focus:outline-none focus:border-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-1 block">Date & Heure</label>
                <input type="datetime-local" value={newSession.scheduled_at} onChange={e => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/70 mb-1 block">Max participants</label>
                <input type="number" value={newSession.max_participants} onChange={e => setNewSession({ ...newSession, max_participants: parseInt(e.target.value) || 20 })}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => createSession.mutate()} disabled={!newSession.scheduled_at}
                className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold disabled:opacity-50 hover:bg-primary-hover transition-all">
                Créer
              </button>
              <button onClick={() => setShowCreate(false)} className="bg-secondary text-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold">
                Annuler
              </button>
            </div>
          </div>
        </GHCard>
      )}

      {/* Upcoming Sessions */}
      <h2 className="font-heading text-lg font-bold mb-3">⚡ Sessions à venir</h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Chargement...</div>
      ) : upcomingSessions.length === 0 ? (
        <GHCard className="text-center py-8 mb-5">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune session prévue. Soyez le premier à en organiser une !</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          {upcomingSessions.map(session => {
            const isJoined = myParticipations?.has(session.id);
            const count = participantCounts?.[session.id] ?? 0;
            const isFull = count >= (session.max_participants ?? 20);
            const date = new Date(session.scheduled_at);
            return (
              <GHCard key={session.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading text-sm font-bold mb-1">{session.title}</h3>
                      {session.description && <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>}
                    </div>
                    <Tag variant={isJoined ? "green" : "default"}>{isJoined ? "Inscrit" : isFull ? "Complet" : "Ouvert"}</Tag>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {count}/{session.max_participants ?? 20}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {session.duration_minutes ?? 5} min/rencontre</span>
                  </div>
                  {isJoined ? (
                    <button onClick={() => leaveSession.mutate(session.id)} className="w-full bg-destructive/10 text-destructive rounded-lg py-2 text-xs font-bold hover:bg-destructive/20 transition-colors">
                      Se désinscrire
                    </button>
                  ) : (
                    <button onClick={() => joinSession.mutate(session.id)} disabled={isFull}
                      className="w-full bg-primary/10 text-primary rounded-lg py-2 text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50">
                      <Zap className="w-3 h-3 inline mr-1" /> {isFull ? "Complet" : "Rejoindre"}
                    </button>
                  )}
                </div>
              </GHCard>
            );
          })}
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <>
          <h2 className="font-heading text-lg font-bold mb-3">📋 Sessions passées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pastSessions.slice(0, 6).map(session => (
              <GHCard key={session.id} className="opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold">{session.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{participantCounts?.[session.id] ?? 0} participants
                    </p>
                  </div>
                  <Tag>Terminée</Tag>
                </div>
              </GHCard>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
