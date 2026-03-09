import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    description: "Pour démarrer et explorer la plateforme",
    icon: Zap,
    highlighted: false,
    cta: "Commencer gratuitement",
    features: [
      "Profil public personnalisé",
      "5 connexions par mois",
      "Accès au fil d'actualité",
      "1 objectif SMART",
      "Participation aux événements gratuits",
      "Badges de progression",
    ],
    excluded: [
      "Coaching illimité",
      "Pitch Deck Builder avancé",
      "Fundraising Tracker",
      "Analytics avancés",
    ],
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les entrepreneurs ambitieux",
    icon: Crown,
    highlighted: true,
    badge: "Populaire",
    cta: "Passer à Pro",
    features: [
      "Tout le plan Gratuit",
      "Connexions illimitées",
      "Coaching : 5 sessions/mois",
      "Pitch Deck Builder complet",
      "Fundraising Tracker",
      "Objectifs SMART illimités",
      "Cercles privés (3 max)",
      "Analytics de base",
      "Matching intelligent prioritaire",
      "Support prioritaire",
    ],
    excluded: [
      "API & intégrations",
      "Tableau de bord d'équipe",
    ],
  },
  {
    name: "Business",
    price: "79€",
    period: "/mois",
    description: "Pour les équipes et structures",
    icon: Building2,
    highlighted: false,
    cta: "Contacter l'équipe",
    features: [
      "Tout le plan Pro",
      "Coaching illimité",
      "Cercles privés illimités",
      "Analytics avancés & export",
      "Tableau de bord d'équipe (5 membres)",
      "API & intégrations tierces",
      "Branding personnalisé",
      "Manager de compte dédié",
      "Onboarding personnalisé",
      "SLA garanti",
    ],
    excluded: [],
  },
];

export default function PricingPage() {
  usePageMeta({
    title: "Tarifs — GrowHubLink",
    description: "Choisissez le plan adapté à votre ambition. Gratuit, Pro ou Business.",
  });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
          <button onClick={() => navigate("/welcome")} className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg md:text-xl font-bold">
              Grow<span className="text-primary">Hub</span>Link
            </span>
          </button>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold hover:bg-primary-hover transition-colors"
            >
              <span className="hidden md:inline">S'inscrire</span>
              <span className="md:hidden">Inscription</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-4 md:mb-6">
              <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" /> Tarifs transparents
            </div>
            <h1 className="font-heading text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 md:mb-4 px-2">
              Un plan pour chaque <span className="text-primary">ambition</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Commencez gratuitement, évoluez quand vous êtes prêt. Pas de surprise, pas d'engagement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-5 md:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-primary bg-card shadow-[var(--shadow-glow)]"
                  : "border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <plan.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg md:text-xl font-extrabold mb-1">{plan.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4 md:mb-6">
                <span className="font-heading text-3xl md:text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground text-xs md:text-sm">{plan.period}</span>
              </div>

              <button
                onClick={() => navigate("/auth")}
                className={`w-full rounded-xl py-2.5 md:py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all mb-5 md:mb-8 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-glow"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta} <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>

              <div className="space-y-2.5 md:space-y-3 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm">{f}</span>
                  </div>
                ))}
                {plan.excluded.map((f) => (
                  <div key={f} className="flex items-start gap-2 opacity-40">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm line-through">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-xl md:text-3xl font-extrabold text-center mb-6 md:mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement." },
              { q: "Y a-t-il un engagement ?", a: "Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment." },
              { q: "Comment fonctionne le paiement ?", a: "Le paiement se fait via PayPal de manière sécurisée. Vous serez facturé mensuellement." },
              { q: "Le plan Gratuit est-il vraiment gratuit ?", a: "Oui ! Le plan Gratuit n'a pas de durée limitée et vous donne accès aux fonctionnalités essentielles." },
              { q: "Puis-je obtenir un remboursement ?", a: "Oui, nous offrons un remboursement complet dans les 14 premiers jours après votre souscription." },
            ].map((faq) => (
              <details key={faq.q} className="bg-card border border-border rounded-xl group">
                <summary className="px-4 md:px-6 py-3 md:py-4 font-heading text-xs md:text-sm font-bold cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg ml-2 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-xs md:text-sm text-muted-foreground">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold">GrowHubLink</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GrowHubLink. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
