import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Rocket, Building2, MapPin, Briefcase, Target, Sparkles,
  ArrowRight, ArrowLeft, Check, Loader2, Globe, Linkedin,
  UserCircle, Lightbulb, GraduationCap, Landmark, BriefcaseBusiness,
  Code2, Building, Star, ShieldCheck, Compass
} from "lucide-react";

const ROLES = [
  { value: "startup", label: "Startup", desc: "Je lance ou développe ma startup", icon: Rocket, color: "from-emerald-500 to-teal-600" },
  { value: "professionnel", label: "Professionnel", desc: "Je suis salarié ou indépendant en poste", icon: BriefcaseBusiness, color: "from-blue-500 to-indigo-600" },
  { value: "freelance", label: "Freelance", desc: "Je propose mes services en indépendant", icon: Code2, color: "from-violet-500 to-purple-600" },
  { value: "mentor", label: "Mentor", desc: "J'accompagne des entrepreneurs", icon: Lightbulb, color: "from-amber-500 to-orange-600" },
  { value: "investor", label: "Investisseur", desc: "Je finance des projets innovants", icon: Landmark, color: "from-yellow-500 to-amber-600" },
  { value: "expert", label: "Expert", desc: "Je partage mon expertise sectorielle", icon: ShieldCheck, color: "from-cyan-500 to-blue-600" },
  { value: "etudiant", label: "Étudiant", desc: "J'apprends et je prépare mon projet", icon: GraduationCap, color: "from-pink-500 to-rose-600" },
  { value: "aspirationnel", label: "Aspirationnel", desc: "J'explore l'entrepreneuriat", icon: Star, color: "from-fuchsia-500 to-pink-600" },
  { value: "incubateur", label: "Incubateur", desc: "J'accompagne des cohortes de startups", icon: Building2, color: "from-teal-500 to-emerald-600" },
  { value: "corporate", label: "Corporate", desc: "Je représente une entreprise / grand groupe", icon: Building, color: "from-slate-500 to-gray-600" },
];

const SECTORS = ["SaaS / Tech", "FinTech", "HealthTech", "EdTech", "E-commerce", "GreenTech", "FoodTech", "PropTech", "LegalTech", "DeepTech / IA", "Média / Contenu", "Autre"];
const STAGES = [
  { value: "idea", label: "💡 Idéation", desc: "J'ai une idée" },
  { value: "mvp", label: "🛠️ MVP", desc: "En développement" },
  { value: "launch", label: "🚀 Lancement", desc: "Premiers clients" },
  { value: "growth", label: "📈 Croissance", desc: "Scaling" },
  { value: "scale", label: "🏢 Scale-up", desc: "Levée Série A+" },
];
const SKILLS_LIST = ["Product Management", "Growth Hacking", "Marketing Digital", "Développement Web", "Data Science / IA", "Design UX/UI", "Finance / Comptabilité", "Sales / BizDev", "RH / Recrutement", "Juridique", "Ops / Logistique", "Stratégie"];
const LOOKING_FOR = ["Co-fondateur", "Investisseur", "Mentor", "Clients", "Partenaires", "Talents / Recrutement", "Formation", "Visibilité", "Conseil juridique", "Accompagnement technique"];
const OFFERING = ["Mentorat", "Investissement", "Expertise technique", "Design / UX", "Conseils stratégiques", "Intros investisseurs", "Intros clients", "Coaching", "Formation", "Services marketing"];

// Role-specific options
const STUDENT_LOOKING = ["internship", "job", "both", "mentorship"];
const STUDENT_LOOKING_LABELS: Record<string, string> = { internship: "Stage", job: "Emploi", both: "Stage & Emploi", mentorship: "Mentorat" };
const CAREER_INTERESTS = ["Tech", "Finance", "Marketing", "Conseil", "Entrepreneuriat", "Design", "Data", "Produit"];
const SKILL_LEVELS = [{ v: "beginner", l: "Débutant" }, { v: "intermediate", l: "Intermédiaire" }, { v: "advanced", l: "Avancé" }, { v: "expert", l: "Expert" }];
const ASPIRATIONAL_INTERESTS = ["Découvrir l'écosystème", "Comprendre la levée de fonds", "Trouver une idée", "Apprendre les bases", "Rencontrer des entrepreneurs", "Tester un side-project"];

interface Props { onComplete: () => void; }

