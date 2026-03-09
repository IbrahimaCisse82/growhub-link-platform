import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon, Monitor, Save, Trash2, Loader2, KeyRound, Shield, Bell } from "lucide-react";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const notifTypes = [
  { key: "connection_request", label: "Demandes de connexion" },
  { key: "connection_accepted", label: "Connexions acceptées" },
  { key: "coaching_booked", label: "Sessions de coaching réservées" },
  { key: "coaching_reminder", label: "Rappels de coaching" },
  { key: "event_reminder", label: "Rappels d'événements" },
  { key: "post_reaction", label: "Réactions sur mes posts" },
  { key: "post_comment", label: "Commentaires sur mes posts" },
  { key: "badge_earned", label: "Badges débloqués" },
  { key: "system_notifications", label: "Notifications système" },
];

export default function SettingsPage() {
  usePageMeta({ title: "Paramètres", description: "Configurez votre compte et vos préférences GrowHub." });
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});
  const [savingNotifs, setSavingNotifs] = useState(false);

  const { data: savedPrefs } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (savedPrefs) {
      const prefs: Record<string, boolean> = {};
      notifTypes.forEach(t => { prefs[t.key] = savedPrefs[t.key] ?? true; });
      setNotifPrefs(prefs);
    } else {
      const prefs: Record<string, boolean> = {};
      notifTypes.forEach(t => { prefs[t.key] = true; });
      setNotifPrefs(prefs);
    }
  }, [savedPrefs]);

  const handleSaveNotifPrefs = async () => {
    if (!user) return;
    setSavingNotifs(true);
    const payload = { user_id: user.id, ...notifPrefs };
    if (savedPrefs) {
      await (supabase as any).from("notification_preferences").update(notifPrefs).eq("user_id", user.id);
    } else {
      await (supabase as any).from("notification_preferences").insert(payload);
    }
    setSavingNotifs(false);
    queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    toast.success("Préférences sauvegardées !");
  };

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
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "SUPPRIMER") { toast.error("Tapez SUPPRIMER pour confirmer"); return; }
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
      // Note: user_roles cleanup is handled by cascade or backoffice
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

        {/* Push Notifications */}
        <GHCard title="Notifications push">
          <p className="text-xs text-muted-foreground mb-3">
            Recevez des alertes en temps réel même quand l'app est en arrière-plan.
          </p>
          <PushNotificationToggle />
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

        {/* Notification preferences */}
        <GHCard title="Préférences de notifications" className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Choisissez les notifications que vous souhaitez recevoir</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notifTypes.map(t => (
              <label key={t.key} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs[t.key] ?? true}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, [t.key]: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-xs font-medium">{t.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveNotifPrefs}
              disabled={savingNotifs}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover transition-colors"
            >
              {savingNotifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Sauvegarder
            </button>
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
