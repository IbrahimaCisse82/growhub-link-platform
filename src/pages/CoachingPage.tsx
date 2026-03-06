import { useState } from "react";
import { motion } from "framer-motion";
import { MetricCard, GHCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useCoaches, useCoachingSessions, useBookSession, useCancelSession, useRateSession } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

const coachGradients = [
  "from-[#200a30] to-[#A064FF]",
  "from-[#103050] to-[#4096FF]",
  "from-[#1a3a10] to-[#5CBF00]",
  "from-[#301a08] to-[#D06020]",
];

export default function CoachingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const { data: coaches, isLoading: coachesLoading } = useCoaches();
  const { data: sessions } = useCoachingSessions();
  const bookSession = useBookSession();
  const cancelSession = useCancelSession();
  const rateSession = useRateSession();

  const [bookingCoachId, setBookingCoachId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingTopic, setBookingTopic] = useState("");
  const [ratingSessionId, setRatingSessionId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");

  const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
  const scheduledSessions = sessions?.filter(s => s.status === "scheduled") ?? [];
  const cancelledSessions = sessions?.filter(s => s.status === "cancelled") ?? [];
  const avgRating = completedSessions.filter(s => s.rating).length > 0
    ? (completedSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating ?? 0), 0) / completedSessions.filter(s => s.rating).length).toFixed(1)
    : "—";

  const handleBook = () => {
    if (!bookingCoachId || !bookingDate || !bookingTime) return;
    const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
    bookSession.mutate({ coachId: bookingCoachId, scheduledAt, topic: bookingTopic || undefined }, {
      onSuccess: () => { toast.success("Session réservée !"); setBookingCoachId(null); setBookingDate(""); setBookingTopic(""); },
      onError: () => toast.error("Erreur lors de la réservation"),
    });
  };

  const handleCancel = (sessionId: string) => {
    cancelSession.mutate(sessionId, {
      onSuccess: () => toast.success("Session annulée"),
    });
  };

  const handleRate = () => {
    if (!ratingSessionId) return;
    rateSession.mutate({ sessionId: ratingSessionId, rating: ratingValue, feedback: ratingFeedback || undefined }, {
      onSuccess: () => { toast.success("Merci pour votre retour !"); setRatingSessionId(null); setRatingFeedback(""); },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Coaching Hub
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Votre <span className="text-primary">coaching personnalisé</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Réservez, suivez et évaluez vos sessions de coaching avec des experts certifiés.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="⭐" value={`${avgRating}/5`} label="Satisfaction moyenne" badge={`${completedSessions.filter(s => s.rating).length} avis`} badgeType="up" />
        <MetricCard icon="📅" value={String(scheduledSessions.length)} label="Sessions à venir" badge="Planifiées" badgeType="up" />
        <MetricCard icon="✅" value={String(completedSessions.length)} label="Sessions terminées" badge="Total" badgeType="up" />
        <MetricCard icon="🎓" value={String(coaches?.length ?? 0)} label="Coaches disponibles" badge="Actifs" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        {/* Coaches */}
        <div>
          <SectionHeader title="🎓 Coaches disponibles" />
          {coachesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl mb-3" />)
          ) : !coaches || coaches.length === 0 ? (
            <GHCard className="text-center py-8">
              <p className="text-xs text-muted-foreground">Aucun coach disponible pour le moment.</p>
            </GHCard>
          ) : (
            coaches.map((c, idx) => (
              <GHCard key={c.id} className="mb-3">
                <div className="flex gap-3 items-start mb-3.5">
                  <div className={`w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br ${coachGradients[idx % coachGradients.length]} flex items-center justify-center font-heading text-[15px] font-extrabold text-white flex-shrink-0`}>
                    {(c.profile?.display_name ?? "C").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-heading text-sm font-bold mb-[2px]">{c.profile?.display_name ?? "Coach"}</div>
                    <div className="text-[11px] text-muted-foreground mb-1">{c.specialties?.join(", ") ?? "Coach certifié"}</div>
                    <div className="flex items-center gap-1 text-xs text-foreground/70">
                      <span className="text-ghgold">★</span> {c.rating?.toFixed(1) ?? "Nouveau"}
                      {c.total_sessions ? <span className="text-muted-foreground ml-1">· {c.total_sessions} sessions</span> : null}
                    </div>
                  </div>
                </div>
                {c.hourly_rate && (
                  <div className="font-heading text-[22px] font-extrabold text-primary mb-[3px]">
                    {c.hourly_rate}€<span className="text-xs text-muted-foreground font-sans font-normal">/session</span>
                  </div>
                )}

                {bookingCoachId === c.id ? (
                  <div className="bg-secondary/50 rounded-xl p-3 mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex-1 bg-card border border-border rounded-lg px-2 py-1.5 text-xs"
                      />
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs"
                      >
                        {["09:00","10:00","11:00","14:00","15:00","16:00","17:00"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                      placeholder="Sujet de la session (optionnel)"
                      className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleBook}
                        disabled={!bookingDate || bookSession.isPending}
                        className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 font-heading text-[12px] font-bold disabled:opacity-50 hover:bg-primary-hover transition-all"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setBookingCoachId(null)}
                        className="px-3 bg-card border border-border rounded-lg text-xs hover:bg-secondary transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setBookingCoachId(c.id)}
                    className="w-full bg-primary text-primary-foreground border-none rounded-[9px] py-2.5 font-heading text-[13px] font-bold cursor-pointer hover:bg-primary-hover hover:shadow-glow transition-all mt-3.5"
                  >
                    <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                    Réserver une session
                  </button>
                )}
              </GHCard>
            ))
          )}
        </div>

        {/* Sessions */}
        <div>
          {/* Upcoming */}
          {scheduledSessions.length > 0 && (
            <>
              <SectionHeader title="📅 Sessions à venir" />
              {scheduledSessions.map(s => (
                <GHCard key={s.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold">{(s as any).coach_profile?.display_name ?? "Coach"}</div>
                      <div className="text-[11px] text-muted-foreground">{s.topic ?? "Session"} · {s.duration_minutes ?? 60} min</div>
                      <Tag variant="blue" >
                        {new Date(s.scheduled_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </Tag>
                    </div>
                    <button
                      onClick={() => handleCancel(s.id)}
                      className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Annuler
                    </button>
                  </div>
                </GHCard>
              ))}
            </>
          )}

          {/* Completed - can rate */}
          <SectionHeader title="📋 Historique des sessions" />
          <GHCard>
            {completedSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Aucune session terminée.</p>
            ) : (
              completedSessions.slice(0, 8).map((s, idx) => (
                <div key={s.id} className="p-[11px] bg-secondary/50 rounded-[9px] mb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-bold">
                      {(s as any).coach_profile?.display_name ?? "Coach"} · {new Date(s.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                    {s.rating ? (
                      <Tag variant="green">⭐ {s.rating}/5</Tag>
                    ) : (
                      <button
                        onClick={() => setRatingSessionId(s.id)}
                        className="text-[10px] text-primary font-bold hover:opacity-70"
                      >
                        Évaluer →
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-[2px]">
                    {s.topic ?? "Session"} · {s.duration_minutes ?? 60} min
                  </div>
                  {s.notes && <div className="text-[11px] text-foreground/60 mt-[5px] italic leading-relaxed">"{s.notes}"</div>}

                  {ratingSessionId === s.id && (
                    <div className="mt-3 p-3 bg-card border border-border rounded-xl space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(v => (
                          <button key={v} onClick={() => setRatingValue(v)}>
                            <Star className={cn("w-5 h-5", v <= ratingValue ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                        placeholder="Votre retour (optionnel)"
                        className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-xs resize-none min-h-[50px]"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleRate} className="flex-1 bg-primary text-primary-foreground rounded-lg py-1.5 text-xs font-bold">Envoyer</button>
                        <button onClick={() => setRatingSessionId(null)} className="px-3 bg-card border border-border rounded-lg text-xs">Annuler</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </GHCard>
        </div>
      </div>
    </motion.div>
  );
}
