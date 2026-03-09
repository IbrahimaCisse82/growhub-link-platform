import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Rocket, ArrowRight, Loader2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AuthPage() {
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

        {/* Demo accounts */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-primary mb-2">🎯 Comptes démo disponibles :</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">sophie.martin@demo.com</span> — Startup</p>
              <p><span className="font-medium">marc.lefevre@demo.com</span> — Mentor</p>
              <p><span className="font-medium">laure.bernard@demo.com</span> — Investisseur</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Mot de passe : <span className="font-mono font-medium">Demo2024!</span></p>
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                { label: "Sophie (Startup)", email: "sophie.martin@demo.com" },
                { label: "Marc (Mentor)", email: "marc.lefevre@demo.com" },
                { label: "Laure (Investor)", email: "laure.bernard@demo.com" },
              ].map((demo) => (
                <Button key={demo.email} type="button" variant="ghost" size="sm"
                  className="text-[11px] text-primary hover:text-primary h-7 px-2"
                  onClick={() => { setEmail(demo.email); setPassword("Demo2024!"); setIsLogin(true); setIsForgot(false); }}>
                  {demo.label} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
