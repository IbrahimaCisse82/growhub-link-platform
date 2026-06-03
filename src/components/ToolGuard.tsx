import { useEffect } from "react";
import { useActivatedTools, ALL_TOOLS, ROLE_RECOMMENDED_TOOLS } from "@/hooks/useActivatedTools";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Puzzle, Zap, Sparkles } from "lucide-react";
import { GHCard } from "@/components/ui-custom";

interface ToolGuardProps {
  toolKey: string;
  children: React.ReactNode;
}

export default function ToolGuard({ toolKey, children }: ToolGuardProps) {
  const { isActivated, isLoading, activateTool, trackToolOpen } = useActivatedTools();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const tool = ALL_TOOLS.find(t => t.key === toolKey);
  const isRecommended = (ROLE_RECOMMENDED_TOOLS[role] ?? []).includes(toolKey);
  const activated = isActivated(toolKey);

  useEffect(() => {
    if (activated) {
      trackToolOpen(toolKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activated, toolKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activated) {
    return (
      <GHCard className="text-center py-16 max-w-md mx-auto mt-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
          {tool?.icon ?? "🧩"}
        </div>
        <h2 className="font-heading text-lg font-bold mb-2">
          {tool?.label ?? "Outil"} non activé
        </h2>
        {isRecommended && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">
            <Sparkles className="w-3 h-3" /> Recommandé pour votre profil
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-6">
          {tool?.description ?? "Activez cet outil depuis le Marketplace pour y accéder."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => activateTool.mutate(toolKey)}
            disabled={activateTool.isPending}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            <Zap className="w-3.5 h-3.5" /> Activer maintenant
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className="h-10 px-5 rounded-xl border border-border text-foreground/60 text-xs font-bold flex items-center gap-2 hover:border-primary/30 transition-colors"
          >
            <Puzzle className="w-3.5 h-3.5" /> Voir le Marketplace
          </button>
        </div>
      </GHCard>
    );
  }

  return <>{children}</>;
}
