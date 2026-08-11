import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, Trash2, Wallet, Plus } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  useMyCoach,
  useCoachAvailability,
  useAddAvailability,
  useDeleteAvailability,
  useMyPayouts,
  useRequestPayout,
} from "@/hooks/useCoachManagement";
import { useCoachEarnings } from "@/hooks/useCoachingPayments";

export default function CoachStudioPage() {
  const { t } = useTranslation();
  const DAYS = t("coachStudio.days", { returnObjects: true }) as string[];
  const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    pending: { label: t("coachStudio.status.pending"), cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
    approved: { label: t("coachStudio.status.approved"), cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
    paid: { label: t("coachStudio.status.paid"), cls: "bg-primary/15 text-primary border-primary/30" },
    rejected: { label: t("coachStudio.status.rejected"), cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };

  usePageMeta({ title: t("coachStudio.metaTitle"), description: t("coachStudio.metaDescription") });
  const { data: coach, isLoading } = useMyCoach();
  const { data: slots } = useCoachAvailability(coach?.id);
  const { data: payouts } = useMyPayouts(coach?.id);
  const { data: earnings } = useCoachEarnings(coach?.id);
  const addSlot = useAddAvailability();
  const delSlot = useDeleteAvailability();
  const requestPayout = useRequestPayout();

  const [day, setDay] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("wave");
  const [payoutAccount, setPayoutAccount] = useState("");

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!coach) return <Navigate to="/become-coach" replace />;

  const handleAddSlot = () => {
    if (start >= end) { toast.error(t("coachStudio.errors.endBeforeStart")); return; }
    addSlot.mutate(
      { coachId: coach.id, dayOfWeek: day, start, end },
      {
        onSuccess: () => { toast.success(t("coachStudio.success.slotAdded")); setStart("09:00"); setEnd("10:00"); },
        onError: () => toast.error(t("coachStudio.errors.generic")),
      }
    );
  };

  const handlePayout = () => {
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) { toast.error(t("coachStudio.errors.invalidAmount")); return; }
    if (amt > (earnings?.totalNet ?? 0)) { toast.error(t("coachStudio.errors.amountExceedsBalance")); return; }
    if (!payoutAccount.trim()) { toast.error(t("coachStudio.errors.accountRequired")); return; }
    requestPayout.mutate(
      { coachId: coach.id, amount: amt, currency: earnings?.currency, method: payoutMethod, account: payoutAccount },
      {
        onSuccess: () => { toast.success(t("coachStudio.success.payoutSent")); setPayoutAmount(""); setPayoutAccount(""); },
        onError: () => toast.error(t("coachStudio.errors.generic")),
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
          <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> {t("coachStudio.badge")}
        </div>
        <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
          <Trans i18nKey="coachStudio.title" components={{ 1: <span className="text-primary" /> }} />
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="💰" value={`${(earnings?.totalNet ?? 0).toLocaleString("fr-FR")}`} label={t("coachStudio.metricNet", { currency: earnings?.currency ?? "XOF" })} badge={t("coachStudio.metricNetBadge")} badgeType="up" />
        <MetricCard icon="📥" value={`${(earnings?.totalGross ?? 0).toLocaleString("fr-FR")}`} label={t("coachStudio.metricGross")} badge={t("coachStudio.metricGrossBadge")} badgeType="neutral" />
        <MetricCard icon="🏦" value={`${(earnings?.totalCommission ?? 0).toLocaleString("fr-FR")}`} label={t("coachStudio.metricCommission")} badge="15%" badgeType="neutral" />
        <MetricCard icon="📅" value={String(slots?.length ?? 0)} label={t("coachStudio.metricSlots")} badge={t("coachStudio.metricSlotsBadge")} badgeType="up" />
      </div>

      <GHCard className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-base font-extrabold">{t("coachStudio.availabilityTitle")}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <select value={day} onChange={e => setDay(Number(e.target.value))} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
            {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input type="time" value={start} onChange={e => setStart(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleAddSlot} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold flex items-center justify-center gap-1 col-span-2 md:col-span-1">
            <Plus className="w-3.5 h-3.5" /> {t("coachStudio.addBtn")}
          </button>
        </div>
        {!slots?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("coachStudio.noSlots")}</p>
        ) : (
          <div className="space-y-2">
            {slots.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <Tag variant="green">{DAYS[s.day_of_week]}</Tag>
                  <span className="text-sm font-medium">{s.start_time.slice(0,5)} → {s.end_time.slice(0,5)}</span>
                  <span className="text-[11px] text-muted-foreground">{s.timezone}</span>
                </div>
                <button onClick={() => delSlot.mutate(s.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GHCard>

      <GHCard>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-base font-extrabold">{t("coachStudio.paymentsTitle")}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <input type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} placeholder={t("coachStudio.amountPlaceholder", { currency: earnings?.currency ?? "XOF" })} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
            <option value="wave">{t("coachStudio.methods.wave")}</option>
            <option value="orange_money">{t("coachStudio.methods.orange_money")}</option>
            <option value="mtn_momo">{t("coachStudio.methods.mtn_momo")}</option>
            <option value="bank">{t("coachStudio.methods.bank")}</option>
          </select>
          <input value={payoutAccount} onChange={e => setPayoutAccount(e.target.value)} placeholder={t("coachStudio.accountPlaceholder")} className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm col-span-2 md:col-span-1" />
          <button onClick={handlePayout} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold col-span-2 md:col-span-1">
            {t("coachStudio.requestBtn")}
          </button>
        </div>
        {!payouts?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("coachStudio.noPayouts")}</p>
        ) : (
          <div className="space-y-2">
            {payouts.map(p => {
              const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending;
              return (
                <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{Number(p.amount).toLocaleString("fr-FR")} {p.currency} · {p.method}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}{p.admin_notes ? ` · ${p.admin_notes}` : ""}</span>
                  </div>
                  <span className={`text-[10px] font-bold border rounded-full px-2 py-[2px] ${st.cls}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </GHCard>
    </motion.div>
  );
}
