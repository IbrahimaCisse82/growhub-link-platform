import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useSSI } from "@/hooks/useSSI";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, TrendingDown, Target, Zap, Brain, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Prediction {
  label: string;
  current: number;
  predicted: number;
  max: number;
  tip: string;
  icon: string;
}

export default function PredictiveAnalytics() {
  const { t } = useTranslation();
  const { data: ssi } = useSSI();
  const { profile } = useAuth();

  if (!ssi) return null;

  function predictSSI(ssi: any): { predictions: Prediction[]; overallPredicted: number; recommendations: string[] } {
    if (!ssi) return { predictions: [], overallPredicted: 0, recommendations: [] };

    const predictions: Prediction[] = [
      {
        label: t("c3.predictiveAnalytics.dims.profileStrength"),
        current: ssi.profileStrength,
        predicted: Math.min(25, ssi.profileStrength + (ssi.profileStrength < 20 ? 5 : 2)),
        max: 25,
        tip: ssi.profileStrength < 15 ? t("c3.predictiveAnalytics.tips.profileLow") : t("c3.predictiveAnalytics.tips.profileHigh"),
        icon: "👤",
      },
      {
        label: t("c3.predictiveAnalytics.dims.networkQuality"),
        current: ssi.networkQuality,
        predicted: Math.min(25, ssi.networkQuality + (ssi.networkQuality < 15 ? 4 : 2)),
        max: 25,
        tip: ssi.networkQuality < 15 ? t("c3.predictiveAnalytics.tips.networkLow") : t("c3.predictiveAnalytics.tips.networkHigh"),
        icon: "🤝",
      },
      {
        label: t("c3.predictiveAnalytics.dims.engagement"),
        current: ssi.engagement,
        predicted: Math.min(25, ssi.engagement + (ssi.engagement < 15 ? 5 : 3)),
        max: 25,
        tip: ssi.engagement < 15 ? t("c3.predictiveAnalytics.tips.engagementLow") : t("c3.predictiveAnalytics.tips.engagementHigh"),
        icon: "💬",
      },
      {
        label: t("c3.predictiveAnalytics.dims.visibility"),
        current: ssi.visibility,
        predicted: Math.min(25, ssi.visibility + (ssi.visibility < 15 ? 4 : 2)),
        max: 25,
        tip: ssi.visibility < 15 ? t("c3.predictiveAnalytics.tips.visibilityLow") : t("c3.predictiveAnalytics.tips.visibilityHigh"),
        icon: "👁️",
      },
    ];

    const overallPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0);

    const recommendations: string[] = [];
    if (ssi.profileStrength < 15) recommendations.push(t("c3.predictiveAnalytics.recommendations.completeProfile"));
    if (ssi.engagement < 10) recommendations.push(t("c3.predictiveAnalytics.recommendations.firstPost"));
    if (ssi.networkQuality < 10) recommendations.push(t("c3.predictiveAnalytics.recommendations.connectionRequests"));
    if (ssi.details?.eventsAttended === 0) recommendations.push(t("c3.predictiveAnalytics.recommendations.joinEvent"));
    if (ssi.details?.coachingSessions === 0) recommendations.push(t("c3.predictiveAnalytics.recommendations.bookCoaching"));
    if (recommendations.length === 0) recommendations.push(t("c3.predictiveAnalytics.recommendations.onTrack"));

    return { predictions, overallPredicted, recommendations };
  }

  const { predictions, overallPredicted, recommendations } = predictSSI(ssi);
  const gain = overallPredicted - ssi.totalScore;

  return (
    <div className="space-y-4">
      {/* Prediction header */}
      <GHCard className="bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold">{t("c3.predictiveAnalytics.title")}</h3>
            <p className="text-[10px] text-muted-foreground">{t("c3.predictiveAnalytics.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center">
            <div className="text-3xl font-heading font-extrabold">{ssi.totalScore}</div>
            <div className="text-[10px] text-muted-foreground">{t("c3.predictiveAnalytics.current")}</div>
          </div>
          <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
          <div className="text-center">
            <div className="text-3xl font-heading font-extrabold text-primary">{overallPredicted}</div>
            <div className="text-[10px] text-muted-foreground">{t("c3.predictiveAnalytics.prediction7d")}</div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${gain > 0 ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
            {gain > 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
            {gain > 0 ? "+" : ""}{gain} {t("c3.predictiveAnalytics.pts")}
          </div>
        </div>
      </GHCard>

      {/* Dimension predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {predictions.map(pred => (
          <GHCard key={pred.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold flex items-center gap-1.5">{pred.icon} {pred.label}</span>
              <span className="text-[10px] font-bold text-primary">{pred.current} → {pred.predicted}/{pred.max}</span>
            </div>
            <div className="relative mb-2">
              <Progress value={(pred.current / pred.max) * 100} className="h-2" />
              <div className="absolute top-0 h-2 rounded-full bg-primary/30" style={{ width: `${(pred.predicted / pred.max) * 100}%`, left: 0 }} />
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {pred.tip}</p>
          </GHCard>
        ))}
      </div>

      {/* Recommendations */}
      <GHCard>
        <h3 className="font-heading text-sm font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> {t("c3.predictiveAnalytics.actionPlan")}</h3>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
              <span className="text-xs leading-relaxed">{rec}</span>
            </motion.div>
          ))}
        </div>
      </GHCard>
    </div>
  );
}
