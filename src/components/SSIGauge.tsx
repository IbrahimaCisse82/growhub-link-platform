import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  score: number; // 0-100
  size?: number;
  label?: string;
}

export default function SSIGauge({ score, size = 120, label }: Props) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("prof.ssiGauge.defaultLabel");
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 70 ? "hsl(var(--primary))" : clamped >= 40 ? "hsl(45 90% 55%)" : "hsl(0 75% 55%)";

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-extrabold text-foreground">{clamped}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{resolvedLabel}</span>
      </div>
    </div>
  );
}
