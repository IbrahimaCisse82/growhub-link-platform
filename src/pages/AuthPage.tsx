import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Rocket, Loader2, Users, GraduationCap, TrendingUp, Briefcase, Code, Building2, BookOpen, Sparkles, UserCheck, Building } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "react-i18next";

const DEMO_PROFILES = [
  { role: "startup", label: "Startup", icon: Rocket, color: "bg-green-600/10 text-green-500 border-green-600/20", desc: "Sophie Martin · GreenTech" },
  { role: "mentor", label: "Mentor", icon: GraduationCap, color: "bg-blue-600/10 text-blue-500 border-blue-600/20", desc: "Marc Dubois · Serial Entrepreneur" },
  { role: "investor", label: "Investisseur", icon: TrendingUp, color: "bg-purple-600/10 text-purple-500 border-purple-600/20", desc: "Claire Bernard · VC Partner" },
  { role: "expert", label: "Expert", icon: Code, color: "bg-orange-600/10 text-orange-500 border-orange-600/20", desc: "Thomas Petit · Growth Coach" },
  { role: "freelance", label: "Freelance", icon: Briefcase, color: "bg-pink-600/10 text-pink-500 border-pink-600/20", desc: "Aïda Saïdi · Growth Hacker" },
  { role: "incubateur", label: "Incubateur", icon: Building2, color: "bg-teal-600/10 text-teal-500 border-teal-600/20", desc: "Fatou Diallo · Hub Dakar" },
  { role: "etudiant", label: "Étudiant", icon: BookOpen, color: "bg-cyan-600/10 text-cyan-500 border-cyan-600/20", desc: "Youssef Ben Ali · HEC Casablanca" },
  { role: "professionnel", label: "Pro", icon: UserCheck, color: "bg-slate-600/10 text-slate-500 border-slate-600/20", desc: "Amara Koné · DG Abidjan" },
  { role: "corporate", label: "Corporate", icon: Building, color: "bg-indigo-600/10 text-indigo-500 border-indigo-600/20", desc: "Nadia Okafor · Innovation Lead" },
  { role: "aspirationnel", label: "Aspirationnel", icon: Sparkles, color: "bg-amber-600/10 text-amber-500 border-amber-600/20", desc: "Kwame Asante · Futur entrepreneur" },
];

export default function AuthPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("auth.seoTitle"), description: t("auth.seoDesc") });
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("ref");
    const stored = localStorage.getItem("ghl_ref");
    const code = fromUrl || stored;
    if (fromUrl) localStorage.setItem("ghl_ref", fromUrl);
    if (code) { setRefCode(code); setIsLogin(false); }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.loginSuccess"));
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: fullName, ...(refCode ? { referral_code: refCode } : {}) },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (refCode) localStorage.removeItem("ghl_ref");
        toast.success(t("auth.signupSuccess"));
      }
    } catch (error: any) {
      toast.error(error.message || t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error(t("auth.enterEmail")); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("auth.resetSent"));
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
      toast.success(t("auth.demoConnected", { role: DEMO_PROFILES.find(p => p.role === role)?.label ?? role }));
    } catch (error: any) {
      toast.error(error.message || t("auth.demoError"));
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center" aria-hidden="true">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Grow<span className="text-primary">Hub</span>Link
            </span>
          </div>
          <p className="text-muted-foreground text-sm">{t("auth.tagline")}</p>
        </div>

        {/* Demo Profiles */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" aria-hidden="true" />
              <CardTitle className="font-heading text-sm">{t("auth.demoAccounts")}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t("auth.demoHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {DEMO_PROFILES.map((demo) => (
              <button
                key={demo.role}
                type="button"
                aria-label={demo.label}
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
            <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">
              {isForgot ? t("auth.forgotTitle") : isLogin ? t("auth.loginTitle") : t("auth.signupTitle")}
            </CardTitle>
            <CardDescription>
              {isForgot ? t("auth.forgotDesc") : isLogin ? t("auth.loginDesc") : t("auth.signupDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgot ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {t("auth.sendLink")}
                </Button>
                <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors w-full text-center" onClick={() => setIsForgot(false)}>
                  {t("auth.backToLogin")}
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                      <Input id="fullName" type="text" placeholder={t("auth.fullNamePlaceholder")} value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      {isLogin && (
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setIsForgot(true)}>
                          {t("auth.forgot")}
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    {isLogin ? t("auth.login") : t("auth.signup")}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? t("auth.switchToSignup") : t("auth.switchToLogin")}
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
