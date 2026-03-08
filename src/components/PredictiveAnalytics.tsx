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

function predictSSI(ssi: any): { predictions: Prediction[]; overallPredicted: number; recommendations: string[] } {
  if (!ssi) return { predictions: [], overallPredicted: 0, recommendations: [] };

  const predictions: Prediction[] = [
    {
      label: "Force du profil",
      current: ssi.profileStrength,
      predicted: Math.min(25, ssi.profileStrength + (ssi.profileStrength < 20 ? 5 : 2)),
      max: 25,
      tip: ssi.profileStrength < 15 ? "Complétez photo, bio et 3+ compétences" : "Ajoutez LinkedIn et website",
      icon: "👤",
    },
    {
      label: "Qualité réseau",
      current: ssi.networkQuality,
      predicted: Math.min(25, ssi.networkQuality + (ssi.networkQuality < 15 ? 4 : 2)),
      max: 25,
      tip: ssi.networkQuality < 15 ? "Visez 5 nouvelles connexions ciblées/semaine" : "Demandez des endorsements",
      icon: "🤝",
    },
    {
      label: "Engagement",
      current: ssi.engagement,
      predicted: Math.min(25, ssi.engagement + (ssi.engagement < 15 ? 5 : 3)),
      max: 25,
      tip: ssi.engagement < 15 ? "Publiez 2 posts et commentez 10 publications" : "Participez à un événement",
      icon: "💬",
    },
    {
      label: "Visibilité",
      current: ssi.visibility,
      predicted: Math.min(25, ssi.visibility + (ssi.visibility < 15 ? 4 : 2)),
      max: 25,
      tip: ssi.visibility < 15 ? "Réservez une session de coaching" : "Partagez vos milestones",
      icon: "👁️",
    },
  ];

  const overallPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0);

  const recommendations: string[] = [];
  if (ssi.profileStrength < 15) recommendations.push("🎯 Priorité #1 : Complétez votre profil à 100% — c'est le levier le plus rapide");
  if (ssi.engagement < 10) recommendations.push("✍️ Publiez votre premier post cette semaine — même un simple partage d'expérience");
  if (ssi.networkQuality < 10) recommendations.push("🤝 Envoyez 5 demandes de connexion avec messages personnalisés");
  if (ssi.details?.eventsAttended === 0) recommendations.push("📅 Inscrivez-vous à un événement pour gagner en visibilité");
  if (ssi.details?.coachingSessions === 0) recommendations.push("🎓 Réservez une session de coaching pour accélérer votre progression");
  if (recommendations.length === 0) recommendations.push("🌟 Vous êtes sur une excellente trajectoire ! Maintenez votre activité régulière.");

  return { predictions, overallPredicted, recommendations };
}

export default function PredictiveAnalytics() {
  const { data: ssi } = useSSI();
  const { profile } = useAuth();

  if (!ssi) return null;

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
            <h3 className="font-heading text-sm font-bold">Prédiction IA de votre SSI</h3>
            <p className="text-[10px] text-muted-foreground">Basée sur vos tendances et actions recommandées</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center">
            <div className="text-3xl font-heading font-extrabold">{ssi.totalScore}</div>
            <div className="text-[10px] text-muted-foreground">Actuel</div>
          </div>
          <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
          <div className="text-center">
            <div className="text-3xl font-heading font-extrabold text-primary">{overallPredicted}</div>
            <div className="text-[10px] text-muted-foreground">Prédiction 7j</div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${gain > 0 ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
            {gain > 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
            {gain > 0 ? "+" : ""}{gain} pts
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
        <h3 className="font-heading text-sm font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Plan d'action recommandé</h3>
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
