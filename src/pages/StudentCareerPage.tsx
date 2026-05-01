import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useStudentProfile, useStudentApplications } from "@/hooks/useNewProfilesData";
import RoleGuard from "@/components/RoleGuard";
import { GraduationCap, Briefcase, FileText, Plus, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function StudentContent() {
  const { data: profile, upsert } = useStudentProfile();
  const { data: applications = [], create } = useStudentApplications();
  const [tab, setTab] = useState<"profile" | "applications">("profile");
  const [open, setOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);

  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.status === "interview").length,
    offers: applications.filter(a => a.status === "offer" || a.status === "accepted").length,
    pending: applications.filter(a => a.status === "pending").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📨" value={String(stats.total)} label="Candidatures" badge="Total" badgeType="neutral" />
        <MetricCard icon="🎯" value={String(stats.interviews)} label="Entretiens" badge="En cours" badgeType="up" />
        <MetricCard icon="🏆" value={String(stats.offers)} label="Offres reçues" badge="Succès" badgeType="up" />
        <MetricCard icon="⏳" value={String(stats.pending)} label="En attente" badge="Suivi" badgeType="neutral" />
      </div>

      <div className="flex gap-1.5 mb-5">
        {([
          { key: "profile" as const, label: "🎓 Mon profil carrière" },
          { key: "applications" as const, label: `📨 Candidatures (${stats.total})` },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`h-[34px] px-4 rounded-xl text-xs font-bold font-heading border transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground/50 hover:border-primary/30"
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === "profile" && (
        <GHCard>
          {!profile ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Configurez votre profil carrière pour être visible des recruteurs.</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button>Configurer mon profil</Button></DialogTrigger>
                <ProfileDialog onSubmit={(p) => { upsert.mutate(p); setOpen(false); }} initial={profile} />
              </Dialog>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-base font-bold">{profile.university || "Université non renseignée"}</h3>
                  <p className="text-xs text-muted-foreground">{profile.degree} {profile.field_of_study && `· ${profile.field_of_study}`}</p>
                  {profile.graduation_year && <p className="text-[11px] text-muted-foreground mt-1">Diplôme prévu : {profile.graduation_year}</p>}
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button variant="outline" size="sm">Modifier</Button></DialogTrigger>
                  <ProfileDialog onSubmit={(p) => { upsert.mutate(p); setOpen(false); }} initial={profile} />
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.looking_for && <Tag variant="green">Recherche : {profile.looking_for}</Tag>}
                {profile.availability && <Tag>Dispo : {profile.availability}</Tag>}
                {(profile.career_interests ?? []).map((i: string) => <Tag key={i}>{i}</Tag>)}
              </div>
              <div className="flex gap-2 text-xs">
                {profile.cv_url && <a href={profile.cv_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />CV</a>}
                {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Portfolio</a>}
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />LinkedIn</a>}
              </div>
            </>
          )}
        </GHCard>
      )}

      {tab === "applications" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={appOpen} onOpenChange={setAppOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Ajouter une candidature</Button></DialogTrigger>
              <ApplicationDialog onSubmit={(p) => { create.mutate(p); setAppOpen(false); }} />
            </Dialog>
          </div>
          {applications.length === 0 ? (
            <GHCard className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune candidature enregistrée.</p>
            </GHCard>
          ) : applications.map(app => (
            <GHCard key={app.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold">{app.position}</div>
                <div className="text-[11px] text-muted-foreground">{app.company_name} · {app.application_type}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Candidaté le {new Date(app.applied_at).toLocaleDateString("fr-FR")}</div>
              </div>
              <Tag variant={app.status === "offer" || app.status === "accepted" ? "green" : app.status === "rejected" ? "default" : "default"}>{app.status}</Tag>
            </GHCard>
          ))}
        </div>
      )}
    </>
  );
}

function ProfileDialog({ initial, onSubmit }: { initial: any; onSubmit: (p: any) => void }) {
  const [form, setForm] = useState({
    university: initial?.university ?? "",
    degree: initial?.degree ?? "",
    field_of_study: initial?.field_of_study ?? "",
    graduation_year: initial?.graduation_year ?? new Date().getFullYear() + 1,
    looking_for: initial?.looking_for ?? "internship",
    cv_url: initial?.cv_url ?? "",
    portfolio_url: initial?.portfolio_url ?? "",
    linkedin_url: initial?.linkedin_url ?? "",
    availability: initial?.availability ?? "",
    career_interests: (initial?.career_interests ?? []).join(", "),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Profil carrière</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Université</Label><Input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Diplôme</Label><Input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} placeholder="Master, Bachelor..." /></div>
          <div><Label>Année de diplôme</Label><Input type="number" value={form.graduation_year} onChange={e => setForm({ ...form, graduation_year: +e.target.value })} /></div>
        </div>
        <div><Label>Domaine d'études</Label><Input value={form.field_of_study} onChange={e => setForm({ ...form, field_of_study: e.target.value })} /></div>
        <div>
          <Label>Je cherche</Label>
          <Select value={form.looking_for} onValueChange={(v) => setForm({ ...form, looking_for: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="internship">Stage</SelectItem>
              <SelectItem value="job">Emploi</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
              <SelectItem value="mentorship">Mentorat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Centres d'intérêt (séparés par virgules)</Label><Input value={form.career_interests} onChange={e => setForm({ ...form, career_interests: e.target.value })} /></div>
        <div><Label>Disponibilité</Label><Input value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} placeholder="Été 2026, dès maintenant..." /></div>
        <div><Label>URL CV</Label><Input value={form.cv_url} onChange={e => setForm({ ...form, cv_url: e.target.value })} /></div>
        <div><Label>URL Portfolio</Label><Input value={form.portfolio_url} onChange={e => setForm({ ...form, portfolio_url: e.target.value })} /></div>
        <div><Label>URL LinkedIn</Label><Input value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></div>
        <Button onClick={() => onSubmit({ ...form, career_interests: form.career_interests.split(",").map(s => s.trim()).filter(Boolean) })}>Enregistrer</Button>
      </div>
    </DialogContent>
  );
}

function ApplicationDialog({ onSubmit }: { onSubmit: (p: any) => void }) {
  const [form, setForm] = useState({
    company_name: "",
    position: "",
    application_type: "internship",
    status: "pending",
    notes: "",
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nouvelle candidature</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Entreprise</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
        <div><Label>Poste</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={form.application_type} onValueChange={(v) => setForm({ ...form, application_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internship">Stage</SelectItem>
                <SelectItem value="job">Emploi</SelectItem>
                <SelectItem value="apprenticeship">Alternance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Statut</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="interview">Entretien</SelectItem>
                <SelectItem value="offer">Offre</SelectItem>
                <SelectItem value="accepted">Acceptée</SelectItem>
                <SelectItem value="rejected">Refusée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
        <Button onClick={() => onSubmit(form)}>Ajouter</Button>
      </div>
    </DialogContent>
  );
}

export default function StudentCareerPage() {
  usePageMeta({ title: "Carrière étudiante", description: "Gérez votre profil carrière et vos candidatures." });

  return (
    <RoleGuard allowedRoles={["etudiant"]} fallbackMessage="Cette page est réservée aux profils Étudiant.">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
              <GraduationCap className="w-3 h-3" /> Étudiant
            </div>
            <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">Construisez votre <span className="text-primary">carrière</span></h1>
            <p className="text-sm text-muted-foreground max-w-lg">Profil visible des recruteurs, suivi de candidatures, accès aux mentors.</p>
          </div>
        </div>
        <StudentContent />
      </motion.div>
    </RoleGuard>
  );
}
