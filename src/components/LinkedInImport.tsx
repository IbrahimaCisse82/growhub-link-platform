import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Linkedin, Upload, CheckCircle, User, Briefcase, MapPin, Link2 } from "lucide-react";

export default function LinkedInImport() {
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    headline: "",
    bio: "",
    company_name: "",
    sector: "",
    city: "",
    linkedin_url: "",
    skills: "",
  });
  const [step, setStep] = useState<"input" | "preview" | "done">("input");

  const importProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from("profiles").update({
        display_name: data.display_name || undefined,
        headline: data.headline || undefined,
        bio: data.bio || undefined,
        company_name: data.company_name || undefined,
        sector: data.sector || undefined,
        city: data.city || undefined,
        linkedin_url: data.linkedin_url || undefined,
        skills: skills.length > 0 ? skills : undefined,
      }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchProfile();
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profil mis à jour depuis LinkedIn !");
      setStep("done");
    },
  });

  return (
    <GHCard className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
          <Linkedin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">Import LinkedIn</h3>
          <p className="text-[10px] text-muted-foreground">Importez vos informations depuis votre profil LinkedIn</p>
        </div>
      </div>

      {step === "input" && (
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground bg-blue-600/5 border border-blue-600/10 rounded-xl p-3">
            💡 Copiez les informations de votre profil LinkedIn ci-dessous. Seuls les champs remplis seront mis à jour.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block flex items-center gap-1"><User className="w-3 h-3" /> Nom complet</label>
              <input value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} placeholder={profile?.display_name || "John Doe"} className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3" /> Titre / Headline</label>
              <input value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} placeholder="CEO & Co-founder" className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3" /> Entreprise</label>
              <input value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder={profile?.company_name || "Ma Startup"} className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Ville</label>
              <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder={profile?.city || "Paris"} className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Secteur</label>
              <input value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} placeholder={profile?.sector || "Tech / SaaS"} className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block flex items-center gap-1"><Link2 className="w-3 h-3" /> URL LinkedIn</label>
              <input value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Compétences (séparées par virgules)</label>
            <input value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Marketing, Fundraising..." className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Bio / Résumé</label>
            <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Votre résumé LinkedIn..." rows={3} className="w-full bg-secondary rounded-lg px-3 py-2 text-xs border border-border focus:border-blue-600 outline-none resize-none" />
          </div>
          <button
            onClick={() => setStep("preview")}
            disabled={!formData.display_name && !formData.headline && !formData.bio && !formData.company_name}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Prévisualiser l'import
          </button>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-3">
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            {formData.display_name && <div className="text-xs"><span className="font-bold">Nom :</span> {formData.display_name}</div>}
            {formData.headline && <div className="text-xs"><span className="font-bold">Titre :</span> {formData.headline}</div>}
            {formData.company_name && <div className="text-xs"><span className="font-bold">Entreprise :</span> {formData.company_name}</div>}
            {formData.sector && <div className="text-xs"><span className="font-bold">Secteur :</span> {formData.sector}</div>}
            {formData.city && <div className="text-xs"><span className="font-bold">Ville :</span> {formData.city}</div>}
            {formData.skills && <div className="text-xs"><span className="font-bold">Compétences :</span> {formData.skills}</div>}
            {formData.bio && <div className="text-xs"><span className="font-bold">Bio :</span> {formData.bio.substring(0, 100)}...</div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep("input")} className="flex-1 bg-secondary rounded-xl py-2 text-xs font-bold">Modifier</button>
            <button onClick={() => importProfile.mutate(formData)} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Confirmer l'import
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h4 className="font-heading text-sm font-bold mb-1">Profil mis à jour !</h4>
          <p className="text-[10px] text-muted-foreground">Vos informations LinkedIn ont été importées avec succès.</p>
          <button onClick={() => { setStep("input"); setFormData({ display_name: "", headline: "", bio: "", company_name: "", sector: "", city: "", linkedin_url: "", skills: "" }); }} className="mt-3 text-xs text-primary font-bold">Importer à nouveau</button>
        </motion.div>
      )}
    </GHCard>
  );
}
