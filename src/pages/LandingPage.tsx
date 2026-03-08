import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket, Users, Zap, BarChart3, BookOpen, DollarSign, Calendar,
  MessageSquare, Award, Target, ArrowRight, Star, Shield, Globe,
  CheckCircle2, Crown, Sparkles, TrendingUp, Play
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const features = [
  { icon: Users, title: "Networking Intelligent", desc: "Matching par compétences, secteur et objectifs. Trouvez les bons profils en quelques clics.", tag: "IA" },
  { icon: Zap, title: "Coaching Certifié", desc: "Sessions en visio avec des experts triés sur le volet. Réservez, évaluez, progressez.", tag: "Live" },
  { icon: BookOpen, title: "Pitch Deck Builder", desc: "Créez des présentations investisseurs percutantes avec templates et mode plein écran.", tag: "Pro" },
  { icon: DollarSign, title: "Fundraising Tracker", desc: "Pipeline d'investisseurs, suivi des rounds et next-steps — tout en un seul endroit.", tag: "CRM" },
  { icon: Calendar, title: "Événements & Webinars", desc: "Meetups, ateliers, démo days — participez ou organisez vos propres événements.", tag: "Live" },
  { icon: BarChart3, title: "Analytics & KPIs", desc: "Tableaux de bord, progression et impact mesurés en temps réel.", tag: "Data" },
];

const testimonials = [
  { name: "Sophie Martin", role: "CEO, TechFlow", text: "GrowHubLink m'a permis de trouver mon co-fondateur et de lever 500K€ en 3 mois. L'outil de matching est incroyablement précis.", avatar: "SM", rating: 5 },
  { name: "Marc Dubois", role: "Mentor & Investisseur", text: "La plateforme parfaite pour accompagner des startups prometteuses. Le coaching hub est un game-changer.", avatar: "MD", rating: 5 },
  { name: "Claire Bernard", role: "Investisseuse, VCap", text: "Le deal flow est enfin centralisé. Je gagne un temps fou sur le sourcing et le suivi de mes participations.", avatar: "CB", rating: 5 },
  { name: "Amadou Diallo", role: "Fondateur, PaySahel", text: "Grâce aux warm intros, j'ai rencontré 3 investisseurs qualifiés en une semaine. Impossible sur LinkedIn.", avatar: "AD", rating: 5 },
  { name: "Léa Nguyen", role: "Freelance UX", text: "En tant que freelance, j'ai trouvé mes meilleurs clients via le networking intelligent. Mon CA a doublé en 6 mois.", avatar: "LN", rating: 5 },
  { name: "Ousmane Konaté", role: "Directeur, TechHub Dakar", text: "L'écosystème parfait pour connecter startups africaines et investisseurs internationaux.", avatar: "OK", rating: 5 },
];

const stats = [
  { value: "10K+", label: "Entrepreneurs actifs", icon: Users },
  { value: "500+", label: "Mentors & Coachs", icon: Award },
  { value: "2M€", label: "Levés via la plateforme", icon: TrendingUp },
  { value: "98%", label: "Taux de satisfaction", icon: Star },
];

const roles = [
  { title: "Startup", desc: "Lancez, structurez et scalez votre business", emoji: "🚀", features: ["Pitch Deck Builder", "Fundraising Tracker", "Matching investisseurs"], cta: "Pour les startups" },
  { title: "Mentor", desc: "Accompagnez et monétisez votre expertise", emoji: "🎯", features: ["Profil coach", "Réservation sessions", "Avis vérifiés"], cta: "Pour les mentors" },
  { title: "Investisseur", desc: "Sourcez et suivez votre deal flow", emoji: "💰", features: ["Pipeline startups", "Due diligence", "Warm intros"], cta: "Pour les investisseurs" },
  { title: "Freelance", desc: "Trouvez des missions et développez votre réseau", emoji: "💻", features: ["Visibilité profil", "Recommandations", "Events networking"], cta: "Pour les freelances" },
  { title: "Étudiant", desc: "Apprenez, connectez et préparez votre lancement", emoji: "🎓", features: ["Coaching gratuit", "Cercles thématiques", "Challenges"], cta: "Pour les étudiants" },
  { title: "Corporate", desc: "Open innovation et partenariats stratégiques", emoji: "🏢", features: ["Sourcing startups", "Pages entreprise", "Events privés"], cta: "Pour les corporates" },
];

