import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Zap, BarChart3, BookOpen, DollarSign,
  MessageSquare, Award, ArrowRight, Star, Shield, Globe,
  CheckCircle2, Crown, Sparkles, TrendingUp, Play, Target, Newspaper, Handshake
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePlatformStats, usePlatformTestimonials } from "@/hooks/usePlatformStats";

const features = [
  { icon: Users, title: "Networking Intelligent", desc: "Matching par compétences, secteur et objectifs. Connectez-vous aux bons profils du secteur privé africain.", tag: "IA" },
  { icon: Zap, title: "Coaching Hub", desc: "Réservez des sessions avec des experts certifiés, notez et évaluez vos coachs.", tag: "Live" },
  { icon: Target, title: "Objectifs SMART", desc: "Définissez et suivez vos objectifs depuis votre tableau de bord personnel.", tag: "Dashboard" },
  { icon: BookOpen, title: "Pitch Deck Builder", desc: "Créez des présentations investisseurs percutantes avec templates et mode plein écran.", tag: "Pro" },
  { icon: DollarSign, title: "Fundraising Tracker", desc: "Pipeline d'investisseurs, suivi des rounds et next-steps — tout en un seul endroit.", tag: "CRM" },
  { icon: Newspaper, title: "Fil d'actualité", desc: "Partagez vos actualités, réagissez et engagez votre réseau en temps réel.", tag: "Feed" },
  { icon: MessageSquare, title: "Messagerie Temps Réel", desc: "Échangez directement avec vos contacts, prospects et coachs en toute fluidité.", tag: "Chat" },
  { icon: BarChart3, title: "Analytics & KPIs", desc: "Tableaux de bord personnalisés, progression et impact mesurés en temps réel.", tag: "Data" },
];

const roles = [
  { title: "Startup", desc: "Lancez, structurez et scalez votre business", emoji: "🚀", features: ["Pitch Deck Builder", "Fundraising Tracker", "Objectifs SMART"], cta: "Pour les startups" },
  { title: "Coach / Mentor", desc: "Accompagnez et monétisez votre expertise", emoji: "🎯", features: ["Profil public certifié", "Réservation de sessions", "Avis & notations"], cta: "Pour les coachs" },
  { title: "Investisseur", desc: "Sourcez et suivez votre deal flow africain", emoji: "💰", features: ["Pipeline startups", "Fundraising Tracker", "Networking ciblé"], cta: "Pour les investisseurs" },
  { title: "Freelance", desc: "Trouvez des missions et développez votre réseau", emoji: "💻", features: ["Profil public visible", "Messagerie directe", "Fil d'actualité"], cta: "Pour les freelances" },
  { title: "Étudiant", desc: "Préparez votre carrière dans le privé", emoji: "🎓", features: ["Coaching accessible", "Networking sectoriel", "Tableau de bord objectifs"], cta: "Pour les étudiants" },
  { title: "Corporate", desc: "Open innovation et partenariats stratégiques", emoji: "🏢", features: ["Sourcing de talents", "Pages entreprise", "Matching partenaires"], cta: "Pour les corporates" },
];

const steps = [
  { num: "01", title: "Créez votre profil", desc: "Renseignez vos compétences, votre secteur et vos objectifs en 2 minutes." },
  { num: "02", title: "Connectez-vous", desc: "Notre algorithme vous recommande les profils les plus pertinents du secteur privé africain." },
  { num: "03", title: "Accélérez", desc: "Coaching, pitch deck, fundraising, messagerie — tout pour aller plus vite, plus loin." },
];

function formatStatValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K+`;
  return `${value}`;
}

export default function LandingPage() {
  usePageMeta({ title: "GrowHubLink — L'écosystème du secteur privé en Afrique", description: "Plateforme tout-en-un pour les acteurs du secteur privé en Afrique : networking, coaching, pitch deck, fundraising et plus." });
  const navigate = useNavigate();
  const { data: platformStats } = usePlatformStats();
  const { data: testimonials } = usePlatformTestimonials();

  const stats = [
    { value: formatStatValue(platformStats?.totalMembers ?? 0), label: "Membres inscrits", icon: Users },
    { value: formatStatValue(platformStats?.totalCoaches ?? 0), label: "Coachs actifs", icon: Award },
    { value: formatStatValue(platformStats?.totalConnections ?? 0), label: "Connexions créées", icon: Handshake },
    { value: formatStatValue(platformStats?.totalEvents ?? 0), label: "Événements organisés", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg md:text-xl font-bold">Grow<span className="text-primary">Hub</span>Link</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-foreground transition-colors">Comment ça marche</a>
            {testimonials && testimonials.length > 0 && (
              <a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a>
            )}
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Tarifs</button>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={() => navigate("/auth")} className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Connexion
            </button>
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold hover:bg-primary-hover transition-colors whitespace-nowrap">
              <span className="hidden md:inline">Commencer gratuitement</span>
              <span className="md:hidden">S'inscrire</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 md:pt-28 pb-14 md:pb-20 px-4 md:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-primary/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-6 md:mb-8">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> Plateforme pour entrepreneurs en Afrique
            </div>
            <h1 className="font-heading text-[32px] sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold leading-[1.08] mb-5 md:mb-6 px-2">
              Construisez votre empire<br />
              <span className="text-primary">entrepreneurial</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
              Networking intelligent, coaching certifié, pitch deck, levée de fonds — une plateforme unique pour le secteur privé africain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
              <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all">
                Créer mon compte gratuit <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="bg-card border border-border text-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Découvrir
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Gratuit pour toujours · Pas de carte bancaire requise</p>
          </motion.div>
        </div>
      </section>

      {/* Stats - only show if we have real data */}
      {platformStats && (platformStats.totalMembers > 0 || platformStats.totalCoaches > 0) && (
        <section className="py-10 md:py-14 border-y border-border/50 bg-muted/30">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-4 md:px-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <s.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="font-heading text-2xl md:text-4xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
              Fonctionnalités
            </div>
            <h2 className="font-heading text-2xl md:text-5xl font-extrabold mb-4">Tout ce dont vous avez <span className="text-primary">besoin</span></h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">Des outils puissants conçus pour chaque étape de votre parcours.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 md:p-7 hover:border-primary/30 hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{f.tag}</div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="font-heading text-base md:text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">Comment ça <span className="text-primary">marche</span> ?</h2>
            <p className="text-muted-foreground text-sm md:text-lg">3 étapes pour accélérer votre croissance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-card md:bg-transparent border border-border md:border-0 rounded-2xl p-5 md:p-0 text-center">
                <div className="font-heading text-4xl md:text-5xl font-extrabold text-primary/20 mb-3 md:mb-4">{s.num}</div>
                <h3 className="font-heading text-base md:text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">Une plateforme, <span className="text-primary">6 profils</span></h2>
            <p className="text-muted-foreground text-sm md:text-lg">Chaque rôle bénéficie d'une expérience et d'outils adaptés.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {roles.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="text-2xl md:text-3xl mb-3">{r.emoji}</div>
                <div className="font-heading text-base md:text-lg font-bold mb-1">{r.title}</div>
                <div className="text-xs md:text-sm text-muted-foreground mb-4">{r.desc}</div>
                <ul className="space-y-1.5 mb-4">
                  {r.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground/70">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/auth")} className="w-full bg-primary/10 text-primary rounded-xl py-2.5 text-xs font-bold hover:bg-primary/20 transition-colors">
                  {r.cta} →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - only show if real reviews exist */}
      {testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">Ils nous font <span className="text-primary">confiance</span></h2>
              <p className="text-muted-foreground text-sm md:text-base">Avis vérifiés de nos membres</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={`${t.name}-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-5 md:p-7">
                  <div className="flex gap-1 mb-3 md:mb-4">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary fill-primary" />)}</div>
                  <p className="text-xs md:text-sm text-foreground/80 leading-relaxed mb-4 md:mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">{t.avatar}</div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing CTA */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border-2 border-primary/20 rounded-3xl p-7 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-xl md:text-4xl font-extrabold mb-3">
                Des plans adaptés à votre <span className="text-primary">ambition</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-6 md:mb-8 max-w-lg mx-auto">Commencez gratuitement, passez à Pro quand vous êtes prêt.</p>
              <button onClick={() => navigate("/pricing")} className="bg-primary text-primary-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-2">
                Voir les tarifs <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 md:py-16 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-5 md:gap-8 text-xs md:text-sm text-muted-foreground">
            {[
              { icon: Shield, text: "Données chiffrées de bout en bout" },
              { icon: Globe, text: "Infrastructure RGPD conforme" },
              { icon: CheckCircle2, text: "Support réactif 7j/7" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-28 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-5xl font-extrabold mb-5 md:mb-6">
            Prêt à accélérer <span className="text-primary">votre croissance</span> ?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10">Rejoignez les entrepreneurs qui construisent l'avenir du continent.</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-8 md:px-10 py-3.5 md:py-4 font-heading text-base md:text-lg font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-3">
            Commencer maintenant <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">Gratuit · Sans engagement · Sans carte bancaire</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold">GrowHubLink</span>
            </div>
            <div className="flex gap-5 md:gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Tarifs</button>
              <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GrowHubLink. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}
