import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAspirationalJourney } from "@/hooks/useNewProfilesData";
import RoleGuard from "@/components/RoleGuard";
import { Sparkles, CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEP_RESOURCES: Record<string, { icon: string; ctaKey: string; route: string }> = {
  discover: { icon: "🌍", ctaKey: "discover", route: "/feed" },
  ideation: { icon: "💡", ctaKey: "ideation", route: "/templates" },
  validate: { icon: "✅", ctaKey: "validate", route: "/networking" },
  skills: { icon: "🎓", ctaKey: "skills", route: "/courses" },
  mentor: { icon: "🧑‍🏫", ctaKey: "mentor", route: "/coaching" },
  first_pitch: { icon: "🎤", ctaKey: "first_pitch", route: "/pitchdeck" },
  network: { icon: "🤝", ctaKey: "network", route: "/circles" },
  launch: { icon: "🚀", ctaKey: "launch", route: "/events" },
};

function AspirationalContent() {
  const { t } = useTranslation();
  const { data: steps = [], toggle } = useAspirationalJourney();
  const navigate = useNavigate();

  const completed = steps.filter(s => s.completed).length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🗺️" value={String(total)} label={t("explorer.metrics.steps")} badge={t("explorer.metrics.stepsBadge")} badgeType="neutral" />
        <MetricCard icon="✅" value={String(completed)} label={t("explorer.metrics.completed")} badge={t("explorer.metrics.completedBadge")} badgeType="up" />
        <MetricCard icon="⏳" value={String(total - completed)} label={t("explorer.metrics.remaining")} badge={t("explorer.metrics.remainingBadge")} badgeType="neutral" />
        <MetricCard icon="🎯" value={`${pct}%`} label={t("explorer.metrics.progress")} badge={t("explorer.metrics.progressBadge")} badgeType="up" />
      </div>

      <GHCard className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold">{t("explorer.journeyTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("explorer.journeyDesc")}</p>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-ghgreen-dark to-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground">{t("explorer.completedCount", { completed, total })}</p>
      </GHCard>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const res = STEP_RESOURCES[step.step_key];
          return (
            <GHCard key={step.step_key} className={step.completed ? "opacity-70" : ""}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggle.mutate(step)} className="flex-shrink-0 mt-0.5" aria-label="Toggle step">
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{res?.icon}</span>
                    <h4 className={`font-heading text-sm font-bold ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                      {t("explorer.stepLabel", { n: idx + 1, title: step.step_title })}
                    </h4>
                  </div>
                  {!step.completed && res && (
                    <Button variant="outline" size="sm" onClick={() => navigate(res.route)} className="mt-2">
                      {t(`explorer.resources.${res.ctaKey}`)} →
                    </Button>
                  )}
                </div>
              </div>
            </GHCard>
          );
        })}
      </div>
    </>
  );
}

export default function AspirationalExplorerPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("explorer.metaTitle"), description: t("explorer.metaDescription") });

  return (
    <RoleGuard allowedRoles={["aspirationnel"]} fallbackMessage={t("explorer.guardMessage")}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <Sparkles className="w-3 h-3" /> {t("explorer.badge")}
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
              <Trans i18nKey="explorer.title" components={{ 1: <span className="text-primary" /> }} />
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">{t("explorer.subtitle")}</p>
          </div>
        </div>
        <AspirationalContent />
      </motion.div>
    </RoleGuard>
  );
}
