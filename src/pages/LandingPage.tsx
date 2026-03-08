import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket, Users, Zap, BarChart3, BookOpen, DollarSign, Calendar,
  MessageSquare, Award, Target, ArrowRight, Star, Shield, Globe,
  CheckCircle2
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const features = [
  { icon: Users, title: "Networking Intelligent", desc: "Connectez-vous avec les bons entrepreneurs, mentors et investisseurs grâce au matching par compétences." },
  { icon: Zap, title: "Coaching Certifié", desc: "Réservez des sessions avec des experts et recevez un accompagnement personnalisé." },
  { icon: BookOpen, title: "Pitch Deck Builder", desc: "Créez des présentations percutantes avec notre éditeur intégré et le mode plein écran." },
  { icon: DollarSign, title: "Fundraising Tracker", desc: "Gérez votre pipeline d'investisseurs et suivez chaque round de levée en temps réel." },
  { icon: Calendar, title: "Événements & Webinars", desc: "Participez à des meetups, ateliers et démo days pour accélérer votre croissance." },
  { icon: BarChart3, title: "Analytics Avancés", desc: "Tableaux de bord et KPIs pour piloter votre progression et mesurer votre impact." },
];

const testimonials = [
  { name: "Sophie Martin", role: "CEO, TechFlow", text: "GrowHubLink m'a permis de trouver mon co-fondateur et de lever 500K€ en 3 mois.", avatar: "SM" },
  { name: "Marc Dubois", role: "Mentor & Investisseur", text: "La plateforme parfaite pour accompagner des startups prometteuses et structurer mes sessions.", avatar: "MD" },
  { name: "Claire Bernard", role: "Investisseuse, VCap", text: "Le deal flow est enfin centralisé. Je gagne un temps fou sur le sourcing de startups.", avatar: "CB" },
];

const stats = [
  { value: "10K+", label: "Entrepreneurs" },
  { value: "500+", label: "Mentors & Coachs" },
  { value: "2M€", label: "Levés via la plateforme" },
  { value: "98%", label: "Satisfaction" },
];

const roles = [
  { title: "Startup", desc: "Lancez, structurez et scalez votre projet" },
  { title: "Mentor", desc: "Accompagnez et monétisez votre expertise" },
  { title: "Investisseur", desc: "Sourcez et suivez vos investissements" },
  { title: "Freelance", desc: "Trouvez des missions et développez votre réseau" },
  { title: "Étudiant", desc: "Apprenez et préparez votre futur projet" },
  { title: "Corporate", desc: "Innovez via l'open innovation" },
];

export default function LandingPage() {
  usePageMeta({ title: "GrowHubLink — L'écosystème entrepreneurial", description: "Plateforme tout-en-un pour entrepreneurs : networking, coaching, pitch deck, fundraising et plus." });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <a href="#roles" className="hover:text-foreground transition-colors">Profils</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-8">
              <Rocket className="w-3.5 h-3.5" /> Plateforme #1 pour entrepreneurs
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6">
              Tout l'écosystème startup<br />
              <span className="text-primary">dans une seule plateforme</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Networking, coaching, pitch deck, levée de fonds, événements — accélérez votre croissance avec les outils et la communauté qu'il vous faut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-8 py-4 font-heading text-base font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-glow transition-all">
                Créer mon compte gratuit <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="bg-secondary text-foreground rounded-2xl px-8 py-4 font-heading text-base font-bold hover:bg-secondary/80 transition-colors">
                Découvrir les fonctionnalités
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Des outils puissants conçus pour chaque étape de votre parcours entrepreneurial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
                className="bg-card border border-border rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg transition-all group">
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

      {/* Roles */}
      <section id="roles" className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Une plateforme, <span className="text-primary">10 profils</span></h2>
            <p className="text-muted-foreground text-lg">Chaque rôle bénéficie d'une expérience adaptée à ses besoins.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.title} className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-all">
                <div className="font-heading text-base font-bold mb-1">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-1 mb-4">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}</div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{t.avatar}</div>
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

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-6">
            Prêt à accélérer <span className="text-primary">votre croissance</span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">Rejoignez des milliers d'entrepreneurs qui construisent l'avenir.</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-10 py-4 font-heading text-lg font-bold hover:bg-primary-hover hover:shadow-glow transition-all inline-flex items-center gap-3">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold">GrowHubLink</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GrowHubLink. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
