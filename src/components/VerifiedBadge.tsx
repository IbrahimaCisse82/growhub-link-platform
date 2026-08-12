import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface VerifiedBadgeProps {
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VerifiedBadge({ isVerified, size = "md", className }: VerifiedBadgeProps) {
  const { t } = useTranslation();
  if (!isVerified) return null;

  const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span className={cn("inline-flex items-center", className)} title={t("prof.verifiedBadge.title")}>
      <BadgeCheck className={cn(sizeMap[size], "text-primary")} />
    </span>
  );
}
