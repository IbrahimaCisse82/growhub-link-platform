import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, SectionHeader, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useEvents, useRegisterEvent, useUnregisterEvent } from "@/hooks/useGrowHub";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, MapPin, Globe, Users, Calendar } from "lucide-react";
import EventMatchmaking from "@/components/EventMatchmaking";
import { ExportEventButton, ExportAllEventsButton } from "@/components/CalendarExport";

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
  usePageMeta({ title: "Événements", description: "Participez à des webinars, workshops et meetups de l'écosystème startup." });
  const { user } = useAuth();
  const { data: events, isLoading } = useEvents();
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_type: "webinar", starts_at: "", is_online: true, location: "", max_attendees: "" });
  const [filter, setFilter] = useState<string>("all");

  const handleRegister = (eventId: string) => {
    if (!user) { toast.error("Connectez-vous pour vous inscrire"); return; }
    registerEvent.mutate(eventId, {
      onSuccess: () => toast.success("Inscription confirmée !"),
      onError: () => toast.error("Déjà inscrit ou erreur"),
    });
  };

  const handleUnregister = (eventId: string) => {
    unregisterEvent.mutate(eventId, {
      onSuccess: () => toast.success("Inscription annulée"),
    });
  };

  const handleCreate = async () => {
    if (!user || !form.title.trim() || !form.starts_at) return;
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title: form.title,
      description: form.description || null,
      event_type: form.event_type as any,
      starts_at: new Date(form.starts_at).toISOString(),
      is_online: form.is_online,
      location: form.is_online ? null : form.location || null,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
    });
    setCreating(false);
    if (error) toast.error("Erreur");
    else {
      toast.success("Événement créé !");
      setShowCreate(false);
      setForm({ title: "", description: "", event_type: "webinar", starts_at: "", is_online: true, location: "", max_attendees: "" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  };

  const myRegistrations = events?.filter(e => user && e.registrations?.some((r: any) => r.user_id === user.id)) ?? [];
  const filteredEvents = filter === "all" ? events : events?.filter(e => e.event_type === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Événements & Rencontres
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Ne ratez <span className="text-primary">aucune opportunité</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Summits, workshops, networking events — rejoignez la communauté.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📅" value={String(events?.length ?? 0)} label="Événements à venir" badge="Total" badgeType="neutral" />
        <MetricCard icon="✅" value={String(myRegistrations.length)} label="Mes inscriptions" badge="Confirmées" badgeType="up" />
        <MetricCard icon="🌐" value={String(events?.filter(e => e.is_online).length ?? 0)} label="En ligne" badge="Accessibles" badgeType="neutral" />
        <MetricCard icon="👥" value={String(events?.reduce((s, e) => s + (e.registrations?.length ?? 0), 0) ?? 0)} label="Participants" badge="Total" badgeType="up" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "webinar", "workshop", "meetup", "conference", "demo_day"].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`h-[30px] px-3 rounded-lg text-[11px] font-semibold font-heading border transition-colors ${
                filter === t ? "bg-primary/10 border-primary/35 text-primary" : "bg-card border-border text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {t === "all" ? "Tous" : typeLabels[t] ?? t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <ExportAllEventsButton events={(filteredEvents ?? []).map(e => ({
            title: e.title,
            description: e.description ?? undefined,
            location: e.is_online ? "En ligne" : e.location ?? undefined,
            start: new Date(e.starts_at),
            end: e.ends_at ? new Date(e.ends_at) : undefined,
          }))} />
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Créer
          </button>
        </div>
      </div>

      {showCreate && (
        <GHCard className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre *" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_online} onChange={(e) => setForm({ ...form, is_online: e.target.checked })} /> En ligne
            </label>
            {!form.is_online && <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lieu" className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />}
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">Annuler</button>
            <button onClick={handleCreate} disabled={!form.title || !form.starts_at || creating} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">Créer</button>
          </div>
        </GHCard>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : !filteredEvents || filteredEvents.length === 0 ? (
        <GHCard className="text-center py-8 mb-5">
          <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun événement à venir.</p>
        </GHCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-5">
          {filteredEvents.map((e, idx) => {
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
                  {e.is_online ? (
                    <Globe className="absolute top-2 right-2 w-4 h-4 text-white/60" />
                  ) : (
                    <MapPin className="absolute top-2 right-2 w-4 h-4 text-white/60" />
                  )}
                </div>
                <div className="p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-[5px]">{typeLabels[e.event_type] ?? e.event_type}</div>
                  <div className="font-heading text-[13px] font-bold mb-2 leading-tight">{e.title}</div>
                  {e.description && <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{e.description}</p>}
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {e.is_online ? "En ligne" : e.location ?? "Lieu TBD"}
                    {e.max_attendees && ` · ${e.max_attendees} places`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {startDate.toLocaleDateString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[11px] font-bold text-primary font-heading flex items-center gap-1">
                    <Users className="w-3 h-3" /> {regCount}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ExportEventButton event={{
                      title: e.title,
                      description: e.description ?? undefined,
                      location: e.is_online ? "En ligne" : e.location ?? undefined,
                      start: startDate,
                      end: e.ends_at ? new Date(e.ends_at) : undefined,
                    }} />
                    {isRegistered ? (
                      <button
                        onClick={() => handleUnregister(e.id)}
                        className="px-2.5 py-1 rounded-lg bg-secondary border border-border font-heading text-[10px] font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                      >
                        Se désinscrire
                      </button>
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
                {/* Event Matchmaking */}
                {isRegistered && regCount > 1 && (
                  <div className="px-3.5 pb-2.5">
                    <EventMatchmaking eventId={e.id} registrations={e.registrations ?? []} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
