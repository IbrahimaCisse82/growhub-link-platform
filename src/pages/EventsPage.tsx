import { motion } from "framer-motion";
import { GHCard, Tag, SectionHeader } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, useRegisterEvent } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const eventColors = [
  "from-[#0a1a0a] to-primary/80",
  "from-[#0a0a1a] to-ghblue/80",
  "from-[#1a0a0a] to-ghorange/80",
  "from-[#0a1a1a] to-ghpurple/80",
];

const typeLabels: Record<string, string> = {
  webinar: "Webinar",
  workshop: "Workshop",
  meetup: "Networking",
  conference: "Conférence",
  demo_day: "Demo Day",
};

export default function EventsPage() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEvents();
  const registerEvent = useRegisterEvent();

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast.error("Connectez-vous pour vous inscrire");
      return;
    }
    registerEvent.mutate(eventId, {
      onSuccess: () => toast.success("Inscription confirmée !"),
      onError: () => toast.error("Déjà inscrit ou erreur"),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Événements & Rencontres
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Ne ratez <span className="text-primary">aucune opportunité</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Summits, workshops, networking events — rejoignez la communauté GrowHubLink.
          </p>
        </div>
      </div>

      <SectionHeader title="📅 Événements à venir" />

      {isLoading ? (
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : !events || events.length === 0 ? (
        <GHCard className="text-center py-8 mb-5">
          <p className="text-xs text-muted-foreground">Aucun événement à venir pour le moment.</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          {events.map((e, idx) => {
            const startDate = new Date(e.starts_at);
            const isRegistered = user && e.registrations?.some((r: any) => r.user_id === user.id);
            const regCount = e.registrations?.length ?? 0;

            return (
              <div key={e.id} className="bg-secondary/60 border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/15 hover:translate-y-[-2px] hover:shadow-md">
                <div className={`h-[90px] relative bg-gradient-to-br ${eventColors[idx % eventColors.length]} flex items-end p-2.5`}>
                  <div className="bg-foreground/80 backdrop-blur-sm rounded-lg px-2.5 py-[5px] font-heading text-[10px] font-extrabold leading-tight text-white">
                    <span className="block text-lg text-primary-glow">{startDate.getDate()}</span>
                    {startDate.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-[5px]">{typeLabels[e.event_type] ?? e.event_type}</div>
                  <div className="font-heading text-[13px] font-bold mb-2 leading-tight">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.is_online ? "En ligne" : e.location ?? "Lieu TBD"}{e.max_attendees ? ` · ${e.max_attendees} places` : ""}</div>
                </div>
                <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary font-heading">{regCount} inscrits</span>
                  {isRegistered ? (
                    <Tag variant="green">✓ Inscrit</Tag>
                  ) : (
                    <button
                      onClick={() => handleRegister(e.id)}
                      disabled={registerEvent.isPending}
                      className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                    >
                      S'inscrire
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
