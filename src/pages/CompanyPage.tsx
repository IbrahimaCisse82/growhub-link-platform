import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyPage, useCompanyMembers, useCreateCompanyPage, useUpdateCompanyPage } from "@/hooks/useCompanyPages";
import { Building2, Globe, MapPin, Edit2, Plus, Save, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";

export default function CompanyPage() {
  usePageMeta({ title: "Page Entreprise", description: "Gérez la vitrine de votre startup." });
  const { user } = useAuth();
  const { data: companyRaw, isLoading, refetch } = useCompanyPage(user?.id);
  const company = companyRaw as any;
  const { data: members } = useCompanyMembers(company?.id);
  const createPage = useCreateCompanyPage();
  const updatePage = useUpdateCompanyPage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", sector: "", stage: "", website: "", location: "", team_size: "", founded_year: new Date().getFullYear(),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !company) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Le fichier est trop lourd (max 5MB)"); return; }
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const path = `${company.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("company-logos").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erreur lors de l'upload"); setUploadingLogo(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("company-logos").getPublicUrl(path);
    const logoUrl = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("company_pages").update({ logo_url: logoUrl }).eq("id", company.id);
    await refetch();
    setUploadingLogo(false);
    toast.success("Logo mis à jour !");
  };

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    createPage.mutate(form, {
      onSuccess: () => { toast.success("Page créée !"); setCreating(false); },
      onError: () => toast.error("Erreur"),
    });
  };

  const handleUpdate = () => {
    if (!company) return;
    updatePage.mutate({ id: company.id, ...form }, {
      onSuccess: () => { toast.success("Mis à jour !"); setEditing(false); },
    });
  };

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>;

  if (!company && !creating) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GHCard className="text-center py-16">
          <Building2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-extrabold mb-2">Créez votre page entreprise</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Présentez votre startup, votre équipe et vos métriques clés à tout l'écosystème.
          </p>
          <button onClick={() => setCreating(true)} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-heading text-sm font-bold flex items-center gap-2 mx-auto hover:bg-primary-hover transition-colors">
            <Plus className="w-4 h-4" /> Créer ma page
          </button>
        </GHCard>
      </motion.div>
    );
  }

  if (creating) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-extrabold mb-5">Nouvelle <span className="text-primary">page entreprise</span></h1>
        <GHCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Nom de l'entreprise", placeholder: "Ma Startup" },
              { key: "sector", label: "Secteur", placeholder: "SaaS, FinTech, HealthTech..." },
              { key: "stage", label: "Stade", placeholder: "Pré-seed, Seed, Série A..." },
              { key: "website", label: "Site web", placeholder: "https://..." },
              { key: "location", label: "Localisation", placeholder: "Paris, France" },
              { key: "team_size", label: "Taille d'équipe", placeholder: "1-10, 11-50..." },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/40 outline-none"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre entreprise, votre mission, votre vision..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] resize-none focus:border-primary/40 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleCreate} className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
              <Save className="w-4 h-4" /> Créer
            </button>
            <button onClick={() => setCreating(false)} className="bg-secondary text-foreground rounded-lg px-5 py-2.5 text-sm font-bold">Annuler</button>
          </div>
        </GHCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            {/* Logo with upload */}
            <div className="relative group flex-shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-primary/20" alt="Logo" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-primary/60" />
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingLogo ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
                <Building2 className="w-3 h-3" /> Page Entreprise
              </div>
              <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-1">{company.name}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                {company.sector && <span className="flex items-center gap-1"><Tag variant="green">{company.sector}</Tag></span>}
                {company.stage && <span className="flex items-center gap-1"><Tag variant="blue">{company.stage}</Tag></span>}
                {company.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.location}</span>}
                {company.website && <a href={company.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline"><Globe className="w-3 h-3" /> Site web</a>}
              </div>
            </div>
          </div>
          <button onClick={() => { setForm(company); setEditing(!editing); }} className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold hover:border-primary/30 transition-colors flex items-center gap-1.5 flex-shrink-0">
            <Edit2 className="w-3 h-3" /> Modifier
          </button>
        </div>
      </div>

      {editing && (
        <GHCard className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "name", label: "Nom" }, { key: "sector", label: "Secteur" },
              { key: "stage", label: "Stade" }, { key: "website", label: "Site web" },
              { key: "location", label: "Localisation" }, { key: "team_size", label: "Équipe" },
            ].map(f => (
              <input key={f.key} value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.label}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm" />
            ))}
            <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
              className="md:col-span-2 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none" />
          </div>
          <button onClick={handleUpdate} className="mt-3 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-bold">Enregistrer</button>
        </GHCard>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👥" value={company.team_size || "—"} label="Équipe" badge="Taille" badgeType="neutral" />
        <MetricCard icon="📅" value={company.founded_year ? String(company.founded_year) : "—"} label="Fondée" badge="Année" badgeType="neutral" />
        <MetricCard icon="🏢" value={String((members ?? []).length)} label="Membres" badge="Équipe" badgeType="up" />
        <MetricCard icon="🌍" value={company.location || "—"} label="Localisation" badge="Siège" badgeType="neutral" />
      </div>

      {company.description && (
        <GHCard className="mb-5">
          <h3 className="font-heading text-base font-extrabold mb-2">À propos</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{company.description}</p>
        </GHCard>
      )}

      {members && members.length > 0 && (
        <>
          <h3 className="font-heading text-base font-extrabold mb-3">Équipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map((m: any) => (
              <GHCard key={m.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {(m.profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-heading text-sm font-bold">{m.profile?.display_name ?? "Membre"}</div>
                  <div className="text-[11px] text-muted-foreground">{m.title || m.role}</div>
                </div>
              </GHCard>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
