import { motion } from "framer-motion";
import { GHCard, Tag, SectionHeader } from "@/components/ui-custom";

export default function EventsPage() {
  const events = [
    { date: "22", month: "MAR", type: "Summit", title: "GrowHubLink Summit Paris", meta: "Station F · 300 places", participants: 142, color: "from-[#0a1a0a] to-primary/80" },
    { date: "28", month: "MAR", type: "Workshop", title: "Masterclass Pitch Deck", meta: "En ligne · 50 places", participants: 28, color: "from-[#0a0a1a] to-ghblue/80" },
    { date: "03", month: "AVR", type: "Networking", title: "Apéro Founders Lyon", meta: "Lyon · 80 places", participants: 56, color: "from-[#1a0a0a] to-ghorange/80" },
    { date: "10", month: "AVR", type: "Coaching", title: "Atelier Fundraising", meta: "En ligne · 30 places", participants: 18, color: "from-[#0a1a1a] to-ghpurple/80" },
  ];

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
            Summits, workshops, networking events — rejoignez la communauté GrowHubLink en présentiel et en ligne.
          </p>
        </div>
      </div>

      <SectionHeader title="📅 Événements à venir" linkText="Voir le calendrier" />
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {events.map((e) => (
          <div key={e.title} className="bg-secondary/60 border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/15 hover:translate-y-[-2px] hover:shadow-md cursor-pointer">
            <div className={`h-[90px] relative bg-gradient-to-br ${e.color} flex items-end p-2.5`}>
              <div className="bg-foreground/80 backdrop-blur-sm rounded-lg px-2.5 py-[5px] font-heading text-[10px] font-extrabold leading-tight text-white">
                <span className="block text-lg text-primary-glow">{e.date}</span>
                {e.month}
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-[5px]">{e.type}</div>
              <div className="font-heading text-[13px] font-bold mb-2 leading-tight">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">{e.meta}</div>
            </div>
            <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between">
              <div className="flex -space-x-[5px]">
                {["SA", "JC", "TM"].map((i, idx) => (
                  <div key={idx} className="w-[22px] h-[22px] rounded-full border-2 border-secondary bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center text-[8px] font-extrabold text-white">
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-primary font-heading">{e.participants} inscrits</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar mini */}
      <GHCard title="📅 Mars 2025">
        <div className="grid grid-cols-7 gap-[2px] mb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-center font-heading text-[10px] font-bold text-muted-foreground p-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[2px]">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const hasEvent = [3, 7, 14, 18, 22, 28].includes(d);
            const isToday = d === 18;
            return (
              <div key={d} className={`text-center py-2 px-1 text-xs rounded-lg cursor-pointer transition-all relative ${isToday ? "bg-primary text-primary-foreground font-heading font-extrabold" : hasEvent ? "bg-primary/10 text-primary font-bold" : "text-foreground/70 hover:bg-card"}`}>
                {d}
                {hasEvent && !isToday && <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
              </div>
            );
          })}
        </div>
      </GHCard>
    </motion.div>
  );
}
