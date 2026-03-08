import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag, SectionHeader, ProgressBar } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, TrendingUp, Target } from "lucide-react";

const statusLabels: Record<string, { label: string; variant: string }> = {
  identified: { label: "Identifié", variant: "default" },
  contacted: { label: "Contacté", variant: "blue" },
  in_discussion: { label: "En discussion", variant: "orange" },
  due_diligence: { label: "Due Diligence", variant: "purple" },
  term_sheet: { label: "Term Sheet", variant: "green" },
  committed: { label: "Engagé", variant: "green" },
  declined: { label: "Décliné", variant: "red" },
};

export default function FundraisingPage() {
  const { user } = useAuth();

  const { data: rounds, isLoading } = useQuery({
    queryKey: ["fundraising-rounds", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fundraising_rounds")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeRound = rounds?.[0];

  const { data: contacts } = useQuery({
    queryKey: ["investor-contacts", activeRound?.id],
    enabled: !!activeRound,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_contacts")
        .select("*")
        .eq("round_id", activeRound!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const raised = activeRound?.raised_amount ?? 0;
  const target = activeRound?.target_amount ?? 1;
  const pct = Math.round((raised / target) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Fundraising Tracker
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Pilotez votre <span className="text-primary">levée de fonds</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Suivez vos investisseurs, gérez votre pipeline et optimisez votre stratégie de levée.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : !activeRound ? (
        <GHCard className="text-center py-12">
          <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h2 className="font-heading text-lg font-bold mb-2">Aucune levée en cours</h2>
          <p className="text-sm text-muted-foreground">Créez votre première levée de fonds pour commencer le suivi.</p>
        </GHCard>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
            <MetricCard icon="💰" value={`${(raised / 1000000).toFixed(1)}M€`} label="Levé" badge={`${pct}%`} badgeType="up" />
            <MetricCard icon="🎯" value={`${(target / 1000000).toFixed(1)}M€`} label="Objectif" badge={activeRound.stage ?? "—"} badgeType="neutral" />
            <MetricCard icon="👥" value={String(contacts?.length ?? 0)} label="Investisseurs" badge="Pipeline" badgeType="up" />
            <MetricCard icon="✅" value={String(contacts?.filter((c) => c.status === "term_sheet" || c.status === "committed").length ?? 0)} label="Engagés" badge="Confirmés" badgeType="up" />
          </div>

          <GHCard className="mb-5">
            <h3 className="font-heading text-sm font-bold mb-3">{activeRound.name}</h3>
            <ProgressBar label="Progression de la levée" value={`${(raised / 1000).toFixed(0)}K€ / ${(target / 1000).toFixed(0)}K€`} percentage={pct} />
          </GHCard>

          <SectionHeader title="👥 Pipeline Investisseurs" />
          <div className="space-y-2">
            {!contacts || contacts.length === 0 ? (
              <GHCard className="text-center py-6">
                <p className="text-xs text-muted-foreground">Aucun investisseur dans le pipeline.</p>
              </GHCard>
            ) : (
              contacts.map((c) => {
                const st = statusLabels[c.status ?? "identified"] || statusLabels.identified;
                return (
                  <GHCard key={c.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#103050] to-[#4096FF] flex items-center justify-center font-heading text-xs font-extrabold text-white flex-shrink-0">
                      {c.investor_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold">{c.investor_name}</span>
                        <Tag variant={st.variant as any}>{st.label}</Tag>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.firm && <span>{c.firm} · </span>}
                        {c.next_step && <span>Prochaine étape: {c.next_step}</span>}
                      </div>
                    </div>
                    {c.amount_committed && (
                      <div className="font-heading text-lg font-extrabold text-primary">
                        {(c.amount_committed / 1000).toFixed(0)}K€
                      </div>
                    )}
                  </GHCard>
                );
              })
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
