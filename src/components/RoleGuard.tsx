import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Shield } from "lucide-react";
import { GHCard } from "@/components/ui-custom";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function RoleGuard({ allowedRoles, children, fallbackMessage }: RoleGuardProps) {
  const { t } = useTranslation();
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <GHCard className="text-center py-16 max-w-md mx-auto mt-10">
        <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading text-lg font-bold mb-2">{t("c1.roleGuard.restrictedTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {fallbackMessage || t("c1.roleGuard.restrictedDescription", { roles: allowedRoles.join(", ") })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("c1.roleGuard.currentProfile")} <span className="font-bold text-primary capitalize">{role}</span>
        </p>
      </GHCard>
    );
  }

  return <>{children}</>;
}
