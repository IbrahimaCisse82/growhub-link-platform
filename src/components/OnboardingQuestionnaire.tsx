import { useState } from "react";
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
  Code2, Building, Star, ShieldCheck
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
const INTERESTS_LIST = ["Levée de fonds", "Trouver un co-fondateur", "Mentorat", "Networking", "Recrutement", "Partenariats", "Internationalisation", "Formation", "Incubation / Accélération", "Visibilité média"];

const STEPS = [
  { icon: UserCircle, title: "Votre profil", subtitle: "Quel type d'utilisateur êtes-vous ?" },
  { icon: Building2, title: "Votre activité", subtitle: "Parlez-nous de votre projet" },
  { icon: MapPin, title: "Localisation", subtitle: "Où êtes-vous basé ?" },
  { icon: Briefcase, title: "Compétences", subtitle: "Quels sont vos talents ?" },
  { icon: Target, title: "Objectifs", subtitle: "Que cherchez-vous ?" },
  { icon: Sparkles, title: "Finitions", subtitle: "Un dernier mot sur vous" },
];

interface Props { onComplete: () => void; }

export default function OnboardingQuestionnaire({ onComplete }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("startup");
  const [form, setForm] = useState({
    company_name: "", company_stage: "", sector: "", city: "", country: "France",
    skills: [] as string[], interests: [] as string[], bio: "", linkedin_url: "", website_url: "",
  });

  const toggleItem = (key: "skills" | "interests", item: string) => {
    setForm(f => ({ ...f, [key]: f[key].includes(item) ? f[key].filter(i => i !== item) : [...f[key], item] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      const { error } = await supabase.from("profiles").update({
        company_name: form.company_name || null, company_stage: form.company_stage || null, sector: form.sector || null,
        city: form.city || null, country: form.country || null, skills: form.skills, interests: form.interests,
        bio: form.bio || null, linkedin_url: form.linkedin_url || null, website_url: form.website_url || null,
      }).eq("user_id", user.id);
      if (error) throw error;

      // Update role via secure RPC (SECURITY DEFINER prevents self-assigning admin)
      const { error: roleError } = await supabase.rpc("set_user_role", {
        _role: selectedRole as "startup" | "mentor" | "investor" | "expert" | "freelance" | "incubateur" | "etudiant" | "aspirationnel" | "professionnel" | "corporate",
      });
      if (roleError) throw roleError;

      toast.success("Profil complété avec succès ! 🎉");
      onComplete();
    } catch (e: any) { toast.error(e.message || "Erreur"); } finally { setSaving(false); }
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!selectedRole;
      case 1: return form.company_name && form.sector;
      case 2: return form.city;
      case 3: return form.skills.length >= 1;
      case 4: return form.interests.length >= 1;
      default: return true;
    }
  };

  const StepIcon = STEPS[step].icon;

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
              <div><h2 className="font-heading text-lg font-bold text-foreground">{STEPS[step].title}</h2><p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p></div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                
                {/* Step 0: Role selection */}
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary shadow-md"
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-heading font-bold text-foreground">{role.label}</div>
                            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{role.desc}</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step 1: Activity */}
                {step === 1 && (<>
                  <div className="space-y-2"><Label>Nom de l'entreprise / projet</Label><Input placeholder="Ex: GrowHubLink" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
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
                  <div className="space-y-2"><Label>Secteur d'activité</Label>
                    <div className="flex flex-wrap gap-2">{SECTORS.map(s => (
                      <Badge key={s} variant={form.sector === s ? "default" : "outline"} className={`cursor-pointer transition-all ${form.sector === s ? "" : "hover:border-primary/40"}`} onClick={() => setForm({ ...form, sector: s })}>{s}</Badge>
                    ))}</div>
                  </div>
                </>)}

                {/* Step 2: Location */}
                {step === 2 && (<>
                  <div className="space-y-2"><Label>Ville</Label><Input placeholder="Ex: Paris" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Pays</Label><Input placeholder="France" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="flex items-center gap-1.5"><Linkedin className="w-4 h-4" /> LinkedIn (optionnel)</Label><Input placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Site web (optionnel)</Label><Input placeholder="https://..." value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} /></div>
                </>)}

                {/* Step 3: Skills */}
                {step === 3 && (
                  <div className="space-y-2"><Label>Sélectionnez vos compétences (min. 1)</Label>
                    <div className="flex flex-wrap gap-2">{SKILLS_LIST.map(s => (
                      <Badge key={s} variant={form.skills.includes(s) ? "default" : "outline"} className={`cursor-pointer transition-all ${form.skills.includes(s) ? "" : "hover:border-primary/40"}`} onClick={() => toggleItem("skills", s)}>
                        {form.skills.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                      </Badge>
                    ))}</div>
                  </div>
                )}

                {/* Step 4: Interests */}
                {step === 4 && (
                  <div className="space-y-2"><Label>Que recherchez-vous sur GrowHubLink ? (min. 1)</Label>
                    <div className="flex flex-wrap gap-2">{INTERESTS_LIST.map(s => (
                      <Badge key={s} variant={form.interests.includes(s) ? "default" : "outline"} className={`cursor-pointer transition-all ${form.interests.includes(s) ? "" : "hover:border-primary/40"}`} onClick={() => toggleItem("interests", s)}>
                        {form.interests.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                      </Badge>
                    ))}</div>
                  </div>
                )}

                {/* Step 5: Bio */}
                {step === 5 && (
                  <div className="space-y-2"><Label>Bio / pitch en quelques lignes (optionnel)</Label>
                    <Textarea placeholder="Décrivez votre projet, votre parcours..." rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
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
