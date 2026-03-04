import { motion } from "framer-motion";
import { MetricCard, GHCard, Tag, ProgressBar, StatRow, SectionHeader } from "@/components/ui-custom";

export default function CoachingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
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
        <MetricCard icon="⭐" value="4.8/5" label="Satisfaction moyenne" badge="NPS: 72" badgeType="up" />
        <MetricCard icon="📅" value="12" label="Sessions réalisées" badge="▲ +3 ce mois" badgeType="up" />
        <MetricCard icon="🎯" value="73%" label="Objectifs SMART" badge="8 / 11" badgeType="up" />
        <MetricCard icon="💰" value="18x" label="ROI coaching" badge="vs benchmark 5x" badgeType="up" />
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        <div>
          <SectionHeader title="🎓 Coaches disponibles" />
          {[
            { initials: "JC", name: "Julia Chen", spec: "Levée de fonds, Pitch, Stratégie", rating: "4.9", price: "180€", gradient: "from-[#200a30] to-[#A064FF]" },
            { initials: "ML", name: "Marc Lefevre", spec: "Go-to-Market B2B, Scale", rating: "4.7", price: "150€", gradient: "from-[#103050] to-[#4096FF]" },
            { initials: "LB", name: "Laure Bernard", spec: "Recrutement, Organisation", rating: "4.8", price: "120€", gradient: "from-[#1a3a10] to-[#5CBF00]" },
          ].map((c) => (
            <GHCard key={c.initials} className="mb-3">
              <div className="flex gap-3 items-start mb-3.5">
                <div className={`w-[46px] h-[46px] rounded-[13px] bg-gradient-to-br ${c.gradient} flex items-center justify-center font-heading text-[15px] font-extrabold text-white flex-shrink-0`}>
                  {c.initials}
                </div>
                <div>
                  <div className="font-heading text-sm font-bold mb-[2px]">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground mb-1">{c.spec}</div>
                  <div className="flex items-center gap-1 text-xs text-foreground/70">
                    <span className="text-ghgold">★</span> {c.rating}
                  </div>
                </div>
              </div>
              <div className="font-heading text-[22px] font-extrabold text-primary mb-[3px]">{c.price}<span className="text-xs text-muted-foreground font-sans font-normal">/session</span></div>
              <button className="w-full bg-primary text-primary-foreground border-none rounded-[9px] py-2.5 font-heading text-[13px] font-bold cursor-pointer hover:bg-primary-hover hover:shadow-glow transition-all mt-3.5">
                Réserver
              </button>
            </GHCard>
          ))}
        </div>

        <div>
          <SectionHeader title="📋 Historique & Notes" />
          <GHCard>
            {[
              { num: 12, date: "14 mars", coach: "Julia Chen", topic: "Pitch deck", rating: "4.9", note: "Retravailler le slide TAM en bottom-up." },
              { num: 11, date: "7 mars", coach: "Marc Lefevre", topic: "Go-to-market B2B", rating: "5.0", note: "Cibler mid-market 50–200 salariés." },
              { num: 10, date: "28 fév.", coach: "Julia Chen", topic: "Pricing SaaS", rating: "4.8", note: "" },
            ].map((s) => (
              <div key={s.num} className="p-[11px] bg-secondary/50 rounded-[9px] mb-2">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold">Session #{s.num} · {s.date}</div>
                  <Tag variant="green">⭐ {s.rating}</Tag>
                </div>
                <div className="text-[11px] text-muted-foreground mt-[2px]">{s.coach} · {s.topic} · 60 min</div>
                {s.note && <div className="text-[11px] text-foreground/60 mt-[5px] italic leading-relaxed">"{s.note}"</div>}
              </div>
            ))}
            <button className="w-full mt-2.5 py-2 rounded-lg bg-card border border-border font-heading text-[11px] font-bold hover:border-primary/35 transition-all">
              Voir toutes (12) →
            </button>
          </GHCard>

          <GHCard title="📝 Note de session" className="mt-3.5">
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-[9px] p-3 text-foreground text-xs outline-none resize-none min-h-[80px] focus:border-primary/35 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/60"
              placeholder="Vos notes après la session : objectifs, actions à faire, points clés..."
            />
            <button className="w-full mt-2.5 py-2.5 rounded-lg bg-primary text-primary-foreground font-heading text-xs font-bold hover:bg-primary-hover transition-all">
              Sauvegarder
            </button>
          </GHCard>
        </div>
      </div>
    </motion.div>
  );
}
