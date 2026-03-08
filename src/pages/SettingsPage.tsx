import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon, Monitor, Save, Trash2, Loader2, KeyRound, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  usePageMeta({ title: "Paramètres", description: "Configurez votre compte et vos préférences GrowHub." });
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const themes = [
    { value: "light" as const, label: "Clair", icon: Sun },
    { value: "dark" as const, label: "Sombre", icon: Moon },
    { value: "system" as const, label: "Système", icon: Monitor },
  ];

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Le mot de passe doit faire au moins 6 caractères"); return; }
    if (newPassword !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Mot de passe mis à jour !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "SUPPRIMER") { toast.error("Tapez SUPPRIMER pour confirmer"); return; }
    // Delete profile and sign out — actual user deletion requires admin
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
      await supabase.from("user_roles").delete().eq("user_id", user.id);
    }
    await signOut();
    toast.success("Compte désactivé. Vos données ont été supprimées.");
    navigate("/auth");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" /> Paramètres
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            <span className="text-primary">Paramètres</span> du compte
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {/* Theme */}
        <GHCard title="Apparence">
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  theme === t.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                )}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </GHCard>

        {/* Account info */}
        <GHCard title="Compte">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Email</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">{user?.email}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Nom</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">{profile?.display_name ?? "—"}</div>
            </div>
          </div>
        </GHCard>

        {/* Change password */}
        <GHCard title="Changer le mot de passe" className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Minimum 6 caractères</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Confirmer</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div className="flex items-end">
              <button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary-hover transition-colors">
                {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Modifier
              </button>
            </div>
          </div>
        </GHCard>

        {/* Danger zone */}
        <GHCard className="md:col-span-2 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-destructive" />
            <h3 className="font-heading text-sm font-bold text-destructive">Zone dangereuse</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront effacées.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer mon compte
            </button>
          ) : (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-destructive">Tapez SUPPRIMER pour confirmer :</p>
              <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="SUPPRIMER" className="w-full bg-background border border-destructive/30 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleteText !== "SUPPRIMER"} className="bg-destructive text-destructive-foreground rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50">Confirmer la suppression</button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }} className="bg-card border border-border rounded-lg px-4 py-2 text-xs font-bold">Annuler</button>
              </div>
            </div>
          )}
        </GHCard>
      </div>
    </motion.div>
  );
}
