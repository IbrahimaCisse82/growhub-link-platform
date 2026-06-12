import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { GraduationCap, CheckCircle2, Clock, XCircle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useMyCoach, useMyCoachApplication, useSubmitCoachApplication } from "@/hooks/useCoachManagement";

const SPECIALTIES = ["Stratégie", "Marketing", "Vente", "Produit", "Levée de fonds", "Tech", "RH", "Finance", "Leadership"];

export default function BecomeCoachPage() {
  usePageMeta({ title: "Devenir coach", description: "Postulez pour rejoindre nos coachs et accompagner d'autres entrepreneurs." });
  const { data: coach } = useMyCoach();
  const { data: app, isLoading } = useMyCoachApplication();
  const submit = useSubmitCoachApplication();

  const [bio, setBio] = useState("");
  const [specs, setSpecs] = useState<string[]>([]);
  const [languages, setLanguages] = useState("Français");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [linkedin, setLinkedin] = useState("");

  if (coach) return <Navigate to="/coach-studio" replace />;
  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;

  const toggleSpec = (s: string) => setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = () => {
    if (bio.trim().length < 50) { toast.error("Bio trop courte (50 caractères min)"); return; }
    if (specs.length === 0) { toast.error("Sélectionnez au moins une spécialité"); return; }
    submit.mutate(
      {
        bio,
        specialties: specs,
        languages: languages.split(",").map(l => l.trim()).filter(Boolean),
        hourlyRate: rate ? Number(rate) : undefined,
        yearsExperience: years ? Number(years) : undefined,
        linkedinUrl: linkedin || undefined,
      },
      { onSuccess: () => toast.success("Candidature envoyée !"), onError: () => toast.error("Erreur") }
    );
  };

  if (app) {
    const map: Record<string, { icon: any; color: string; label: string; desc: string }> = {
      pending: { icon: Clock, color: "text-amber-500", label: "En attente", desc: "Votre dossier est en cours d'examen. Vous serez notifié sous 48h." },
      approved: { icon: CheckCircle2, color: "text-primary", label: "Approuvée", desc: "Bienvenue parmi les coachs !" },
      rejected: { icon: XCircle, color: "text-destructive", label: "Refusée", desc: app.admin_notes ?? "Vous pouvez nous contacter pour plus de détails." },
    };
    const cfg = map[app.status] ?? map.pending;
    const Icon = cfg.icon;
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
        <GHCard className="text-center py-10">
          <Icon className={`w-12 h-12 mx-auto mb-3 ${cfg.color}`} />
          <h2 className="font-heading text-xl font-extrabold mb-2">Candidature {cfg.label}</h2>
          <p className="text-sm text-muted-foreground mb-4">{cfg.desc}</p>
          <div className="flex flex-wrap justify-center gap-1">
            {(app.specialties ?? []).map((s: string) => <Tag key={s} variant="green">{s}</Tag>)}
          </div>
        </GHCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-8 mb-5">
        <GraduationCap className="w-8 h-8 text-primary mb-3" />
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold mb-2">Devenir <span className="text-primary">coach</span></h1>
        <p className="text-sm text-muted-foreground">Partagez votre expertise, accompagnez des entrepreneurs et générez des revenus (commission 15%).</p>
      </div>

      <GHCard className="space-y-4">
        <div>
          <label className="text-xs font-bold mb-1.5 block">Bio professionnelle *</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Présentez votre parcours, vos réussites, votre approche..." className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-xs font-bold mb-1.5 block">Spécialités *</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => (
              <button key={s} onClick={() => toggleSpec(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${specs.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 border-border hover:border-primary/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold mb-1.5 block">Langues</label>
            <input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Français, Anglais" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">Tarif horaire (XOF)</label>
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="25000" className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">Années d'expérience</label>
            <input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">LinkedIn</label>
            <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://..." className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submit.isPending} className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-bold disabled:opacity-50">
          {submit.isPending ? "Envoi..." : "Soumettre ma candidature"}
        </button>
      </GHCard>
    </motion.div>
  );
}
