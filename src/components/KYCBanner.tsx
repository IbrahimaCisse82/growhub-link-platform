import { useState } from "react";
import { useKYC } from "@/hooks/useKYC";
import { ShieldAlert, ShieldCheck, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function KYCBanner() {
  const { t } = useTranslation();
  const { kyc, requiresKYC, submit } = useKYC();
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState("passport");
  const [docUrl, setDocUrl] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (!requiresKYC || dismissed) return null;
  if (kyc?.status === "verified") return null;

  const status = kyc?.status;

  const handleSubmit = async () => {
    if (!docUrl.trim()) {
      toast.error(t("prof.kyc.provideDocument"));
      return;
    }
    try {
      await submit.mutateAsync({ document_type: docType, document_url: docUrl });
      toast.success(t("prof.kyc.submitted"));
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || t("prof.kyc.submitError"));
    }
  };

  const colorClass =
    status === "rejected"
      ? "bg-destructive/10 border-destructive/30 text-destructive"
      : status === "pending"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
      : "bg-primary/10 border-primary/30 text-primary";

  return (
    <div className={`relative border rounded-2xl p-4 mb-5 ${colorClass}`}>
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 opacity-60 hover:opacity-100" aria-label={t("prof.kyc.close")}>
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        {status === "pending" ? <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" /> : status === "rejected" ? <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <p className="font-heading font-bold text-sm">
            {status === "pending" ? t("prof.kyc.statusPendingTitle") : status === "rejected" ? t("prof.kyc.statusRejectedTitle") : t("prof.kyc.statusRequiredTitle")}
          </p>
          <p className="text-xs mt-1 opacity-90">
            {status === "pending"
              ? t("prof.kyc.pendingDesc")
              : status === "rejected"
              ? t("prof.kyc.rejectedDesc", { reason: kyc?.notes ? t("prof.kyc.rejectedReason", { notes: kyc.notes }) : "" })
              : t("prof.kyc.requiredDesc")}
          </p>
          {(status !== "pending" || status === undefined) && (
            <button onClick={() => setOpen(o => !o)} className="mt-2 text-xs font-bold underline">
              {open ? t("prof.kyc.cancel") : status === "rejected" ? t("prof.kyc.submitAgain") : t("prof.kyc.startVerification")}
            </button>
          )}
          {open && (
            <div className="mt-3 space-y-2 bg-background/60 p-3 rounded-lg">
              <label className="block text-xs font-bold">{t("prof.kyc.docTypeLabel")}</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                <option value="passport">{t("prof.kyc.passport")}</option>
                <option value="id_card">{t("prof.kyc.idCard")}</option>
                <option value="company_kbis">{t("prof.kyc.kbis")}</option>
              </select>
              <label className="block text-xs font-bold mt-2">{t("prof.kyc.docUrlLabel")}</label>
              <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder={t("prof.kyc.docUrlPlaceholder")} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <button onClick={handleSubmit} disabled={submit.isPending} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50">
                {submit.isPending && <Loader2 className="w-3 h-3 animate-spin" />} {t("prof.kyc.sendRequest")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
