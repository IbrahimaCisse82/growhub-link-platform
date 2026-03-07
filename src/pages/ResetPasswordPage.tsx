import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Rocket, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User has clicked the recovery link
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    toast.success("Mot de passe mis à jour !");
    setTimeout(() => navigate("/"), 2000);
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              {done ? "Mot de passe mis à jour" : "Nouveau mot de passe"}
            </CardTitle>
            <CardDescription>
              {done ? "Vous allez être redirigé..." : "Choisissez un nouveau mot de passe sécurisé"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Redirection en cours...</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Mettre à jour
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
