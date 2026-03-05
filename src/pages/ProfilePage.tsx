import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, User, Briefcase, MapPin, Globe, Linkedin } from "lucide-react";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    company_name: "",
    company_stage: "",
    sector: "",
    city: "",
    country: "",
    website_url: "",
    linkedin_url: "",
    skills: "",
    interests: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        company_name: profile.company_name ?? "",
        company_stage: profile.company_stage ?? "",
        sector: profile.sector ?? "",
        city: profile.city ?? "",
        country: profile.country ?? "",
        website_url: (profile as any).website_url ?? "",
        linkedin_url: (profile as any).linkedin_url ?? "",
        skills: (profile.skills ?? []).join(", "),
        interests: (profile.interests ?? []).join(", "),
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name,
      bio: form.bio,
      company_name: form.company_name,
      company_stage: form.company_stage,
      sector: form.sector,
      city: form.city,
      country: form.country,
      website_url: form.website_url || null,
      linkedin_url: form.linkedin_url || null,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Profil mis à jour !");
  };

  const Field = ({ label, icon: Icon, field, textarea }: { label: string; icon?: any; field: keyof typeof form; textarea?: boolean }) => (
    <div>
      <label className="text-xs font-bold text-foreground/70 mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </label>
      {textarea ? (
        <textarea
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-primary/40 transition-colors"
        />
      ) : (
        <input
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 transition-colors"
        />
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Mon Profil
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Votre <span className="text-primary">identité</span> professionnelle
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👁️" value={String(profile?.profile_views ?? 0)} label="Vues du profil" badge="Total" badgeType="up" />
        <MetricCard icon="🤝" value={String(profile?.network_score ?? 0)} label="Score réseau" badge="/100" badgeType="up" />
        <MetricCard icon="🎯" value={String((profile?.skills ?? []).length)} label="Compétences" badge="Actives" badgeType="neutral" />
        <MetricCard icon="🌐" value={profile?.sector ?? "—"} label="Secteur" badge="Actif" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <GHCard title="Informations personnelles">
          <div className="space-y-4">
            <Field label="Nom complet" icon={User} field="display_name" />
            <Field label="Bio" field="bio" textarea />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville" icon={MapPin} field="city" />
              <Field label="Pays" field="country" />
            </div>
          </div>
        </GHCard>

        <GHCard title="Informations professionnelles">
          <div className="space-y-4">
            <Field label="Entreprise" icon={Briefcase} field="company_name" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stage" field="company_stage" />
              <Field label="Secteur" field="sector" />
            </div>
            <Field label="Site web" icon={Globe} field="website_url" />
            <Field label="LinkedIn" icon={Linkedin} field="linkedin_url" />
          </div>
        </GHCard>

        <GHCard title="Compétences & Intérêts" className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Compétences (séparées par des virgules)" field="skills" />
            <Field label="Intérêts (séparés par des virgules)" field="interests" />
          </div>
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.skills.map((s) => <Tag key={s} variant="green">{s}</Tag>)}
            </div>
          )}
        </GHCard>
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover hover:shadow-glow transition-all"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
        </button>
      </div>
    </motion.div>
  );
}
