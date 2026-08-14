import { useState, useEffect } from "react";
import { GHCard } from "@/components/ui-custom";
import { useFundraisingMetrics } from "@/hooks/useDealRoom";
import { TrendingUp, Pencil, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FundraisingROIWidget() {
  const { t } = useTranslation();
  const { metrics, upsert } = useFundraisingMetrics();
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState({
    investors_contacted: 0, meetings_held: 0, term_sheets: 0, closed_deals: 0,
    amount_raised: 0, currency: "XOF",
  });

  useEffect(() => {
    if (metrics) setVals({
      investors_contacted: metrics.investors_contacted ?? 0,
      meetings_held: metrics.meetings_held ?? 0,
      term_sheets: metrics.term_sheets ?? 0,
      closed_deals: metrics.closed_deals ?? 0,
      amount_raised: Number(metrics.amount_raised ?? 0),
      currency: metrics.currency ?? "XOF",
    });
  }, [metrics]);

  const conversion = vals.investors_contacted > 0
    ? ((vals.closed_deals / vals.investors_contacted) * 100).toFixed(1) : "0";

  const save = () => upsert.mutate(vals, { onSuccess: () => setEditing(false) });

  return (
    <GHCard className="mb-5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-sm font-bold">{t("c1.fundraisingROI.title")}</h3>
        </div>
        <button onClick={() => editing ? save() : setEditing(true)} className="text-[11px] flex items-center gap-1 text-primary font-bold">
          {editing ? <><Check className="w-3 h-3" /> {t("c1.fundraisingROI.save")}</> : <><Pencil className="w-3 h-3" /> {t("c1.fundraisingROI.edit")}</>}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { k: "investors_contacted", label: t("c1.fundraisingROI.contacted") },
          { k: "meetings_held", label: t("c1.fundraisingROI.meetingsHeld") },
          { k: "term_sheets", label: t("c1.fundraisingROI.termSheets") },
          { k: "closed_deals", label: t("c1.fundraisingROI.closedDeals") },
        ].map(({ k, label }) => (
          <div key={k} className="bg-secondary/40 rounded-lg p-3">
            <p className="text-[10px] uppercase text-muted-foreground mb-1">{label}</p>
            {editing ? (
              <input type="number" value={(vals as any)[k]} onChange={e => setVals({ ...vals, [k]: parseInt(e.target.value || "0") })} className="w-full bg-transparent text-lg font-bold outline-none" />
            ) : (
              <p className="text-lg font-bold">{(vals as any)[k]}</p>
            )}
          </div>
        ))}
        <div className="bg-primary/10 rounded-lg p-3">
          <p className="text-[10px] uppercase text-primary mb-1">{t("c1.fundraisingROI.conversion")}</p>
          <p className="text-lg font-bold text-primary">{conversion}%</p>
        </div>
      </div>
    </GHCard>
  );
}
