import { motion } from "framer-motion";
import { MetricCard, GHCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useCoaches, useCoachingSessions } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";

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

  const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
  const avgRating = completedSessions.filter(s => s.rating).length > 0
    ? (completedSessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating ?? 0), 0) / completedSessions.filter(s => s.rating).length).toFixed(1)
    : "—";

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
            Coaches certifiés, sessions individuelles, objectifs SMART et suivi de performance intégrés.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="⭐" value={`${avgRating}/5`} label="Satisfaction moyenne" badge={`${completedSessions.length} avis`} badgeType="up" />
        <MetricCard icon="📅" value={String(completedSessions.length)} label="Sessions réalisées" badge={`Total`} badgeType="up" />
        <MetricCard icon="🎓" value={String(coaches?.length ?? 0)} label="Coaches disponibles" badge="Actifs" badgeType="up" />
        <MetricCard icon="📋" value={String(sessions?.length ?? 0)} label="Total sessions" badge="Historique" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
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
                    {c.hourly_rate}€<span className="text-xs text-muted-foreground font-sans font-normal">/{c.currency === "EUR" ? "session" : c.currency}</span>
                  </div>
                )}
                <button className="w-full bg-primary text-primary-foreground border-none rounded-[9px] py-2.5 font-heading text-[13px] font-bold cursor-pointer hover:bg-primary-hover hover:shadow-glow transition-all mt-3.5">
                  Réserver
                </button>
              </GHCard>
            ))
          )}
        </div>

        <div>
          <SectionHeader title="📋 Historique des sessions" />
          <GHCard>
            {completedSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Aucune session terminée.</p>
            ) : (
              completedSessions.slice(0, 5).map((s, idx) => (
                <div key={s.id} className="p-[11px] bg-secondary/50 rounded-[9px] mb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-bold">
                      Session #{completedSessions.length - idx} · {new Date(s.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                    {s.rating && <Tag variant="green">⭐ {s.rating}</Tag>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-[2px]">
                    {(s as any).coach_profile?.display_name ?? "Coach"} · {s.topic ?? "Session"} · {s.duration_minutes ?? 60} min
                  </div>
                  {s.notes && <div className="text-[11px] text-foreground/60 mt-[5px] italic leading-relaxed">"{s.notes}"</div>}
                </div>
              ))
            )}
          </GHCard>
        </div>
      </div>
    </motion.div>
  );
}
