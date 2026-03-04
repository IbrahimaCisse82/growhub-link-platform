import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Rocket, ArrowRight, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Compte créé avec succès !");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Grow<span className="text-primary">Hub</span>Link
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            La plateforme des startups qui grandissent ensemble
          </p>
        </div>

        {/* Demo accounts */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-primary mb-2">🎯 Comptes démo disponibles :</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">sophie.martin@demo.com</span> — Startup (mot de passe: password123)</p>
              <p><span className="font-medium">marc.dubois@demo.com</span> — Mentor</p>
              <p><span className="font-medium">claire.bernard@demo.com</span> — Investisseur</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-primary hover:text-primary h-7 px-2"
              onClick={() => {
                setEmail("sophie.martin@demo.com");
                setPassword("password123");
                setIsLogin(true);
              }}
            >
              Remplir avec Sophie Martin <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Auth form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">
              {isLogin ? "Se connecter" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Accédez à votre espace GrowHubLink"
                : "Rejoignez l'écosystème entrepreneurial"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Sophie Martin"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? "Se connecter" : "Créer mon compte"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? "Pas encore de compte ? Créer un compte"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
