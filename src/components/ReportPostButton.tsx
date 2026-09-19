import { useState } from "react";
import { Flag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportPost } from "@/hooks/useFeedExtras";

export default function ReportPostButton({ postId, className }: { postId: string; className?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const report = useReportPost();

  const REASONS = [
    { value: "spam", label: t("c1.reportPostButton.reasons.spam") },
    { value: "harassment", label: t("c1.reportPostButton.reasons.harassment") },
    { value: "misinformation", label: t("c1.reportPostButton.reasons.misinformation") },
    { value: "inappropriate", label: t("c1.reportPostButton.reasons.inappropriate") },
    { value: "scam", label: t("c1.reportPostButton.reasons.scam") },
    { value: "other", label: t("c1.reportPostButton.reasons.other") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={className ?? "text-muted-foreground hover:text-destructive transition-colors"}
          aria-label={t("c1.reportPostButton.ariaLabel")}
          title={t("c1.reportPostButton.title")}
        >
          <Flag className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("c1.reportPostButton.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t("c1.reportPostButton.detailsPlaceholder")}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>{t("c1.reportPostButton.cancel")}</Button>
          <Button
            onClick={() => report.mutate(
              { postId, reason, details: details.trim() || undefined },
              { onSuccess: () => setOpen(false) },
            )}
            disabled={report.isPending}
          >
            {report.isPending ? t("c1.reportPostButton.sending") : t("c1.reportPostButton.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
