import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, ArrowRight, ArrowLeft, Home, Users, PenLine, Rss, MessageSquare, Sparkles } from "lucide-react";

interface TourStep {
  key: string;
  icon: any;
  position: "center" | "top" | "bottom";
}

const tourSteps: TourStep[] = [
  { key: "welcome", icon: Sparkles, position: "center" },
  { key: "dashboard", icon: Home, position: "top" },
  { key: "networking", icon: Users, position: "top" },
  { key: "coaching", icon: PenLine, position: "top" },
  { key: "feed", icon: Rss, position: "top" },
  { key: "messaging", icon: MessageSquare, position: "bottom" },
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
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;

  if (!show) return null;

  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={t(`tour.steps.${current.key}.title`)}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onComplete} />

        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 bg-card border-2 border-primary/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <button
            onClick={onComplete}
            aria-label={t("tour.skip")}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors min-h-11 min-w-11 flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex gap-1.5 mb-6">
            {tourSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>

          <h3 className="font-heading text-xl font-extrabold mb-2">{t(`tour.steps.${current.key}.title`)}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{t(`tour.steps.${current.key}.desc`)}</p>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {step + 1} / {tourSteps.length}
            </div>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 bg-secondary text-foreground rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-secondary/80 transition-colors min-h-11"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("tour.prev")}
                </button>
              )}
              <button
                onClick={isLast ? onComplete : () => setStep(step + 1)}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-hover transition-colors min-h-11"
              >
                {isLast ? t("tour.start") : t("tour.next")} {!isLast && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

