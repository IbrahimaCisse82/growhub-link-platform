import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check, Zap, Crown, Building2, ArrowRight, Rocket, GraduationCap, Star,
  BriefcaseBusiness, Code2, Lightbulb, Landmark, ShieldCheck, Building,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

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

const PERSONAS = [
  { value: "startup", label: "Startup", icon: Rocket },
  { value: "etudiant", label: "Étudiant", icon: GraduationCap },
  { value: "aspirationnel", label: "Aspirationnel", icon: Star },
  { value: "professionnel", label: "Professionnel", icon: BriefcaseBusiness },
  { value: "freelance", label: "Freelance", icon: Code2 },
  { value: "mentor", label: "Mentor", icon: Lightbulb },
  { value: "investor", label: "Investisseur", icon: Landmark },
  { value: "expert", label: "Expert", icon: ShieldCheck },
  { value: "incubateur", label: "Incubateur", icon: Building2 },
  { value: "corporate", label: "Corporate", icon: Building },
];

const PLANS_BY_PERSONA: Record<string, Plan[]> = {
  startup: [
    { name: "Gratuit", price: "0€", period: "/mois", description: "Lancer votre startup", icon: Zap, cta: "Commencer",
      features: ["Profil startup public", "5 connexions /mois", "Fil d'actualité", "1 objectif SMART", "Événements gratuits"],
      excluded: ["Pitch Deck Builder", "Fundraising Tracker", "Coaching illimité"] },
    { name: "Pro", price: "29€", period: "/mois", description: "Scaler votre projet", icon: Crown, highlighted: true, badge: "Populaire", cta: "Passer à Pro",
      features: ["Connexions illimitées", "Pitch Deck complet", "Fundraising Tracker", "5 sessions coaching /mois", "Matching prioritaire", "Deal Rooms"],
      excluded: ["API & intégrations"] },
    { name: "Business", price: "79€", period: "/mois", description: "Équipe & croissance", icon: Building2, cta: "Contacter",
      features: ["Tout Pro", "Coaching illimité", "Tableau d'équipe (5)", "API & intégrations", "Account manager dédié", "SLA garanti"], excluded: [] },
  ],
  etudiant: [
    { name: "Étudiant", price: "0€", period: "/mois", description: "Gratuit avec email .edu", icon: GraduationCap, highlighted: true, badge: "100% gratuit", cta: "Vérifier mon école",
      features: ["Profil carrière public", "Suivi de candidatures illimité", "Accès aux mentors", "Événements & masterclass", "Templates CV / pitch", "Cours fondamentaux"],
      excluded: [] },
    { name: "Étudiant+", price: "9€", period: "/mois", description: "Pour aller plus loin", icon: Crown, cta: "Booster mon profil",
      features: ["Tout Étudiant", "Mentorat 1-to-1 prioritaire", "Coaching carrière 2 sessions /mois", "Mise en avant aux recruteurs", "Préparation entretiens"],
      excluded: [] },
  ],
  aspirationnel: [
    { name: "Découverte", price: "0€", period: "/mois", description: "Explorer l'écosystème", icon: Star, highlighted: true, cta: "Démarrer mon parcours",
      features: ["Parcours guidé personnalisé", "Bibliothèque de ressources", "Communauté & cercles ouverts", "Événements gratuits", "Suggestions de mentors"],
      excluded: ["Coaching individuel", "Outils startup avancés"] },
    { name: "Starter", price: "15€", period: "/mois", description: "Passer à l'action", icon: Crown, cta: "Lancer mon idée",
      features: ["Tout Découverte", "1 session coaching /mois", "Templates de validation d'idée", "Atelier Idea-to-MVP", "Accès cercles privés"],
      excluded: [] },
  ],
  professionnel: [
    { name: "Gratuit", price: "0€", period: "/mois", description: "Réseauter & apprendre", icon: Zap, cta: "Commencer",
      features: ["Profil professionnel public", "5 connexions /mois", "Fil d'actualité", "1 objectif de développement"],
      excluded: ["Coaching illimité", "Cours premium"] },
    { name: "Pro", price: "19€", period: "/mois", description: "Booster sa carrière", icon: Crown, highlighted: true, badge: "Populaire", cta: "Monter en compétences",
      features: ["Objectifs de développement illimités", "3 sessions coaching /mois", "Cours premium", "Networking prioritaire", "Analytics carrière"],
      excluded: [] },
  ],
  freelance: [
    { name: "Gratuit", price: "0€", period: "/mois", description: "Lancer son activité", icon: Zap, cta: "Commencer",
      features: ["Profil freelance", "Pipeline 5 missions max", "Marketplace de leads basique"],
      excluded: ["Pipeline illimité", "Mise en avant"] },
    { name: "Pro", price: "25€", period: "/mois", description: "Sécuriser ses missions", icon: Crown, highlighted: true, badge: "Populaire", cta: "Passer à Pro",
      features: ["Pipeline illimité", "Templates contrats & devis", "Mise en avant marketplace", "Coaching business 2/mois", "Analytics revenus"],
      excluded: [] },
  ],
  mentor: [
    { name: "Mentor", price: "0€", period: "/mois", description: "Partagez votre expérience", icon: Lightbulb, highlighted: true, badge: "Toujours gratuit", cta: "Devenir mentor",
      features: ["Profil mentor certifié", "Calendrier intégré", "Sessions illimitées", "Outils de suivi mentees", "Visibilité communauté"],
      excluded: [] },
    { name: "Mentor Pro", price: "Commission 15%", period: "", description: "Monétiser vos sessions", icon: Crown, cta: "Activer le payant",
      features: ["Tout Mentor", "Sessions payantes (vous gardez 85%)", "Paiements automatisés", "Reviews & badges premium", "Statistiques d'impact"],
      excluded: [] },
  ],
  investor: [
    { name: "Investisseur", price: "Sur devis", period: "", description: "Deal flow qualifié", icon: Landmark, highlighted: true, badge: "Sur invitation", cta: "Demander un accès",
      features: ["Deal flow filtré par thèse", "Deal Rooms privées", "Due diligence collaborative", "Accès aux pitch decks", "Statistiques portefeuille"],
      excluded: [] },
  ],
  expert: [
    { name: "Expert", price: "0€", period: "/mois", description: "Partagez votre expertise", icon: ShieldCheck, highlighted: true, cta: "Rejoindre",
      features: ["Profil expert sectoriel", "Publication d'analyses", "Réponses Q&A communauté", "Visibilité auprès des startups"],
      excluded: [] },
    { name: "Expert Pro", price: "Commission 15%", period: "", description: "Conseils payants", icon: Crown, cta: "Activer le payant",
      features: ["Tout Expert", "Missions de conseil payantes", "Workshops monétisés", "Mise en avant prioritaire"],
      excluded: [] },
  ],
  incubateur: [
    { name: "Starter", price: "199€", period: "/mois", description: "1 cohorte active", icon: Building2, cta: "Démarrer",
      features: ["1 cohorte active", "Jusqu'à 10 startups suivies", "Tableau de bord cohortes", "Event management"],
      excluded: ["Cohortes illimitées", "Branding personnalisé"] },
    { name: "Growth", price: "499€", period: "/mois", description: "Programmes multiples", icon: Crown, highlighted: true, badge: "Recommandé", cta: "Passer à Growth",
      features: ["Cohortes illimitées", "Suivi de KPIs avancé", "Branding personnalisé", "Mise en relation investisseurs", "Reporting LP"],
      excluded: [] },
    { name: "Enterprise", price: "Sur devis", period: "", description: "Réseau d'incubateurs", icon: Building, cta: "Contacter",
      features: ["Tout Growth", "Multi-sites & multi-équipes", "API & intégrations CRM", "Account manager dédié"],
      excluded: [] },
  ],
  corporate: [
    { name: "Discover", price: "Sur devis", period: "", description: "Premier challenge", icon: Building, cta: "Demander une démo",
      features: ["1 challenge actif", "Scouting de startups", "Deal Room privée", "Reporting innovation"],
      excluded: ["Challenges illimités", "Workshops"] },
    { name: "Innovation", price: "Sur devis", period: "", description: "Programme open innovation", icon: Crown, highlighted: true, badge: "Enterprise", cta: "Contacter",
      features: ["Challenges illimités", "POC & expérimentations", "Workshops dédiés", "Branding partenaire", "Reporting CSR & ESG", "Account manager senior"],
      excluded: [] },
  ],
};

