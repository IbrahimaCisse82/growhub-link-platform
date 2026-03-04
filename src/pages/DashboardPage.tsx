import { motion } from "framer-motion";
import { MetricCard, ProgressBar, GHCard, Tag, SectionHeader, ActivityItem, StatRow } from "@/components/ui-custom";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-32 w-56 h-56 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Startup Dashboard — Growth Command Center
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Bonjour Sophie,<br /><span className="text-primary">accélérez votre croissance</span> 🚀
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px] mb-6">
            Votre écosystème est actif. Coach disponible demain 14h · 3 événements cette semaine · 2 investisseurs ont consulté votre profil.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={() => onNavigate("pitchdeck")} className="inline-flex items-center gap-[7px] border-none rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-primary text-primary-foreground hover:bg-primary-hover hover:translate-y-[-1px] hover:shadow-glow">
              📊 Pitch Deck Builder
            </button>
            <button onClick={() => onNavigate("fundraising")} className="inline-flex items-center gap-[7px] rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-card text-foreground border border-border hover:border-primary/35 hover:bg-secondary">
              💰 Fundraising Tracker
            </button>
            <button onClick={() => onNavigate("coaching")} className="inline-flex items-center gap-[7px] rounded-[10px] px-5 py-2.5 font-heading text-[13px] font-bold cursor-pointer transition-all bg-card text-foreground border border-border hover:border-primary/35 hover:bg-secondary">
              ✍️ Coaching Hub
            </button>
          </div>

          <div className="flex gap-7 mt-7 pt-6 border-t border-border flex-wrap">
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]"><span className="text-primary">€128K</span><span className="text-foreground/50 text-base">/an</span></div><div className="text-[11px] text-muted-foreground font-medium">ARR estimé</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">2.4%</div><div className="text-[11px] text-muted-foreground font-medium">CAC moyen</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">48<span className="text-primary text-base">h</span></div><div className="text-[11px] text-muted-foreground font-medium">Crédits coaching</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">127</div><div className="text-[11px] text-muted-foreground font-medium">Connexions réseau</div></div>
            <div><div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">4.8<span className="text-primary text-base">★</span></div><div className="text-[11px] text-muted-foreground font-medium">NPS coaching</div></div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3.5 mb-[18px]">
        <MetricCard icon="📈" value="€128K" label="ARR estimé" badge="▲ +23%" badgeType="up" />
        <MetricCard icon="👥" value="412" label="Clients actifs" badge="▲ +18%" badgeType="up" />
        <MetricCard icon="🎯" value="73%" label="Objectifs atteints" badge="▲ +5pts" badgeType="up" />
        <MetricCard icon="💰" value="4.2x" label="LTV/CAC" badge="▼ -0.3" badgeType="down" />
      </div>

      {/* Objectives + Coaching */}
      <div className="grid grid-cols-2 gap-[18px] mb-[18px]">
        <GHCard title="Objectifs Q1 2025" headerRight={<Tag variant="green">En cours</Tag>}>
          <ProgressBar label="Levée Seed 500K€" value="68%" percentage={68} />
          <ProgressBar label="500 utilisateurs actifs" value="82%" percentage={82} />
          <ProgressBar label="PMF Validation" value="45%" percentage={45} />
          <ProgressBar label="Équipe 5 personnes" value="60%" percentage={60} />
          <ProgressBar label="MRR 15K€" value="91%" percentage={91} />
        </GHCard>

        <GHCard title="Coaching Progress" headerRight={
          <button onClick={() => onNavigate("coaching")} className="text-xs text-primary font-semibold hover:opacity-70">Voir →</button>
        }>
          {/* Credits */}
          <div className="bg-gradient-to-br from-secondary to-card border border-primary/20 rounded-2xl p-4 mb-3.5 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/10 rounded-full blur-2xl" />
            <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-[7px]">Crédits restants</div>
            <div className="font-heading text-4xl font-extrabold text-primary leading-none mb-[3px]">48h</div>
            <div className="h-[7px] bg-secondary rounded mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-ghgreen-dark to-primary rounded" style={{ width: "62%" }} />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>27h utilisées</span>
              <span>Expire 31 Mai</span>
            </div>
          </div>

          {/* Next Session */}
          <div className="flex gap-3.5 items-center bg-card border border-border rounded-xl p-3.5 mb-2.5">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-sm font-extrabold text-primary-foreground flex-shrink-0">
              JC
            </div>
            <div className="flex-1">
              <div className="font-heading text-[13px] font-bold mb-[2px]">Julia Chen — Coach Senior</div>
              <div className="text-[11px] text-muted-foreground mb-1.5">Stratégie levée de fonds Seed</div>
              <div className="flex gap-[5px] flex-wrap">
                <Tag variant="green">Demain 14:00</Tag>
                <Tag>60 min</Tag>
                <Tag>Zoom</Tag>
              </div>
            </div>
            <button className="px-3.5 py-[7px] rounded-lg bg-primary text-primary-foreground font-heading text-xs font-bold hover:bg-primary-hover transition-all">
              Rejoindre
            </button>
          </div>

          <StatRow label="Sessions terminées" value="12" />
          <StatRow label="Objectifs SMART atteints" value="8 / 11" />
          <StatRow label="Satisfaction moyenne" value="4.8 ★" />
        </GHCard>
      </div>

      {/* Activity Feed */}
      <SectionHeader title="Activité récente" />
      <GHCard>
        <ActivityItem icon="🤝" iconBg="bg-primary/10" time="Il y a 12 min"
          action={<button className="px-3 py-1.5 rounded-lg bg-card border border-border font-heading text-xs font-bold hover:border-primary/35 transition-all">Contacter</button>}>
          <strong>Thomas Moreau</strong> (Investisseur) a consulté votre pitch deck
        </ActivityItem>
        <ActivityItem icon="📅" iconBg="bg-ghblue/12" time="Il y a 1h"
          action={<Tag variant="blue">Demain</Tag>}>
          Rappel : Session coaching avec <strong>Julia Chen</strong> demain 14h
        </ActivityItem>
        <ActivityItem icon="🏆" iconBg="bg-ghgold/12" time="Hier 16:30"
          action={<Tag variant="green">Complété</Tag>}>
          Objectif <strong>"100 connexions réseau"</strong> atteint !
        </ActivityItem>
        <ActivityItem icon="💬" iconBg="bg-ghpurple/12" time="Hier 14:45"
          action={<button className="px-3 py-1.5 rounded-lg bg-card border border-border font-heading text-xs font-bold hover:border-primary/35 transition-all">Voir</button>}>
          <strong>Marie Laurent</strong> a commenté votre pitch deck
        </ActivityItem>
        <ActivityItem icon="📊" iconBg="bg-ghteal/12" time="Il y a 2j"
          action={<button className="px-3 py-1.5 rounded-lg bg-card border border-border font-heading text-xs font-bold hover:border-primary/35 transition-all">Télécharger</button>}>
          Rapport hebdomadaire <strong>Financial Dashboard</strong> disponible
        </ActivityItem>
      </GHCard>

      {/* News Feed Widget */}
      <div className="mt-[18px]">
        <SectionHeader title="🔥 Fil d'actualité — À la une" linkText="Voir tout →" onLink={() => onNavigate("feed")} />
        <div className="grid grid-cols-2 gap-3.5">
          <GHCard className="cursor-pointer" onClick={() => onNavigate("feed")}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#103050] to-ghblue flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0">MT</div>
              <div><div className="text-xs font-bold">Marie Touzet · 23 min</div><div className="text-[10px] text-muted-foreground">MedFlow · HealthTech</div></div>
              <Tag variant="green">💰 Levée</Tag>
            </div>
            <div className="text-xs text-foreground/70 leading-relaxed">🎉 <strong>MedFlow lève 1,8M€ Seed</strong> menée par Partech. Expansion EU + ×2 équipe R&D d'ici fin 2025.</div>
            <div className="text-[11px] text-muted-foreground mt-2">👏 142 félicitations · 💬 23</div>
          </GHCard>
          <GHCard className="cursor-pointer" onClick={() => onNavigate("feed")}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#200a30] to-ghpurple flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0">JC</div>
              <div><div className="text-xs font-bold">Julia Chen · 3h</div><div className="text-[10px] text-muted-foreground">Coach Expert</div></div>
              <Tag variant="purple">💡 Conseil</Tag>
            </div>
            <div className="text-xs text-foreground/70 leading-relaxed">💡 <strong>7 erreurs qui tuent votre pitch</strong> en 30 secondes — thread complet sur les patterns récurrents.</div>
            <div className="text-[11px] text-muted-foreground mt-2">❤️ 287 · 💬 64</div>
          </GHCard>
        </div>
      </div>
    </motion.div>
  );
}
