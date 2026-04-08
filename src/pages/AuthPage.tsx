import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Rocket, ArrowRight, Loader2, Users, GraduationCap, TrendingUp, Briefcase, Code } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const DEMO_PROFILES = [
  { role: "startup", label: "Startup", icon: Rocket, color: "bg-green-600/10 text-green-500 border-green-600/20", desc: "Sophie Martin · GreenTech" },
  { role: "mentor", label: "Mentor", icon: GraduationCap, color: "bg-blue-600/10 text-blue-500 border-blue-600/20", desc: "Marc Dubois · Serial Entrepreneur" },
  { role: "investor", label: "Investisseur", icon: TrendingUp, color: "bg-purple-600/10 text-purple-500 border-purple-600/20", desc: "Claire Bernard · VC Partner" },
  { role: "expert", label: "Expert", icon: Code, color: "bg-orange-600/10 text-orange-500 border-orange-600/20", desc: "Thomas Petit · Growth Coach" },
  { role: "freelance", label: "Freelance", icon: Briefcase, color: "bg-pink-600/10 text-pink-500 border-pink-600/20", desc: "Aïda Saïdi · Growth Hacker" },
];

export default function AuthPage() {
  usePageMeta({ title: "Connexion", description: "Connectez-vous ou créez votre compte GrowHub." });
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Vérifiez votre email pour confirmer votre compte !");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Entrez votre email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Lien de réinitialisation envoyé par email !");
    setIsForgot(false);
  };

  const handleDemoLogin = async (role: string) => {
    setDemoLoading(role);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("demo-login", {
        body: { role },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success(`Connecté en tant que ${DEMO_PROFILES.find(p => p.role === role)?.label} !`);
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion démo");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Grow<span className="text-primary">Hub</span>Link
            </span>
          </div>
          <p className="text-muted-foreground text-sm">La plateforme des startups qui grandissent ensemble</p>
        </div>

        {/* Demo Profiles */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <CardTitle className="font-heading text-sm">Comptes Démo</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Testez la plateforme avec un profil pré-configuré
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_PROFILES.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleDemoLogin(demo.role)}
                disabled={!!demoLoading}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 ${demo.color}`}
              >
                {demoLoading === demo.role ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <demo.icon className="w-5 h-5" />
                )}
                <span className="text-[11px] font-bold">{demo.label}</span>
                <span className="text-[9px] opacity-70 leading-tight">{demo.desc}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">
              {isForgot ? "Mot de passe oublié" : isLogin ? "Se connecter" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isForgot ? "Recevez un lien de réinitialisation par email" : isLogin ? "Accédez à votre espace GrowHubLink" : "Rejoignez l'écosystème entrepreneurial"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgot ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Envoyer le lien
                </Button>
                <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center" onClick={() => setIsForgot(false)}>
                  Retour à la connexion
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input id="fullName" type="text" placeholder="Sophie Martin" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      {isLogin && (
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setIsForgot(true)}>
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLogin ? "Se connecter" : "Créer mon compte"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
  usePageMeta({ title: "Connexion", description: "Connectez-vous ou créez votre compte GrowHub." });
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Vérifiez votre email pour confirmer votre compte !");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Entrez votre email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Lien de réinitialisation envoyé par email !");
    setIsForgot(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Grow<span className="text-primary">Hub</span>Link
            </span>
          </div>
          <p className="text-muted-foreground text-sm">La plateforme des startups qui grandissent ensemble</p>
        </div>


        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">
              {isForgot ? "Mot de passe oublié" : isLogin ? "Se connecter" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isForgot ? "Recevez un lien de réinitialisation par email" : isLogin ? "Accédez à votre espace GrowHubLink" : "Rejoignez l'écosystème entrepreneurial"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgot ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Envoyer le lien
                </Button>
                <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center" onClick={() => setIsForgot(false)}>
                  Retour à la connexion
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input id="fullName" type="text" placeholder="Sophie Martin" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      {isLogin && (
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setIsForgot(true)}>
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLogin ? "Se connecter" : "Créer mon compte"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
