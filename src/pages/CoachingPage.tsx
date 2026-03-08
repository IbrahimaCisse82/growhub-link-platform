import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useCoaches, useCoachingSessions, useBookSession, useCancelSession, useRateSession } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function CoachingPage() {
  usePageMeta({ title: "Coaching", description: "Trouvez un coach et réservez des sessions pour accélérer votre startup." });
  const { data: coaches, isLoading: coachesLoading } = useCoaches();
  const { data: sessions } = useCoachingSessions();
  const bookSession = useBookSession();
  const cancelSession = useCancelSession();
  const rateSession = useRateSession();
  const [bookingCoachId, setBookingCoachId] = useState<string | null>(null);
  const [bookDate, setBookDate] = useState("");
  const [bookTopic, setBookTopic] = useState("");
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const scheduledSessions = sessions?.filter(s => s.status === "scheduled") ?? [];
  const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
  const avgRating = completedSessions.length > 0 ? (completedSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating ?? 0), 0) / Math.max(1, completedSessions.filter(s => s.rating).length)).toFixed(1) : "—";

  const handleBook = () => {
    if (!bookingCoachId || !bookDate) { toast.error("Sélectionnez une date"); return; }
    bookSession.mutate({ coachId: bookingCoachId, scheduledAt: new Date(bookDate).toISOString(), topic: bookTopic }, {
      onSuccess: () => { toast.success("Session réservée !"); setBookingCoachId(null); setBookDate(""); setBookTopic(""); },
      onError: () => toast.error("Erreur"),
    });
  };
  const handleCancel = (id: string) => cancelSession.mutate(id, { onSuccess: () => toast.success("Annulée") });
  const handleRate = () => {
    if (!ratingSessionId || rating === 0) { toast.error("Sélectionnez une note"); return; }
    rateSession.mutate({ sessionId: ratingSessionId, rating, feedback }, { onSuccess: () => { toast.success("Merci !"); setRatingSessionId(null); setRating(0); setFeedback(""); } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5"><span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> Coaching Hub</div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Votre <span className="text-primary">accompagnement</span> personnalisé</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🎓" value={String((coaches ?? []).length)} label="Coachs" badge="Actifs" badgeType="up" />
        <MetricCard icon="📅" value={String(scheduledSessions.length)} label="Planifiées" badge="À venir" badgeType="up" />
        <MetricCard icon="✅" value={String(completedSessions.length)} label="Terminées" badge="Total" badgeType="neutral" />
        <MetricCard icon="⭐" value={avgRating} label="Satisfaction" badge="/5" badgeType="up" />
      </div>

      <h3 className="font-heading text-base font-extrabold mb-3">Coachs disponibles</h3>
      {coachesLoading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      : !coaches || coaches.length === 0 ? <GHCard className="text-center py-8 mb-5"><p className="text-sm text-muted-foreground">Aucun coach disponible</p></GHCard>
      : <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">{coaches.map((c: any) => (
        <GHCard key={c.id}>
          <div className="flex gap-3 items-start mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-sm font-extrabold text-primary-foreground flex-shrink-0">{(c.profile?.display_name ?? "C").substring(0, 2).toUpperCase()}</div>
            <div className="flex-1"><div className="font-heading text-sm font-bold">{c.profile?.display_name ?? "Coach"}</div><div className="text-[11px] text-muted-foreground">{c.profile?.company_name ?? ""}</div><div className="flex gap-1 mt-1 flex-wrap">{(c.specialties ?? []).slice(0, 3).map((s: string) => <Tag key={s} variant="green">{s}</Tag>)}</div></div>
            <div className="text-right"><div className="font-heading text-sm font-bold text-primary">{c.hourly_rate ?? "—"}€/h</div><div className="text-[10px] text-muted-foreground">⭐ {c.rating ?? "—"}</div></div>
          </div>
          {bookingCoachId === c.id ? (
            <div className="space-y-2 border-t border-border pt-3">
              <input type="datetime-local" value={bookDate} onChange={e => setBookDate(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
              <input value={bookTopic} onChange={e => setBookTopic(e.target.value)} placeholder="Sujet..." className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2"><button onClick={handleBook} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold flex-1">Confirmer</button><button onClick={() => setBookingCoachId(null)} className="bg-card border border-border rounded-lg px-4 py-2 text-xs font-bold">Annuler</button></div>
            </div>
          ) : <button onClick={() => setBookingCoachId(c.id)} className="w-full bg-primary/10 text-primary rounded-lg py-2 text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Réserver</button>}
        </GHCard>
      ))}</div>}

      {scheduledSessions.length > 0 && (<><h3 className="font-heading text-base font-extrabold mb-3">Sessions à venir</h3><div className="space-y-3 mb-5">{scheduledSessions.map((s: any) => (
        <GHCard key={s.id}><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Calendar className="w-4 h-4" /></div>
          <div className="flex-1"><div className="font-heading text-sm font-bold">{s.coach_profile?.display_name ?? "Coach"}</div><div className="text-[11px] text-muted-foreground">{s.topic ?? "Session"} · {new Date(s.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div>
          <button onClick={() => handleCancel(s.id)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
        </div></GHCard>
      ))}</div></>)}

      {completedSessions.length > 0 && (<><h3 className="font-heading text-base font-extrabold mb-3">Historique</h3><div className="space-y-3">{completedSessions.map((s: any) => (
        <GHCard key={s.id}><div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><Star className="w-4 h-4" /></div>
          <div className="flex-1"><div className="font-heading text-sm font-bold">{s.coach_profile?.display_name ?? "Coach"}</div><div className="text-[11px] text-muted-foreground">{s.topic ?? "Session"} · {new Date(s.scheduled_at).toLocaleDateString("fr-FR")}</div></div>
          {s.rating ? <Tag variant="green">⭐ {s.rating}/5</Tag> : ratingSessionId === s.id ? (
            <div className="flex items-center gap-2"><div className="flex gap-0.5">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)}><Star className={cn("w-4 h-4", n <= rating ? "fill-primary text-primary" : "text-muted-foreground")} /></button>)}</div><button onClick={handleRate} className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-xs font-bold">OK</button></div>
          ) : <button onClick={() => setRatingSessionId(s.id)} className="text-xs text-primary font-bold hover:underline">Évaluer</button>}
        </div></GHCard>
      ))}</div></>)}
    </motion.div>
  );
}
