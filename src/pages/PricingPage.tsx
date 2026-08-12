import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check, Zap, Crown, Building2, ArrowRight, Rocket, GraduationCap, Star,
  BriefcaseBusiness, Code2, Lightbulb, Landmark, ShieldCheck, Building,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "react-i18next";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: any;
  highlighted?: boolean;
  badge?: string;
  cta: string;
  features: string[];
  excluded: string[];
};

const PERSONA_ICONS: Record<string, any> = {
  startup: Rocket, etudiant: GraduationCap, aspirationnel: Star, professionnel: BriefcaseBusiness,
  freelance: Code2, mentor: Lightbulb, investor: Landmark, expert: ShieldCheck,
  incubateur: Building2, corporate: Building,
};
const PERSONA_ORDER = ["startup", "etudiant", "aspirationnel", "professionnel", "freelance", "mentor", "investor", "expert", "incubateur", "corporate"];

// Prix et icônes non traduits (données structurelles)
const PLAN_META: Record<string, Array<{ price: string; period: string; icon: any; highlighted?: boolean }>> = {
  startup: [
    { price: "0€", period: "/mois", icon: Zap },
    { price: "29€", period: "/mois", icon: Crown, highlighted: true },
    { price: "79€", period: "/mois", icon: Building2 },
  ],
  etudiant: [
    { price: "0€", period: "/mois", icon: GraduationCap, highlighted: true },
    { price: "9€", period: "/mois", icon: Crown },
  ],
  aspirationnel: [
    { price: "0€", period: "/mois", icon: Star, highlighted: true },
    { price: "15€", period: "/mois", icon: Crown },
  ],
  professionnel: [
    { price: "0€", period: "/mois", icon: Zap },
    { price: "19€", period: "/mois", icon: Crown, highlighted: true },
  ],
  freelance: [
    { price: "0€", period: "/mois", icon: Zap },
    { price: "25€", period: "/mois", icon: Crown, highlighted: true },
  ],
  mentor: [
    { price: "0€", period: "/mois", icon: Lightbulb, highlighted: true },
    { price: "Commission 15%", period: "", icon: Crown },
  ],
  investor: [
    { price: "Sur devis", period: "", icon: Landmark, highlighted: true },
  ],
  expert: [
    { price: "0€", period: "/mois", icon: ShieldCheck, highlighted: true },
    { price: "Commission 15%", period: "", icon: Crown },
  ],
  incubateur: [
    { price: "199€", period: "/mois", icon: Building2 },
    { price: "499€", period: "/mois", icon: Crown, highlighted: true },
    { price: "Sur devis", period: "", icon: Building },
  ],
  corporate: [
    { price: "Sur devis", period: "", icon: Building },
    { price: "Sur devis", period: "", icon: Crown, highlighted: true },
  ],
};

export default function PricingPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: t("pricing.meta.title"),
    description: t("pricing.meta.description"),
  });
  const navigate = useNavigate();
  const [persona, setPersona] = useState<string>("startup");

  const translatedPlans = t(`pricing.plans.${persona}`, { returnObjects: true, defaultValue: t("pricing.plans.startup", { returnObjects: true }) }) as Array<{
    name: string; description: string; badge?: string; cta: string; features: string[]; excluded: string[];
  }>;
  const meta = PLAN_META[persona] ?? PLAN_META.startup;
  const plans: Plan[] = translatedPlans.map((p, i) => ({
    ...p,
    price: meta[i]?.price ?? "",
    period: meta[i]?.period ?? "",
    icon: meta[i]?.icon ?? Zap,
    highlighted: meta[i]?.highlighted,
  }));
  const personaLabels = t("pricing.personas", { returnObjects: true }) as Record<string, string>;
  const faqItems = t("pricing.faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;

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
            <button onClick={() => navigate("/auth")} className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              {t("pricing.nav.login")}
            </button>
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold hover:bg-primary-hover transition-colors">
              <span className="hidden md:inline">{t("pricing.nav.signupFull")}</span>
              <span className="md:hidden">{t("pricing.nav.signupShort")}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-4 md:mb-6">
              <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t("pricing.hero.badge")}
            </div>
            <h1 className="font-heading text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 md:mb-4 px-2">
              {t("pricing.hero.title")} <span className="text-primary">{t("pricing.hero.titleHighlight")}</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              {t("pricing.hero.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Persona selector */}
      <section className="px-4 md:px-6 pb-6 md:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
            {PERSONA_ORDER.map((value) => {
              const Icon = PERSONA_ICONS[value];
              const active = persona === value;
              return (
                <button
                  key={value}
                  onClick={() => setPersona(value)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border text-xs md:text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {personaLabels[value]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 md:pb-24 px-4 md:px-6">
        <div className={`max-w-6xl mx-auto grid grid-cols-1 ${plans.length === 1 ? "md:grid-cols-1 max-w-md" : plans.length === 2 ? "md:grid-cols-2 max-w-3xl" : "md:grid-cols-3"} gap-4 md:gap-6 items-start`}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name + persona}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative rounded-2xl border-2 p-5 md:p-8 flex flex-col ${
                plan.highlighted ? "border-primary bg-card shadow-[var(--shadow-glow)]" : "border-border bg-card"
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
            {t("pricing.faq.title")}
          </h2>
          <div className="space-y-3 md:space-y-4">
            {faqItems.map((faq) => (
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
            © {new Date().getFullYear()} GrowHubLink. {t("pricing.footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
