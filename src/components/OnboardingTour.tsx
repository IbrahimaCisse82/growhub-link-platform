import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Home, Users, PenLine, Rss, MessageSquare, Sparkles } from "lucide-react";

interface TourStep {
  target: string; // CSS selector or description
  title: string;
  description: string;
  icon: any;
  position: "center" | "top" | "bottom";
}

const tourSteps: TourStep[] = [
  {
    target: "welcome",
    title: "Bienvenue sur GrowHubLink ! 🚀",
    description: "Votre plateforme tout-en-un pour accélérer votre parcours entrepreneurial. Laissez-nous vous guider en 30 secondes.",
    icon: Sparkles,
    position: "center",
  },
  {
    target: "dashboard",
    title: "Votre Dashboard",
    description: "Retrouvez vos objectifs, statistiques clés, checklist d'activation et recommandations personnalisées.",
    icon: Home,
    position: "top",
  },
  {
    target: "networking",
    title: "Networking Intelligent",
    description: "Notre algorithme analyse vos compétences et objectifs pour vous recommander les profils les plus pertinents.",
    icon: Users,
    position: "top",
  },
  {
    target: "coaching",
    title: "Coaching Hub",
    description: "Réservez des sessions avec des experts certifiés. Évaluez, suivez votre progression et gagnez des badges.",
    icon: PenLine,
    position: "top",
  },
  {
    target: "feed",
    title: "Fil d'Actualité & Cercles",
    description: "Publiez, échangez et rejoignez des cercles thématiques pour enrichir votre réseau.",
    icon: Rss,
    position: "top",
  },
  {
    target: "messaging",
    title: "Messagerie en Temps Réel",
    description: "Échangez directement avec vos connexions. Les notifications arrivent instantanément.",
    icon: MessageSquare,
    position: "bottom",
  },
];

const TOUR_STORAGE_KEY = "growhublink_tour_completed";

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!done) {
      // Small delay to let the page render
      const t = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setShowTour(false);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setShowTour(true);
  }, []);

  return { showTour, completeTour, resetTour };
}

interface OnboardingTourProps {
  show: boolean;
  onComplete: () => void;
}

export default function OnboardingTour({ show, onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;

  if (!show) return null;

  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onComplete} />

        {/* Tour card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 bg-card border-2 border-primary/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          {/* Skip button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-colors ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Icon className="w-7 h-7 text-primary" />
          </div>

          {/* Content */}
          <h3 className="font-heading text-xl font-extrabold mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{current.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {step + 1} / {tourSteps.length}
            </div>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 bg-secondary text-foreground rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-secondary/80 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédent
                </button>
              )}
              <button
                onClick={isLast ? onComplete : () => setStep(step + 1)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-hover transition-colors"
              >
                {isLast ? "C'est parti !" : "Suivant"} {!isLast && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
