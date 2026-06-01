import { useState } from "react";
import { Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportPost } from "@/hooks/useFeedExtras";

const REASONS = [
  { value: "spam", label: "Spam ou publicité" },
  { value: "harassment", label: "Harcèlement ou haine" },
  { value: "misinformation", label: "Désinformation" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "scam", label: "Arnaque" },
  { value: "other", label: "Autre" },
];

export default function ReportPostButton({ postId, className }: { postId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const report = useReportPost();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={className ?? "text-muted-foreground hover:text-destructive transition-colors"}
          aria-label="Signaler la publication"
          title="Signaler"
        >
          <Flag className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler cette publication</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Détails (optionnel)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={() => report.mutate(
              { postId, reason, details: details.trim() || undefined },
              { onSuccess: () => setOpen(false) },
            )}
            disabled={report.isPending}
          >
            {report.isPending ? "Envoi…" : "Envoyer le signalement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
