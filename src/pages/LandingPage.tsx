import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Zap, BarChart3, BookOpen, DollarSign,
  MessageSquare, Award, ArrowRight, Star, Shield, Globe,
  CheckCircle2, Crown, Sparkles, TrendingUp, Play, Target, Newspaper, Handshake,
  Rocket, GraduationCap, Building2, UserCheck, Building, Briefcase, Code, Brain
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { usePlatformStats, usePlatformTestimonials } from "@/hooks/usePlatformStats";
import { useTranslation } from "react-i18next";

const FEATURE_ICONS = [Users, Zap, Target, BookOpen, DollarSign, Newspaper, MessageSquare, BarChart3];

const ROLE_META = [
  { emoji: "🚀", icon: Rocket, gradient: "from-emerald-500/20 to-green-500/10", border: "hover:border-emerald-500/40" },
  { emoji: "🎯", icon: GraduationCap, gradient: "from-blue-500/20 to-cyan-500/10", border: "hover:border-blue-500/40" },
  { emoji: "💎", icon: TrendingUp, gradient: "from-purple-500/20 to-violet-500/10", border: "hover:border-purple-500/40" },
  { emoji: "🧠", icon: Brain, gradient: "from-orange-500/20 to-amber-500/10", border: "hover:border-orange-500/40" },
  { emoji: "💼", icon: Briefcase, gradient: "from-pink-500/20 to-rose-500/10", border: "hover:border-pink-500/40" },
  { emoji: "🏗️", icon: Building2, gradient: "from-teal-500/20 to-cyan-500/10", border: "hover:border-teal-500/40" },
  { emoji: "🎓", icon: BookOpen, gradient: "from-cyan-500/20 to-sky-500/10", border: "hover:border-cyan-500/40" },
  { emoji: "🤝", icon: UserCheck, gradient: "from-slate-500/20 to-gray-500/10", border: "hover:border-slate-500/40" },
  { emoji: "🏛️", icon: Building, gradient: "from-indigo-500/20 to-blue-500/10", border: "hover:border-indigo-500/40" },
  { emoji: "⭐", icon: Sparkles, gradient: "from-amber-500/20 to-yellow-500/10", border: "hover:border-amber-500/40" },
];

const STEP_ICONS = ["👤", "🤝", "🚀"];

function formatStatValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K+`;
  return `${value}`;
}

export default function LandingPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("landing.meta.title"), description: t("landing.meta.description") });
  const navigate = useNavigate();
  const { data: platformStats } = usePlatformStats();
  const { data: testimonials } = usePlatformTestimonials();

  const features = (t("landing.features.items", { returnObjects: true }) as Array<{ title: string; desc: string; tag: string }>).map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));
  const roles = (t("landing.roles.items", { returnObjects: true }) as Array<{ title: string; desc: string; features: string[] }>).map((r, i) => ({ ...r, ...ROLE_META[i] }));
  const steps = (t("landing.how.steps", { returnObjects: true }) as Array<{ title: string; desc: string }>).map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0"), icon: STEP_ICONS[i] }));
  const trustItems = t("landing.trust.items", { returnObjects: true }) as string[];

  const stats = [
    { value: formatStatValue(platformStats?.totalMembers ?? 0), label: t("landing.stats.members"), icon: Users },
    { value: formatStatValue(platformStats?.totalCoaches ?? 0), label: t("landing.stats.coaches"), icon: Award },
    { value: formatStatValue(platformStats?.totalConnections ?? 0), label: t("landing.stats.connections"), icon: Handshake },
    { value: formatStatValue(platformStats?.totalEvents ?? 0), label: t("landing.stats.events"), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-x-hidden">
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
            <a href="#features" className="hover:text-foreground transition-colors">{t("landing.nav.features")}</a>
            <a href="#profiles" className="hover:text-foreground transition-colors">{t("landing.nav.profiles")}</a>
            <a href="#how" className="hover:text-foreground transition-colors">{t("landing.nav.how")}</a>
            {testimonials && testimonials.length > 0 && (
              <a href="#testimonials" className="hover:text-foreground transition-colors">{t("landing.nav.testimonials")}</a>
            )}
            <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">{t("landing.nav.pricing")}</button>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={() => navigate("/auth")} className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              {t("landing.nav.login")}
            </button>
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold hover:bg-primary-hover transition-colors whitespace-nowrap">
              <span className="hidden md:inline">{t("landing.nav.signupFull")}</span>
              <span className="md:hidden">{t("landing.nav.signupShort")}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 md:pt-28 pb-14 md:pb-20 px-4 md:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-6 md:mb-8">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> {t("landing.hero.badge")}
            </div>
            <h1 className="font-heading text-[32px] sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold leading-[1.08] mb-5 md:mb-6 px-2 break-words hyphens-auto">
              {t("landing.hero.title1")}<br />
              <span className="text-primary break-words">{t("landing.hero.titleHighlight")}</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 sm:px-0">
              <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all">
                {t("landing.hero.ctaPrimary")} <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button onClick={() => navigate("/auth")} className="bg-card border border-border text-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> {t("landing.hero.ctaSecondary")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t("landing.hero.note")}</p>
          </motion.div>

          {/* Floating role pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 md:mt-14 flex flex-wrap justify-center gap-2 md:gap-2.5 px-2"
          >
            {roles.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="inline-flex items-center gap-1.5 bg-card/80 backdrop-blur border border-border/60 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default"
              >
                <span>{r.emoji}</span> {r.title}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
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
              {t("landing.features.badge")}
            </div>
            <h2 className="font-heading text-2xl md:text-5xl font-extrabold mb-4">{t("landing.features.title")} <span className="text-primary">{t("landing.features.titleHighlight")}</span></h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">{t("landing.features.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{f.tag}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-sm md:text-base font-bold mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Profiles / Roles */}
      <section id="profiles" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
              {t("landing.roles.badge")}
            </div>
            <h2 className="font-heading text-2xl md:text-5xl font-extrabold mb-4">{t("landing.roles.title")} <span className="text-primary">{t("landing.roles.titleHighlight")}</span></h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">{t("landing.roles.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {roles.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`bg-card border border-border rounded-2xl p-4 md:p-5 ${r.border} hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden`}
                onClick={() => navigate("/auth")}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <div className="font-heading text-sm font-bold mb-1">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mb-3 leading-snug">{r.desc}</div>
                  <ul className="space-y-1">
                    {r.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-[10px] text-foreground/60 group-hover:text-foreground/80 transition-colors">
                        <CheckCircle2 className="w-2.5 h-2.5 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-6 md:px-8 py-3 md:py-3.5 font-heading text-sm font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-2">
              {t("landing.roles.cta")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">{t("landing.how.title")} <span className="text-primary">{t("landing.how.titleHighlight")}</span> ?</h2>
            <p className="text-muted-foreground text-sm md:text-lg">{t("landing.how.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/20 transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-heading text-4xl font-extrabold text-primary/20 mb-2">{s.num}</div>
                <h3 className="font-heading text-base md:text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="py-16 md:py-24 px-4 md:px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">{t("landing.testimonials.title")} <span className="text-primary">{t("landing.testimonials.titleHighlight")}</span></h2>
              <p className="text-muted-foreground text-sm md:text-base">{t("landing.testimonials.subtitle")}</p>
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
                {t("landing.pricingCta.title")} <span className="text-primary">{t("landing.pricingCta.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-6 md:mb-8 max-w-lg mx-auto">{t("landing.pricingCta.subtitle")}</p>
              <button onClick={() => navigate("/pricing")} className="bg-primary text-primary-foreground rounded-2xl px-6 md:px-8 py-3.5 md:py-4 font-heading text-sm md:text-base font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center gap-2">
                {t("landing.pricingCta.cta")} <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-10 md:py-16 px-4 md:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-5 md:gap-8 text-xs md:text-sm text-muted-foreground">
            {[Shield, Globe, CheckCircle2].map((Icon, i) => (
              <div key={trustItems[i]} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{trustItems[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-28 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-5xl font-extrabold mb-5 md:mb-6">
            {t("landing.finalCta.title")} <span className="text-primary">{t("landing.finalCta.titleHighlight")}</span> ?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10">{t("landing.finalCta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground rounded-2xl px-8 md:px-10 py-3.5 md:py-4 font-heading text-base md:text-lg font-bold hover:bg-primary-hover hover:shadow-[var(--shadow-glow)] transition-all inline-flex items-center justify-center gap-3">
              {t("landing.finalCta.ctaPrimary")} <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={() => navigate("/auth")} className="bg-card border border-border text-foreground rounded-2xl px-8 md:px-10 py-3.5 md:py-4 font-heading text-base md:text-lg font-bold hover:border-primary/30 transition-all inline-flex items-center justify-center gap-3">
              {t("landing.finalCta.ctaSecondary")} <Play className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{t("landing.finalCta.note")}</p>
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
              <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">{t("landing.footer.tarifs")}</button>
              <button onClick={() => navigate("/ambassadors")} className="hover:text-foreground transition-colors">{t("landing.footer.ambassadors")}</button>
              <a href="#features" className="hover:text-foreground transition-colors">{t("landing.footer.features")}</a>
              <a href="#profiles" className="hover:text-foreground transition-colors">{t("landing.footer.profiles")}</a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GrowHubLink. {t("landing.footer.rights")}</p>
          </div>
        </div>
      </footer>
      <PWAInstallPrompt />
    </div>
  );
}
