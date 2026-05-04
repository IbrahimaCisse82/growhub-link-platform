import { useState } from "react";
import { useKYC } from "@/hooks/useKYC";
import { ShieldAlert, ShieldCheck, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function KYCBanner() {
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
      toast.error("Veuillez fournir un lien vers votre pièce d'identité");
      return;
    }
    try {
      await submit.mutateAsync({ document_type: docType, document_url: docUrl });
      toast.success("Demande KYC envoyée. Délai de traitement : 5 jours ouvrés.");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
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
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 opacity-60 hover:opacity-100" aria-label="Fermer">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        {status === "pending" ? <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" /> : status === "rejected" ? <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <p className="font-heading font-bold text-sm">
            {status === "pending" ? "Vérification KYC en cours" : status === "rejected" ? "Vérification KYC refusée" : "Vérification KYC requise"}
          </p>
          <p className="text-xs mt-1 opacity-90">
            {status === "pending"
              ? "Votre dossier est en cours d'examen. Délai : 5 jours ouvrés. Accès Deal Rooms et contacts limité tant que la vérification n'est pas validée."
              : status === "rejected"
              ? `Votre demande a été refusée. ${kyc?.notes ? `Motif : ${kyc.notes}` : ""} Vous pouvez soumettre une nouvelle demande.`
              : "En tant qu'investisseur ou corporate, une vérification d'identité est obligatoire pour accéder aux Deal Rooms et au sourcing qualifié."}
          </p>
          {(status !== "pending" || status === undefined) && (
            <button onClick={() => setOpen(o => !o)} className="mt-2 text-xs font-bold underline">
              {open ? "Annuler" : status === "rejected" ? "Soumettre à nouveau" : "Démarrer la vérification"}
            </button>
          )}
          {open && (
            <div className="mt-3 space-y-2 bg-background/60 p-3 rounded-lg">
              <label className="block text-xs font-bold">Type de document</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs">
                <option value="passport">Passeport</option>
                <option value="id_card">Carte d'identité</option>
                <option value="company_kbis">KBIS / Registre de commerce</option>
              </select>
              <label className="block text-xs font-bold mt-2">Lien vers le document (Drive, Dropbox…)</label>
              <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://…" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" />
              <button onClick={handleSubmit} disabled={submit.isPending} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 disabled:opacity-50">
                {submit.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Envoyer ma demande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
