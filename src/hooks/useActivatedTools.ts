import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText, Shield, MailPlus, Trophy, Megaphone,
  BarChart3, TrendingUp, Target, Award, BookOpen, DollarSign, PenLine
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  lucideIcon: LucideIcon;
  path: string;
  category: "productivity" | "growth" | "analytics" | "gamification";
}

export const ALL_TOOLS: ToolDefinition[] = [
  { key: "content-calendar", label: "Calendrier Contenu", description: "Planifiez et organisez vos publications sur les réseaux.", icon: "📅", lucideIcon: FileText, path: "/content-calendar", category: "productivity" },
  { key: "deal-room", label: "Deal Room", description: "Partagez des documents confidentiels avec des investisseurs.", icon: "🔒", lucideIcon: Shield, path: "/deal-room", category: "growth" },
  { key: "templates", label: "Templates Messages", description: "Modèles de messages prêts à l'emploi pour le networking.", icon: "✉️", lucideIcon: MailPlus, path: "/templates", category: "productivity" },
  { key: "challenges", label: "Challenges", description: "Participez à des défis communautaires et gagnez des points.", icon: "🏆", lucideIcon: Trophy, path: "/challenges", category: "gamification" },
  { key: "marketing", label: "Marketing & Leads", description: "Gérez vos leads, campagnes et prospection.", icon: "📣", lucideIcon: Megaphone, path: "/marketing", category: "growth" },
  { key: "analytics", label: "Analytics", description: "Tableaux de bord et statistiques avancées sur votre réseau.", icon: "📊", lucideIcon: BarChart3, path: "/analytics", category: "analytics" },
  { key: "roi", label: "ROI Dashboard", description: "Mesurez le retour sur investissement de votre networking.", icon: "📈", lucideIcon: TrendingUp, path: "/roi", category: "analytics" },
  { key: "progression", label: "Objectifs SMART", description: "Définissez et suivez vos objectifs de croissance.", icon: "🎯", lucideIcon: Target, path: "/progression", category: "productivity" },
  { key: "badges", label: "Badges & Gamification", description: "Consultez vos badges, récompenses et classement.", icon: "🏅", lucideIcon: Award, path: "/badges", category: "gamification" },
];

export const TOOL_CATEGORIES = [
  { key: "all", label: "Tous les outils" },
  { key: "productivity", label: "Productivité" },
  { key: "growth", label: "Croissance" },
  { key: "analytics", label: "Analytics" },
  { key: "gamification", label: "Gamification" },
];

export function useActivatedTools() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activatedKeys = [], isLoading } = useQuery({
    queryKey: ["activated-tools", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_activated_tools")
        .select("tool_key")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data as any[]).map((d: any) => d.tool_key as string);
    },
  });

  const activateTool = useMutation({
    mutationFn: async (toolKey: string) => {
      const { error } = await (supabase as any)
        .from("user_activated_tools")
        .insert({ user_id: user!.id, tool_key: toolKey });
      if (error) throw error;
    },
    onSuccess: (_, toolKey) => {
      const tool = ALL_TOOLS.find(t => t.key === toolKey);
      toast.success(`${tool?.icon} ${tool?.label ?? "Outil"} activé !`);
      queryClient.invalidateQueries({ queryKey: ["activated-tools"] });
    },
    onError: () => toast.error("Erreur lors de l'activation"),
  });

  const deactivateTool = useMutation({
    mutationFn: async (toolKey: string) => {
      const { error } = await (supabase as any)
        .from("user_activated_tools")
        .delete()
        .eq("user_id", user!.id)
        .eq("tool_key", toolKey);
      if (error) throw error;
    },
    onSuccess: (_, toolKey) => {
      const tool = ALL_TOOLS.find(t => t.key === toolKey);
      toast.success(`${tool?.label ?? "Outil"} désactivé`);
      queryClient.invalidateQueries({ queryKey: ["activated-tools"] });
    },
    onError: () => toast.error("Erreur lors de la désactivation"),
  });

  const isActivated = (toolKey: string) => activatedKeys.includes(toolKey);
  const activatedTools = ALL_TOOLS.filter(t => activatedKeys.includes(t.key));

  return {
    activatedKeys,
    activatedTools,
    isActivated,
    activateTool,
    deactivateTool,
    isLoading,
    allTools: ALL_TOOLS,
  };
}
