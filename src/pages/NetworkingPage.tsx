import { motion } from "framer-motion";
import { MetricCard, GHCard, Tag, SectionHeader } from "@/components/ui-custom";

interface NetworkingPageProps {
  onNavigate: (page: string) => void;
}

const suggestions = [
  { initials: "JC", name: "Julia Chen", role: "Coach · Ex-COO Doctolib", match: 97, tag: "⭐ 4.9", gradient: "from-[#200a30] to-[#A064FF]" },
  { initials: "TM", name: "Thomas M.", role: "Investisseur · Kima", match: 94, tag: "💰 Seed", gradient: "from-[#1a1a30] to-[#6060D0]" },
  { initials: "LB", name: "Laure Bernard", role: "Fondatrice NutriTech", match: 92, tag: "🚀 Levée", gradient: "from-[#1a3a10] to-[#5CBF00]" },
  { initials: "PD", name: "Pierre Dumont", role: "Angel · 15 exits", match: 89, tag: "💎 B2B", gradient: "from-[#301a08] to-[#D06020]" },
  { initials: "AS", name: "Aïda Saïdi", role: "Growth Freelance", match: 87, tag: "📈 CAC", gradient: "from-[#0a1a30] to-[#204080]" },
  { initials: "MF", name: "Marc Fontaine", role: "Mentor · Ex-Accor", match: 85, tag: "🎓 50+", gradient: "from-[#1a300a] to-[#60A020]" },
  { initials: "NK", name: "Nabil Khouya", role: "CTO · IA & Data", match: 83, tag: "⚡ Tech", gradient: "from-[#200a30] to-[#8040C0]" },
  { initials: "EV", name: "Emma Viallet", role: "VCM · Partech", match: 81, tag: "🏦 Series A", gradient: "from-[#301a20] to-[#C04060]" },
];

const requests = [
  { initials: "SB", name: "Sarah B.", role: "Investisseuse · Eurazeo Growth", gradient: "from-[#1a0a30] to-[#6040C0]" },
  { initials: "RN", name: "Romain N.", role: "Fondateur HealthAI · Seed €1.2M", gradient: "from-[#1a2a08] to-[#5CBF00]" },
  { initials: "CL", name: "Charlotte L.", role: "CMO Freelance · Ex-Blablacar", gradient: "from-[#301a08] to-[#D06020]" },
];

export default function NetworkingPage({ onNavigate }: NetworkingPageProps) {
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
            Matching IA selon votre profil, secteur et objectifs. Connexions qualifiées garanties.
          </p>
          <div className="flex gap-5 mt-4">
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">127</div><div className="text-[11px] text-muted-foreground">Connexions</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">94%</div><div className="text-[11px] text-muted-foreground">Taux accept.</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">2 400+</div><div className="text-[11px] text-muted-foreground">Membres</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">18</div><div className="text-[11px] text-muted-foreground">En attente</div></div>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button className="h-[34px] px-3 rounded-lg bg-primary/10 border border-primary/35 text-xs font-semibold text-primary font-heading">Suggestions IA</button>
        <button className="h-[34px] px-3 rounded-lg bg-card border border-border text-xs font-semibold text-foreground/70 font-heading hover:bg-primary/10 hover:border-primary/35 hover:text-primary transition-all">Mes connexions (127)</button>
        <button className="h-[34px] px-3 rounded-lg bg-card border border-border text-xs font-semibold text-foreground/70 font-heading hover:bg-primary/10 hover:border-primary/35 hover:text-primary transition-all">Demandes reçues (3)</button>
        <button className="h-[34px] px-3 rounded-lg bg-card border border-border text-xs font-semibold text-foreground/70 font-heading hover:bg-primary/10 hover:border-primary/35 hover:text-primary transition-all">Favoris</button>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {suggestions.map((s) => (
          <GHCard key={s.initials} className="text-center cursor-pointer">
            <div className={`w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br ${s.gradient} flex items-center justify-center font-heading text-base font-extrabold text-white mx-auto mb-2.5`}>
              {s.initials}
            </div>
            <div className="text-[13px] font-bold mb-[2px]">{s.name}</div>
            <div className="text-[11px] text-muted-foreground mb-1.5">{s.role}</div>
            <Tag>{s.tag}</Tag>
            <div className="text-[11px] font-bold text-primary my-2.5">Match {s.match}%</div>
            <div className="flex gap-1.5 justify-center">
              <button className="flex-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold hover:bg-primary-hover transition-all">Connecter</button>
              <button className="px-2 py-1 rounded-lg bg-card border border-border font-heading text-[10px] font-bold hover:border-primary/35 transition-all">👁️</button>
            </div>
          </GHCard>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-[18px]">
        <GHCard title="⏳ Demandes reçues">
          {requests.map((r) => (
            <div key={r.initials} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-[10px] mb-2">
              <div className={`w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br ${r.gradient} flex items-center justify-center font-heading text-xs font-extrabold text-white flex-shrink-0`}>
                {r.initials}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">{r.role}</div>
              </div>
              <div className="flex gap-1.5">
                <button className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-heading text-[10px] font-bold">Accepter</button>
                <button className="px-2.5 py-1 rounded-lg bg-card border border-border font-heading text-[10px] font-bold">Ignorer</button>
              </div>
            </div>
          ))}
        </GHCard>

        <GHCard title="🌐 Votre réseau">
          <div className="flex flex-col">
            {[
              ["Connexions actives", "127"],
              ["Vues de profil (mois)", "342"],
              ["Score réseau", "84/100"],
              ["Secteur dominant", "B2B SaaS"],
              ["Pays représentés", "12"],
              ["Taux d'acceptation", "94%"],
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