const successStories = [
  {
    title: "De 0 à 500K€ levés en 3 mois",
    company: "TechFlow",
    sector: "SaaS",
    description: "Sophie a utilisé le Pitch Deck Builder et le réseau d'investisseurs de GrowHubLink pour structurer sa levée de fonds seed.",
    metrics: [{ label: "Levée", value: "500K€" }, { label: "Investisseurs contactés", value: "12" }, { label: "Temps", value: "3 mois" }],
    quote: "Le matching m'a connectée directement aux bons investisseurs, sans intermédiaire.",
  },
  {
    title: "100 startups accompagnées en 1 an",
    company: "MentorPro",
    sector: "Consulting",
    description: "Marc a multiplié par 5 son impact en utilisant le Coaching Hub pour organiser ses sessions et recevoir des avis vérifiés.",
    metrics: [{ label: "Startups", value: "100+" }, { label: "Satisfaction", value: "4.9/5" }, { label: "Revenu", value: "x3" }],
    quote: "GrowHubLink a professionnalisé mon activité de mentorat comme aucun autre outil.",
  },
];

const steps = [
  { num: "01", title: "Créez votre profil", desc: "Renseignez vos compétences, votre secteur et vos objectifs en 2 minutes." },
  { num: "02", title: "Connectez-vous", desc: "Notre algorithme vous recommande les profils les plus pertinents." },
  { num: "03", title: "Accélérez", desc: "Coaching, événements, outils — tout pour aller plus vite, plus loin." },
];

export default function LandingPage() {
  usePageMeta({ title: "GrowHubLink — L'écosystème entrepreneurial", description: "Plateforme tout-en-un pour entrepreneurs : networking, coaching, pitch deck, fundraising et plus." });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">Grow<span className="text-primary">Hub</span>Link</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-foreground transition-colors">Comment ça marche</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a>
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Tarifs</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Connexion
            </button>
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-xl px-5 py-2 text-sm font-bold hover:bg-primary-hover transition-colors">
              Commencer gratuitement
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Plateforme #1 pour entrepreneurs en Afrique & Europe
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-[72px] font-extrabold leading-[1.08] mb-6">
              Construisez votre empire<br />
              <span className="text-primary">entrepreneurial</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Networking intelligent, coaching certifié, pitch deck, levée de fonds — une plateforme unique qui réunit tout l'écosystème startup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 font-heading text-base font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all">
                Créer mon compte gratuit <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="bg-card border border-border text-foreground rounded-2xl px-8 py-4 font-heading text-base font-bold hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Voir la démo
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Gratuit pour toujours · Pas de carte bancaire requise</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-heading text-3xl md:text-4xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
              Fonctionnalités
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-4">Tout ce dont vous avez <span className="text-primary">besoin</span></h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Des outils puissants conçus pour chaque étape de votre parcours entrepreneurial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{f.tag}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Comment ça <span className="text-primary">marche</span> ?</h2>
            <p className="text-muted-foreground text-lg">3 étapes pour accélérer votre croissance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center">
                <div className="font-heading text-5xl font-extrabold text-primary/20 mb-4">{s.num}</div>
                <h3 className="font-heading text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Une plateforme, <span className="text-primary">10 profils</span></h2>
            <p className="text-muted-foreground text-lg">Chaque rôle bénéficie d'une expérience adaptée à ses besoins.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {roles.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{r.emoji}</div>
                <div className="font-heading text-base font-bold mb-1">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Ils nous font <span className="text-primary">confiance</span></h2>
            <p className="text-muted-foreground">+10 000 entrepreneurs utilisent GrowHubLink au quotidien</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-7">
                <div className="flex gap-1 mb-4">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-primary fill-primary" />)}</div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border-2 border-primary/20 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-3">
                Des plans adaptés à votre <span className="text-primary">ambition</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Commencez gratuitement, passez à Pro quand vous êtes prêt. Paiement sécurisé via PayPal.</p>
              <button onClick={() => navigate("/pricing")} className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 font-heading text-base font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-2">
                Voir les tarifs <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Shield, text: "Données chiffrées de bout en bout" },
              { icon: Globe, text: "Infrastructure RGPD conforme" },
              { icon: CheckCircle2, text: "Support réactif 7j/7" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-6">
            Prêt à accélérer <span className="text-primary">votre croissance</span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">Rejoignez des milliers d'entrepreneurs qui construisent l'avenir.</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-10 py-4 font-heading text-lg font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-3">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">Gratuit · Sans engagement · Sans carte bancaire</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold">GrowHubLink</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">Tarifs</button>
              <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GrowHubLink. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
