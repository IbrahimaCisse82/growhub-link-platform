import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag, SectionHeader, ProgressBar } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DollarSign, Users, Plus, Trash2, Pencil, X } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FundraisingROIWidget } from "@/components/FundraisingROIWidget";
import { useTranslation } from "react-i18next";

export default function FundraisingPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("fundraising.page_meta_title"), description: t("fundraising.page_meta_description") });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusLabels: Record<string, { label: string; variant: string }> = {
    identified: { label: t("fundraising.status.identified"), variant: "default" },
    contacted: { label: t("fundraising.status.contacted"), variant: "blue" },
    in_discussion: { label: t("fundraising.status.in_discussion"), variant: "orange" },
    due_diligence: { label: t("fundraising.status.due_diligence"), variant: "purple" },
    term_sheet: { label: t("fundraising.status.term_sheet"), variant: "green" },
    committed: { label: t("fundraising.status.committed"), variant: "green" },
    declined: { label: t("fundraising.status.declined"), variant: "red" },
  };

  // State for forms
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [roundForm, setRoundForm] = useState({ name: "", target_amount: "", stage: "" });
  const [creatingRound, setCreatingRound] = useState(false);

  const [showInvestorForm, setShowInvestorForm] = useState(false);
  const [investorForm, setInvestorForm] = useState({ investor_name: "", firm: "", email: "", status: "identified", amount_committed: "", next_step: "" });
  const [creatingInvestor, setCreatingInvestor] = useState(false);

  const { data: rounds, isLoading } = useQuery({
    queryKey: ["fundraising-rounds", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("fundraising_rounds").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeRound = rounds?.[0];

  const { data: contacts } = useQuery({
    queryKey: ["investor-contacts", activeRound?.id],
    enabled: !!activeRound,
    queryFn: async () => {
      const { data, error } = await supabase.from("investor_contacts").select("*").eq("round_id", activeRound!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const raised = activeRound?.raised_amount ?? 0;
  const target = activeRound?.target_amount ?? 1;
  const pct = Math.round((raised / target) * 100);

  const handleCreateRound = async () => {
    if (!user || !roundForm.name.trim()) return;
    setCreatingRound(true);
    const { error } = await supabase.from("fundraising_rounds").insert({
      user_id: user.id,
      name: roundForm.name,
      target_amount: parseFloat(roundForm.target_amount) || null,
      stage: roundForm.stage || null,
    });
    setCreatingRound(false);
    if (error) toast.error(t("fundraising.toast_error"));
    else {
      toast.success(t("fundraising.toast_round_created"));
      setShowRoundForm(false);
      setRoundForm({ name: "", target_amount: "", stage: "" });
      queryClient.invalidateQueries({ queryKey: ["fundraising-rounds"] });
    }
  };

  const handleCreateInvestor = async () => {
    if (!user || !activeRound || !investorForm.investor_name.trim()) return;
    setCreatingInvestor(true);
    const { error } = await supabase.from("investor_contacts").insert({
      user_id: user.id,
      round_id: activeRound.id,
      investor_name: investorForm.investor_name,
      firm: investorForm.firm || null,
      email: investorForm.email || null,
      status: investorForm.status,
      amount_committed: investorForm.amount_committed ? parseFloat(investorForm.amount_committed) : null,
      next_step: investorForm.next_step || null,
    });
    setCreatingInvestor(false);
    if (error) toast.error(t("fundraising.toast_error"));
    else {
      toast.success(t("fundraising.toast_investor_added"));
      setShowInvestorForm(false);
      setInvestorForm({ investor_name: "", firm: "", email: "", status: "identified", amount_committed: "", next_step: "" });
      queryClient.invalidateQueries({ queryKey: ["investor-contacts"] });
    }
  };

  const handleDeleteContact = async (id: string) => {
    await supabase.from("investor_contacts").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["investor-contacts"] });
    toast.success(t("fundraising.toast_deleted"));
  };

  const handleDeleteRound = async (id: string) => {
    await supabase.from("investor_contacts").delete().eq("round_id", id);
    await supabase.from("fundraising_rounds").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["fundraising-rounds"] });
    toast.success(t("fundraising.toast_round_deleted"));
  };

  const handleUpdateRaised = async (amount: number) => {
    if (!activeRound) return;
    await supabase.from("fundraising_rounds").update({ raised_amount: amount }).eq("id", activeRound.id);
    queryClient.invalidateQueries({ queryKey: ["fundraising-rounds"] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> {t("fundraising.badge")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">{t("fundraising.title_1")} <span className="text-primary">{t("fundraising.title_highlight")}</span></h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">{t("fundraising.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : !activeRound ? (
        <>
          <GHCard className="text-center py-12 mb-4">
            <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h2 className="font-heading text-lg font-bold mb-2">{t("fundraising.empty_title")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("fundraising.empty_subtitle")}</p>
            <button onClick={() => setShowRoundForm(true)} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-xs font-bold flex items-center gap-2 mx-auto hover:bg-primary-hover transition-colors">
              <Plus className="w-4 h-4" /> {t("fundraising.create_round_button")}
            </button>
          </GHCard>

          {showRoundForm && (
            <GHCard className="mb-4">
              <h3 className="font-heading text-sm font-bold mb-3">{t("fundraising.new_round_form_title")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={roundForm.name} onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })} placeholder={t("fundraising.placeholder_round_name")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={roundForm.target_amount} onChange={(e) => setRoundForm({ ...roundForm, target_amount: e.target.value })} placeholder={t("fundraising.placeholder_target_amount")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <select value={roundForm.stage} onChange={(e) => setRoundForm({ ...roundForm, stage: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="">{t("fundraising.placeholder_stage")}</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Serie A">Série A</option>
                  <option value="Serie B">Série B</option>
                  <option value="Serie C+">Série C+</option>
                </select>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button onClick={() => setShowRoundForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">{t("fundraising.cancel")}</button>
                <button onClick={handleCreateRound} disabled={!roundForm.name.trim() || creatingRound} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">{t("fundraising.create")}</button>
              </div>
            </GHCard>
          )}
        </>
      ) : (
        <>
          <FundraisingROIWidget />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
            <MetricCard icon="💰" value={`${(raised / 1000000).toFixed(1)}M€`} label={t("fundraising.metric_raised")} badge={`${pct}%`} badgeType="up" />
            <MetricCard icon="🎯" value={`${(target / 1000000).toFixed(1)}M€`} label={t("fundraising.metric_target")} badge={activeRound.stage ?? "—"} badgeType="neutral" />
            <MetricCard icon="👥" value={String(contacts?.length ?? 0)} label={t("fundraising.metric_investors")} badge={t("fundraising.metric_investors_badge")} badgeType="up" />
            <MetricCard icon="✅" value={String(contacts?.filter((c) => c.status === "term_sheet" || c.status === "committed").length ?? 0)} label={t("fundraising.metric_committed")} badge={t("fundraising.metric_committed_badge")} badgeType="up" />
          </div>

          <GHCard className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold">{activeRound.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowRoundForm(true)} className="text-xs text-primary font-bold hover:underline">{t("fundraising.new_round_link")}</button>
                <button onClick={() => handleDeleteRound(activeRound.id)} className="text-xs text-destructive font-bold hover:underline">{t("fundraising.delete_round")}</button>
              </div>
            </div>
            <ProgressBar label={t("fundraising.progress_label")} value={`${(raised / 1000).toFixed(0)}K€ / ${(target / 1000).toFixed(0)}K€`} percentage={pct} />
          </GHCard>

          {showRoundForm && (
            <GHCard className="mb-4">
              <h3 className="font-heading text-sm font-bold mb-3">{t("fundraising.new_round_form_title_short")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={roundForm.name} onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })} placeholder={t("fundraising.placeholder_round_name_short")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={roundForm.target_amount} onChange={(e) => setRoundForm({ ...roundForm, target_amount: e.target.value })} placeholder={t("fundraising.placeholder_target_amount")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <select value={roundForm.stage} onChange={(e) => setRoundForm({ ...roundForm, stage: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="">{t("fundraising.placeholder_stage")}</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Serie A">Série A</option>
                  <option value="Serie B">Série B</option>
                  <option value="Serie C+">Série C+</option>
                </select>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button onClick={() => setShowRoundForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">{t("fundraising.cancel")}</button>
                <button onClick={handleCreateRound} disabled={!roundForm.name.trim() || creatingRound} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">{t("fundraising.create")}</button>
              </div>
            </GHCard>
          )}

          <div className="flex items-center justify-between mb-3">
            <SectionHeader title={t("fundraising.pipeline_title")} />
            <button onClick={() => setShowInvestorForm(!showInvestorForm)} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-heading text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors">
              <Plus className="w-3.5 h-3.5" /> {t("fundraising.add")}
            </button>
          </div>

          {showInvestorForm && (
            <GHCard className="mb-4">
              <h3 className="font-heading text-sm font-bold mb-3">{t("fundraising.new_investor_form_title")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={investorForm.investor_name} onChange={(e) => setInvestorForm({ ...investorForm, investor_name: e.target.value })} placeholder={t("fundraising.placeholder_investor_name")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <input value={investorForm.firm} onChange={(e) => setInvestorForm({ ...investorForm, firm: e.target.value })} placeholder={t("fundraising.placeholder_firm")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <input type="email" value={investorForm.email} onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })} placeholder={t("fundraising.placeholder_email")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <select value={investorForm.status} onChange={(e) => setInvestorForm({ ...investorForm, status: e.target.value })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input type="number" value={investorForm.amount_committed} onChange={(e) => setInvestorForm({ ...investorForm, amount_committed: e.target.value })} placeholder={t("fundraising.placeholder_amount_committed")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
                <input value={investorForm.next_step} onChange={(e) => setInvestorForm({ ...investorForm, next_step: e.target.value })} placeholder={t("fundraising.placeholder_next_step")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <button onClick={() => setShowInvestorForm(false)} className="px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold">{t("fundraising.cancel")}</button>
                <button onClick={handleCreateInvestor} disabled={!investorForm.investor_name.trim() || creatingInvestor} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50">{t("fundraising.add")}</button>
              </div>
            </GHCard>
          )}

          <div className="space-y-2">
            {!contacts || contacts.length === 0 ? (
              <GHCard className="text-center py-6">
                <p className="text-xs text-muted-foreground">{t("fundraising.no_investors")}</p>
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
                        {c.email && <span>{c.email} · </span>}
                        {c.next_step && <span>{t("fundraising.next_step_label", { step: c.next_step })}</span>}
                      </div>
                    </div>
                    {c.amount_committed && (
                      <div className="font-heading text-lg font-extrabold text-primary">
                        {(c.amount_committed / 1000).toFixed(0)}K€
                      </div>
                    )}
                    <button onClick={() => handleDeleteContact(c.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
