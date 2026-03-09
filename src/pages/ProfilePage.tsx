import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, User, Briefcase, MapPin, Globe, Linkedin, Camera, Loader2, Target, Gift, Sparkles } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import LinkedInImport from "@/components/LinkedInImport";

// ─── Role-specific field configs ──────────────────────────────
const roleFieldConfig: Record<string, {
  companyLabel: string;
  stageLabel: string;
  showStage: boolean;
  showHeadline: boolean;
  metricsLabels: { views: string; score: string; skills: string; sector: string };
}> = {
  startup: { companyLabel: "Startup / Entreprise", stageLabel: "Stade de développement", showStage: true, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Score réseau", skills: "Compétences", sector: "Secteur" } },
  mentor: { companyLabel: "Cabinet / Organisation", stageLabel: "Spécialité", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Score mentor", skills: "Spécialités", sector: "Domaine" } },
  investor: { companyLabel: "Fonds / Société", stageLabel: "Focus investissement", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Réputation", skills: "Expertises", sector: "Focus" } },
  expert: { companyLabel: "Cabinet / Structure", stageLabel: "Domaine d'expertise", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Score expert", skills: "Expertises", sector: "Secteur" } },
  freelance: { companyLabel: "Nom commercial", stageLabel: "Type de missions", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Réputation", skills: "Compétences", sector: "Domaine" } },
  incubateur: { companyLabel: "Incubateur / Accélérateur", stageLabel: "Programme", showStage: true, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Impact", skills: "Spécialités", sector: "Focus" } },
  etudiant: { companyLabel: "École / Université", stageLabel: "Année d'études", showStage: true, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Engagement", skills: "Compétences", sector: "Filière" } },
  aspirationnel: { companyLabel: "Projet / Idée", stageLabel: "Phase", showStage: true, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Engagement", skills: "Intérêts", sector: "Domaine" } },
  professionnel: { companyLabel: "Entreprise", stageLabel: "Poste", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Score réseau", skills: "Compétences", sector: "Secteur" } },
  corporate: { companyLabel: "Entreprise / Groupe", stageLabel: "Direction / BU", showStage: false, showHeadline: true, metricsLabels: { views: "Vues du profil", score: "Score innovation", skills: "Domaines", sector: "Industrie" } },
};

export default function ProfilePage() {
  usePageMeta({ title: "Mon Profil", description: "Gérez votre profil et vos informations publiques." });
  const { user, profile, refetchProfile } = useAuth();
  const { role } = useUserRole();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm] = useState({
    display_name: "", headline: "", bio: "", company_name: "", company_stage: "", sector: "",
    city: "", country: "", website_url: "", linkedin_url: "", skills: "", interests: "",
    looking_for: "", offering: "",
  });
  const [saving, setSaving] = useState(false);

  const config = roleFieldConfig[role] ?? roleFieldConfig.startup;

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        company_name: profile.company_name ?? "",
        company_stage: profile.company_stage ?? "",
        sector: profile.sector ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        website_url: profile.website_url ?? "",
        linkedin_url: profile.linkedin_url ?? "",
        skills: (profile.skills ?? []).join(", "),
        interests: (profile.interests ?? []).join(", "),
        looking_for: (profile.looking_for ?? []).join(", "),
        offering: (profile.offering ?? []).join(", "),
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Le fichier est trop lourd (max 5MB)"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erreur lors de l'upload"); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    await refetchProfile();
    setUploadingAvatar(false);
    toast.success("Photo de profil mise à jour !");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name,
      headline: form.headline || null,
      bio: form.bio,
      company_name: form.company_name,
      company_stage: form.company_stage,
      sector: form.sector,
      city: form.city,
      country: form.country,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
      looking_for: form.looking_for.split(",").map(s => s.trim()).filter(Boolean),
      offering: form.offering.split(",").map(s => s.trim()).filter(Boolean),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else { toast.success("Profil mis à jour !"); await refetchProfile(); }
  };

  const initials = (profile?.display_name ?? "?").substring(0, 2).toUpperCase();

  const roleLabels: Record<string, string> = {
    startup: "Startup", mentor: "Mentor", investor: "Investisseur", expert: "Expert",
    freelance: "Freelance", incubateur: "Incubateur", etudiant: "Étudiant",
    aspirationnel: "Aspirationnel", professionnel: "Professionnel", corporate: "Corporate",
  };

  const Field = ({ label, icon: Icon, field, textarea, placeholder }: { label: string; icon?: any; field: keyof typeof form; textarea?: boolean; placeholder?: string }) => (
    <div>
      <label className="text-xs font-bold text-foreground/70 mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      {textarea ? (
        <textarea value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-primary/40 transition-colors" />
      ) : (
        <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 transition-colors" />
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          {/* Avatar with upload */}
          <div className="relative group">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-primary/20" alt="Avatar" />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-2xl font-extrabold text-primary-foreground">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider">
                <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> Mon Profil
              </div>
              <Tag variant="green">{roleLabels[role] ?? "Membre"}</Tag>
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
              Votre <span className="text-primary">identité</span> professionnelle
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👁️" value={String(profile?.profile_views ?? 0)} label={config.metricsLabels.views} badge="Total" badgeType="up" />
        <MetricCard icon="🤝" value={String(profile?.network_score ?? 0)} label={config.metricsLabels.score} badge="/100" badgeType="up" />
        <MetricCard icon="🎯" value={String((profile?.skills ?? []).length)} label={config.metricsLabels.skills} badge="Actives" badgeType="neutral" />
        <MetricCard icon="🌐" value={profile?.sector ?? "—"} label={config.metricsLabels.sector} badge="Actif" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GHCard title="Informations personnelles">
          <div className="space-y-4">
            <Field label="Nom complet" icon={User} field="display_name" />
            {config.showHeadline && (
              <Field label="Titre / Headline" icon={Sparkles} field="headline" placeholder="Ex: CTO @ TechVert | IA & HealthTech" />
            )}
            <Field label="Bio" field="bio" textarea placeholder="Décrivez votre parcours, votre projet..." />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville" icon={MapPin} field="city" />
              <Field label="Pays" field="country" />
            </div>
          </div>
        </GHCard>

        <GHCard title="Informations professionnelles">
          <div className="space-y-4">
            <Field label={config.companyLabel} icon={Briefcase} field="company_name" />
            <div className="grid grid-cols-2 gap-3">
              {config.showStage && <Field label={config.stageLabel} field="company_stage" />}
              <Field label="Secteur" field="sector" />
            </div>
            <Field label="Site web" icon={Globe} field="website_url" />
            <Field label="LinkedIn" icon={Linkedin} field="linkedin_url" />
          </div>
        </GHCard>

        <GHCard title="Compétences & Intérêts">
          <div className="space-y-4">
            <Field label="Compétences (séparées par des virgules)" field="skills" placeholder="Ex: Growth, Python, UX Design" />
            <Field label="Intérêts (séparés par des virgules)" field="interests" placeholder="Ex: IA, ClimateTech, SaaS" />
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => <Tag key={s} variant="green">{s}</Tag>)}
              </div>
            )}
          </div>
        </GHCard>

        <GHCard title="Ce que je cherche & propose">
          <div className="space-y-4">
            <Field label="Je recherche (séparé par des virgules)" icon={Target} field="looking_for" placeholder="Ex: Co-fondateur tech, Investisseur Seed, Mentor marketing" />
            <Field label="Je propose (séparé par des virgules)" icon={Gift} field="offering" placeholder="Ex: Conseil en growth, Intro investisseurs, Mentorat produit" />
            {profile?.looking_for && profile.looking_for.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-foreground/50 mb-1">Recherche :</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.looking_for.map((s: string) => <Tag key={s} variant="blue">{s}</Tag>)}
                </div>
              </div>
            )}
            {profile?.offering && profile.offering.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-foreground/50 mb-1">Propose :</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.offering.map((s: string) => <Tag key={s} variant="teal">{s}</Tag>)}
                </div>
              </div>
            )}
          </div>
        </GHCard>
      </div>

      {/* LinkedIn Import */}
      <LinkedInImport />

      <div className="flex justify-end mt-5">
        <button onClick={handleSave} disabled={saving}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover hover:shadow-glow transition-all">
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
        </button>
      </div>
    </motion.div>
  );
}