export default function PricingPage() {
  usePageMeta({
    title: "Tarifs — GrowHubLink",
    description: "Choisissez le plan adapté à votre profil. Étudiant gratuit, Startup Pro, Corporate, Incubateur et plus.",
  });
  const navigate = useNavigate();
  const [persona, setPersona] = useState<string>("startup");

  const plans = PLANS_BY_PERSONA[persona] ?? PLANS_BY_PERSONA.startup;

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
              Connexion
            </button>
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold hover:bg-primary-hover transition-colors">
              <span className="hidden md:inline">S'inscrire</span>
              <span className="md:hidden">Inscription</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-6 md:pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-4 md:mb-6">
              <Crown className="w-3 h-3 md:w-3.5 md:h-3.5" /> Tarifs adaptés à chaque profil
            </div>
            <h1 className="font-heading text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 md:mb-4 px-2">
              Un plan pour chaque <span className="text-primary">profil</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Sélectionnez votre profil pour découvrir les plans qui vous correspondent vraiment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Persona selector */}
      <section className="px-4 md:px-6 pb-6 md:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const active = persona === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPersona(p.value)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border text-xs md:text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {p.label}
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
            Questions fréquentes
          </h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "Comment choisir le bon plan ?", a: "Sélectionnez votre profil ci-dessus pour voir uniquement les plans pensés pour vous. Vous pouvez aussi changer de profil à tout moment depuis votre espace." },
              { q: "Le plan Étudiant est-il vraiment gratuit ?", a: "Oui, avec une vérification via email .edu ou justificatif scolaire. Les fonctionnalités essentielles restent gratuites pendant toutes vos études." },
              { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement." },
              { q: "Y a-t-il un engagement ?", a: "Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment." },
              { q: "Comment fonctionnent les plans Corporate / Incubateur ?", a: "Ces offres sont sur devis ou via un onboarding accompagné — contactez notre équipe pour adapter le plan à vos besoins (programme, cohorte, KPIs)." },
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