export default function OnboardingQuestionnaire({ onComplete }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("startup");
  const [form, setForm] = useState({
    company_name: "", company_stage: "", sector: "", city: "", country: "France",
    skills: [] as string[], looking_for: [] as string[],
    offering: [] as string[], bio: "", headline: "", linkedin_url: "", website_url: "",
  });
  // Role-specific form
  const [roleForm, setRoleForm] = useState<any>({
    // student
    university: "", degree: "", graduation_year: "", field_of_study: "", student_looking: "internship", career_interests: [] as string[],
    // corporate
    industry: "", challenge_title: "", challenge_description: "", budget_range: "",
    // pro
    skill_target: "", current_level: "intermediate", target_level: "advanced",
    // aspirational
    aspirations: [] as string[],
    // incubator
    cohort_name: "", program_focus: "", capacity: 10,
  });

  const toggleItem = (key: "skills" | "looking_for" | "offering", item: string) => {
    setForm(f => ({ ...f, [key]: f[key].includes(item) ? f[key].filter(i => i !== item) : [...f[key], item] }));
  };
  const toggleRoleArr = (key: string, item: string) => {
    setRoleForm((f: any) => ({ ...f, [key]: f[key].includes(item) ? f[key].filter((i: string) => i !== item) : [...f[key], item] }));
  };

  // Dynamic steps based on role
  const STEPS = useMemo(() => {
    const base = [
      { key: "role", icon: UserCircle, title: "Votre profil", subtitle: "Quel type d'utilisateur êtes-vous ?" },
      { key: "activity", icon: Building2, title: "Votre activité", subtitle: "Parlez-nous de votre contexte" },
      { key: "location", icon: MapPin, title: "Localisation", subtitle: "Où êtes-vous basé ?" },
      { key: "skills", icon: Briefcase, title: "Compétences", subtitle: "Quels sont vos talents ?" },
      { key: "looking", icon: Target, title: "Ce que je cherche", subtitle: "Que recherchez-vous ?" },
      { key: "offering", icon: Sparkles, title: "Ce que je propose", subtitle: "Que pouvez-vous apporter ?" },
    ];
    // Role-specific deep step
    if (["etudiant", "corporate", "professionnel", "aspirationnel", "incubateur"].includes(selectedRole)) {
      base.push({ key: "rolespec", icon: Compass, title: "Spécifique à votre rôle", subtitle: "Quelques questions ciblées" });
    }
    base.push({ key: "bio", icon: Sparkles, title: "Finitions", subtitle: "Un dernier mot sur vous" });
    return base;
  }, [selectedRole]);

  const currentStep = STEPS[step];

  // Save role-specific data into the matching table
  const saveRoleSpecific = async () => {
    if (!user) return;
    try {
      if (selectedRole === "etudiant" && roleForm.university) {
        await supabase.from("student_career_profiles").upsert({
          user_id: user.id,
          university: roleForm.university || null,
          degree: roleForm.degree || null,
          graduation_year: roleForm.graduation_year ? parseInt(roleForm.graduation_year) : null,
          field_of_study: roleForm.field_of_study || null,
          looking_for: roleForm.student_looking || null,
          career_interests: roleForm.career_interests,
        }, { onConflict: "user_id" });
      } else if (selectedRole === "corporate" && roleForm.challenge_title) {
        await supabase.from("corporate_challenges").insert({
          corporate_id: user.id,
          title: roleForm.challenge_title,
          description: roleForm.challenge_description || roleForm.challenge_title,
          industry: roleForm.industry || form.sector || null,
          budget_range: roleForm.budget_range || null,
          status: "draft",
        });
      } else if (selectedRole === "professionnel" && roleForm.skill_target) {
        await supabase.from("pro_development_goals").insert({
          user_id: user.id,
          skill_target: roleForm.skill_target,
          current_level: roleForm.current_level,
          target_level: roleForm.target_level,
          status: "in_progress",
        });
      } else if (selectedRole === "aspirationnel" && roleForm.aspirations.length > 0) {
        const rows = roleForm.aspirations.map((a: string) => ({
          user_id: user.id, step_key: a.toLowerCase().replace(/\s+/g, "_"), step_title: a, completed: false,
        }));
        await supabase.from("aspirational_journey").upsert(rows, { onConflict: "user_id,step_key" });
      } else if (selectedRole === "incubateur" && roleForm.cohort_name) {
        await supabase.from("incubator_cohorts").insert({
          incubator_id: user.id,
          name: roleForm.cohort_name,
          program_focus: roleForm.program_focus || null,
          capacity: roleForm.capacity || 10,
          status: "recruiting",
        });
      }
    } catch (e) {
      console.error("Role-specific save failed", e);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        company_name: form.company_name || null, company_stage: form.company_stage || null, sector: form.sector || null,
        city: form.city || null, country: form.country || null, skills: form.skills, interests: [],
        looking_for: form.looking_for, offering: form.offering,
        bio: form.bio || null, headline: form.headline || null,
        linkedin_url: form.linkedin_url || null, website_url: form.website_url || null,
      }).eq("user_id", user.id);
      if (error) throw error;

      const { error: roleError } = await supabase.rpc("set_user_role", {
        _role: selectedRole as any,
      });
      if (roleError) throw roleError;

      await saveRoleSpecific();

      toast.success("Profil complété avec succès ! 🎉");
      onComplete();
    } catch (e: any) { toast.error(e.message || "Erreur"); } finally { setSaving(false); }
  };

  const canNext = () => {
    switch (currentStep.key) {
      case "role": return !!selectedRole;
      case "activity":
        if (selectedRole === "etudiant" || selectedRole === "aspirationnel") return true;
        return !!form.company_name && !!form.sector;
      case "location": return !!form.city;
      case "skills":
        if (selectedRole === "aspirationnel") return true;
        return form.skills.length >= 1;
      case "looking": return form.looking_for.length >= 1;
      case "offering":
        if (["etudiant", "aspirationnel"].includes(selectedRole)) return true;
        return form.offering.length >= 1;
      default: return true;
    }
  };

  const StepIcon = currentStep.icon;
  const activityLabel = selectedRole === "etudiant" ? "École / Université"
    : selectedRole === "corporate" ? "Nom de l'entreprise"
    : selectedRole === "professionnel" ? "Entreprise actuelle"
    : selectedRole === "aspirationnel" ? "Projet ou idée (optionnel)"
    : selectedRole === "mentor" ? "Organisation"
    : selectedRole === "investor" ? "Fonds / Structure"
    : "Nom de l'entreprise / projet";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Rocket className="w-5 h-5 text-primary-foreground" /></div>
            <span className="font-heading text-2xl font-bold text-foreground">Grow<span className="text-primary">Hub</span>Link</span>
          </div>
          <p className="text-muted-foreground text-sm">Complétez votre profil en quelques étapes</p>
        </div>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (<div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />))}
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6 pb-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><StepIcon className="w-5 h-5 text-primary" /></div>
              <div><h2 className="font-heading text-lg font-bold text-foreground">{currentStep.title}</h2><p className="text-sm text-muted-foreground">{currentStep.subtitle}</p></div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">

                {currentStep.key === "role" && (
                  <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <button key={role.value} type="button" onClick={() => setSelectedRole(role.value)}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 ${
                            isSelected ? "border-primary bg-primary/5 ring-2 ring-primary shadow-md" : "border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-heading font-bold text-foreground">{role.label}</div>
                            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{role.desc}</div>
                          </div>
                          {isSelected && (<div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentStep.key === "activity" && (<>
                  <div className="space-y-2"><Label>{activityLabel}</Label><Input placeholder="Ex: GrowHubLink" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
                  {["startup", "freelance", "incubateur"].includes(selectedRole) && (
                    <div className="space-y-2"><Label>Stade de développement</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {STAGES.map(s => (
                          <button key={s.value} type="button" onClick={() => setForm({ ...form, company_stage: s.value })}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${form.company_stage === s.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`}>
                            <span className="text-lg">{s.label.split(" ")[0]}</span>
                            <div><div className="text-sm font-medium text-foreground">{s.label.substring(s.label.indexOf(" ") + 1)}</div><div className="text-xs text-muted-foreground">{s.desc}</div></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedRole !== "aspirationnel" && (
                    <div className="space-y-2"><Label>Secteur d'activité</Label>
                      <div className="flex flex-wrap gap-2">{SECTORS.map(s => (
                        <Badge key={s} variant={form.sector === s ? "default" : "outline"} className={`cursor-pointer transition-all ${form.sector === s ? "" : "hover:border-primary/40"}`} onClick={() => setForm({ ...form, sector: s })}>{s}</Badge>
                      ))}</div>
                    </div>
                  )}
                </>)}

                {currentStep.key === "location" && (<>
                  <div className="space-y-2"><Label>Ville</Label><Input placeholder="Ex: Paris" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Pays</Label><Input placeholder="France" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="flex items-center gap-1.5"><Linkedin className="w-4 h-4" /> LinkedIn (optionnel)</Label><Input placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Site web (optionnel)</Label><Input placeholder="https://..." value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} /></div>
                </>)}

                {currentStep.key === "skills" && (
                  <div className="space-y-2"><Label>Sélectionnez vos compétences {selectedRole === "aspirationnel" ? "(optionnel)" : "(min. 1)"}</Label>
                    <div className="flex flex-wrap gap-2">{SKILLS_LIST.map(s => (
                      <Badge key={s} variant={form.skills.includes(s) ? "default" : "outline"} className={`cursor-pointer transition-all ${form.skills.includes(s) ? "" : "hover:border-primary/40"}`} onClick={() => toggleItem("skills", s)}>
                        {form.skills.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                      </Badge>
                    ))}</div>
                  </div>
                )}

                {currentStep.key === "looking" && (
                  <div className="space-y-2"><Label>Que recherchez-vous ? (min. 1)</Label>
                    <div className="flex flex-wrap gap-2">{LOOKING_FOR.map(s => (
                      <Badge key={s} variant={form.looking_for.includes(s) ? "default" : "outline"} className={`cursor-pointer transition-all ${form.looking_for.includes(s) ? "" : "hover:border-primary/40"}`} onClick={() => toggleItem("looking_for", s)}>
                        {form.looking_for.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                      </Badge>
                    ))}</div>
                  </div>
                )}

                {currentStep.key === "offering" && (
                  <div className="space-y-2"><Label>Que pouvez-vous apporter à la communauté ? {["etudiant","aspirationnel"].includes(selectedRole) ? "(optionnel)" : "(min. 1)"}</Label>
                    <div className="flex flex-wrap gap-2">{OFFERING.map(s => (
                      <Badge key={s} variant={form.offering.includes(s) ? "default" : "outline"} className={`cursor-pointer transition-all ${form.offering.includes(s) ? "" : "hover:border-primary/40"}`} onClick={() => toggleItem("offering", s)}>
                        {form.offering.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                      </Badge>
                    ))}</div>
                  </div>
                )}

                {/* ROLE-SPECIFIC STEP */}
                {currentStep.key === "rolespec" && selectedRole === "etudiant" && (
                  <div className="space-y-3">
                    <div className="space-y-2"><Label>Université / École</Label><Input value={roleForm.university} onChange={e => setRoleForm({ ...roleForm, university: e.target.value })} placeholder="Ex: HEC Paris" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2"><Label>Diplôme</Label><Input value={roleForm.degree} onChange={e => setRoleForm({ ...roleForm, degree: e.target.value })} placeholder="Master 2" /></div>
                      <div className="space-y-2"><Label>Année diplôme</Label><Input type="number" value={roleForm.graduation_year} onChange={e => setRoleForm({ ...roleForm, graduation_year: e.target.value })} placeholder="2026" /></div>
                    </div>
                    <div className="space-y-2"><Label>Domaine d'études</Label><Input value={roleForm.field_of_study} onChange={e => setRoleForm({ ...roleForm, field_of_study: e.target.value })} placeholder="Marketing digital" /></div>
                    <div className="space-y-2"><Label>Je cherche</Label>
                      <div className="flex flex-wrap gap-2">{STUDENT_LOOKING.map(v => (
                        <Badge key={v} variant={roleForm.student_looking === v ? "default" : "outline"} className="cursor-pointer" onClick={() => setRoleForm({ ...roleForm, student_looking: v })}>{STUDENT_LOOKING_LABELS[v]}</Badge>
                      ))}</div>
                    </div>
                    <div className="space-y-2"><Label>Centres d'intérêt carrière</Label>
                      <div className="flex flex-wrap gap-2">{CAREER_INTERESTS.map(v => (
                        <Badge key={v} variant={roleForm.career_interests.includes(v) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleRoleArr("career_interests", v)}>{v}</Badge>
                      ))}</div>
                    </div>
                  </div>
                )}

                {currentStep.key === "rolespec" && selectedRole === "corporate" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Lancez votre premier challenge d'open innovation (vous pourrez le finaliser plus tard).</p>
                    <div className="space-y-2"><Label>Titre du challenge</Label><Input value={roleForm.challenge_title} onChange={e => setRoleForm({ ...roleForm, challenge_title: e.target.value })} placeholder="Ex: IA pour la maintenance prédictive" /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={roleForm.challenge_description} onChange={e => setRoleForm({ ...roleForm, challenge_description: e.target.value })} placeholder="Décrivez votre besoin..." /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2"><Label>Industrie</Label><Input value={roleForm.industry} onChange={e => setRoleForm({ ...roleForm, industry: e.target.value })} placeholder="Énergie" /></div>
                      <div className="space-y-2"><Label>Budget</Label><Input value={roleForm.budget_range} onChange={e => setRoleForm({ ...roleForm, budget_range: e.target.value })} placeholder="50-100k€" /></div>
                    </div>
                  </div>
                )}

                {currentStep.key === "rolespec" && selectedRole === "professionnel" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Définissez votre premier objectif de développement.</p>
                    <div className="space-y-2"><Label>Compétence à développer</Label><Input value={roleForm.skill_target} onChange={e => setRoleForm({ ...roleForm, skill_target: e.target.value })} placeholder="Ex: Leadership, Product Management..." /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2"><Label>Niveau actuel</Label>
                        <div className="flex flex-wrap gap-1">{SKILL_LEVELS.map(s => (
                          <Badge key={s.v} variant={roleForm.current_level === s.v ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setRoleForm({ ...roleForm, current_level: s.v })}>{s.l}</Badge>
                        ))}</div>
                      </div>
                      <div className="space-y-2"><Label>Niveau cible</Label>
                        <div className="flex flex-wrap gap-1">{SKILL_LEVELS.map(s => (
                          <Badge key={s.v} variant={roleForm.target_level === s.v ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setRoleForm({ ...roleForm, target_level: s.v })}>{s.l}</Badge>
                        ))}</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.key === "rolespec" && selectedRole === "aspirationnel" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Choisissez vos premières étapes d'exploration. On construira votre parcours autour.</p>
                    <div className="space-y-2"><Label>Mes aspirations</Label>
                      <div className="flex flex-wrap gap-2">{ASPIRATIONAL_INTERESTS.map(v => (
                        <Badge key={v} variant={roleForm.aspirations.includes(v) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleRoleArr("aspirations", v)}>
                          {roleForm.aspirations.includes(v) && <Check className="w-3 h-3 mr-1" />}{v}
                        </Badge>
                      ))}</div>
                    </div>
                  </div>
                )}

                {currentStep.key === "rolespec" && selectedRole === "incubateur" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Créez votre première cohorte (vous pourrez ajuster plus tard).</p>
                    <div className="space-y-2"><Label>Nom de la cohorte</Label><Input value={roleForm.cohort_name} onChange={e => setRoleForm({ ...roleForm, cohort_name: e.target.value })} placeholder="Promotion 2026" /></div>
                    <div className="space-y-2"><Label>Focus du programme</Label><Input value={roleForm.program_focus} onChange={e => setRoleForm({ ...roleForm, program_focus: e.target.value })} placeholder="HealthTech early-stage" /></div>
                    <div className="space-y-2"><Label>Capacité</Label><Input type="number" value={roleForm.capacity} onChange={e => setRoleForm({ ...roleForm, capacity: parseInt(e.target.value) || 10 })} /></div>
                  </div>
                )}

                {currentStep.key === "bio" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Titre / Headline (optionnel)</Label>
                      <Input placeholder="Ex: CTO @ TechVert | IA & HealthTech" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bio / pitch en quelques lignes (optionnel)</Label>
                      <Textarea placeholder="Décrivez votre projet, votre parcours..." rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground">Passer</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="sm" disabled={!canNext()} onClick={() => setStep(step + 1)}>Suivant <ArrowRight className="w-4 h-4 ml-1" /></Button>
              ) : (
                <Button size="sm" disabled={saving} onClick={handleSave}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Terminer <Sparkles className="w-4 h-4 ml-1" /></Button>
              )}
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">Étape {step + 1} sur {STEPS.length} — Vous pourrez modifier ces informations plus tard</p>
      </div>
    </div>
  );
}
