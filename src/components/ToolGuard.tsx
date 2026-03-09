import { useActivatedTools, ALL_TOOLS } from "@/hooks/useActivatedTools";
import { useNavigate } from "react-router-dom";
import { Puzzle, ArrowRight, Zap } from "lucide-react";
import { GHCard } from "@/components/ui-custom";

interface ToolGuardProps {
  toolKey: string;
  children: React.ReactNode;
}

export default function ToolGuard({ toolKey, children }: ToolGuardProps) {
  const { isActivated, isLoading, activateTool } = useActivatedTools();
  const navigate = useNavigate();
  const tool = ALL_TOOLS.find(t => t.key === toolKey);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isActivated(toolKey)) {
    return (
      <GHCard className="text-center py-16 max-w-md mx-auto mt-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
          {tool?.icon ?? "🧩"}
        </div>
        <h2 className="font-heading text-lg font-bold mb-2">
          {tool?.label ?? "Outil"} non activé
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Activez cet outil depuis le Marketplace pour y accéder.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => activateTool.mutate(toolKey)}
            disabled={activateTool.isPending}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors"
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
