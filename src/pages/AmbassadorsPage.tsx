import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Globe, Users, Award, Rocket, Star, Zap, Check, Loader2,
  MapPin, Mail, Linkedin, ArrowLeft, Trophy, Target, Heart
} from "lucide-react";

const BENEFITS = [
  { icon: Trophy, title: "Accès Premium gratuit", desc: "Plan Business offert tant que vous êtes ambassadeur actif" },
  { icon: Users, title: "Réseau exclusif", desc: "Accès au cercle privé des ambassadeurs GrowHubLink dans 40+ pays" },
  { icon: Star, title: "Badges & visibilité", desc: "Badge ambassadeur vérifié + profil mis en avant dans les recherches" },
  { icon: Zap, title: "Commission parrainage", desc: "Gagnez une commission sur chaque utilisateur Pro que vous parrainez" },
  { icon: Globe, title: "Impact local", desc: "Représentez GrowHubLink dans votre pays et développez l'écosystème" },
  { icon: Target, title: "Événements exclusifs", desc: "Invitations aux événements privés et accès anticipé aux nouvelles features" },
];

const STATS = [
  { value: "40+", label: "Pays ciblés" },
  { value: "50", label: "Ambassadeurs recherchés" },
  { value: "10K+", label: "Utilisateurs à atteindre" },
];

export default function AmbassadorsPage() {
  usePageMeta({ title: "Programme Ambassadeurs — GrowHubLink", description: "Rejoignez le programme ambassadeurs GrowHubLink et développez l'écosystème startup dans votre pays." });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", country: "", city: "", motivation: "", linkedin_url: "" });

  const { data: existingApp } = useQuery({
    queryKey: ["ambassador-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("ambassadors").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Connectez-vous pour postuler"); navigate("/auth"); return; }
    setSubmitting(true);
    try {
      const code = `GHL-${form.country.slice(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error } = await supabase.from("ambassadors").insert({
        user_id: user.id,
        full_name: form.full_name,
        email: form.email,
        country: form.country,
        city: form.city,
        motivation: form.motivation || null,
        linkedin_url: form.linkedin_url || null,
        referral_code: code,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Candidature envoyée avec succès ! 🎉");
    } catch (e: any) {
      toast.error(e.message?.includes("unique") ? "Vous avez déjà postulé" : e.message || "Erreur");
    } finally { setSubmitting(false); }
  };

  const alreadyApplied = !!existingApp || submitted;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 h-14">
          <button onClick={() => navigate("/welcome")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Rocket className="w-4 h-4 text-primary-foreground" /></div>
            <span className="font-heading text-lg font-bold text-foreground">Grow<span className="text-primary">Hub</span>Link</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/welcome")}><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>Se connecter</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1.5 gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Programme Ambassadeurs
          </Badge>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight">
            Devenez <span className="text-primary">Ambassadeur</span> GrowHubLink
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Rejoignez notre réseau d'ambassadeurs et aidez à connecter les entrepreneurs de votre pays à l'écosystème startup africain.
          </p>
          <div className="flex justify-center gap-6 pt-4">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-heading font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-center text-foreground mb-8">Avantages ambassadeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="border-border/50 h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <b.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="pb-20 px-4" id="apply">
        <div className="max-w-lg mx-auto">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-heading">
                {alreadyApplied ? "✅ Candidature envoyée" : "Postuler maintenant"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alreadyApplied ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-muted-foreground">Votre candidature est en cours d'examen. Nous vous contacterons bientôt !</p>
                  {existingApp?.referral_code && (
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Votre code ambassadeur</p>
                      <p className="font-mono font-bold text-primary text-lg">{existingApp.referral_code}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Nom complet *</Label>
                      <Input required placeholder="Fatou Diallo" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email *</Label>
                      <Input required type="email" placeholder="fatou@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Pays *</Label>
                      <Input required placeholder="Sénégal" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Ville *</Label>
                      <Input required placeholder="Dakar" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> LinkedIn (optionnel)</Label>
                    <Input placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pourquoi souhaitez-vous être ambassadeur ? *</Label>
                    <Textarea required rows={3} placeholder="Décrivez votre motivation et votre réseau local..." value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi...</> : <><Award className="w-4 h-4 mr-2" /> Soumettre ma candidature</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GrowHubLink — L'écosystème du secteur privé en Afrique
      </footer>
    </div>
  );
}
