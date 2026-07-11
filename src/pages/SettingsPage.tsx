import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { GHCard } from "@/components/ui-custom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Moon, Monitor, Save, Trash2, Loader2, KeyRound, Shield, Bell, Eye, Download } from "lucide-react";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const NOTIF_KEYS = [
  "connection_request",
  "connection_accepted",
  "coaching_booked",
  "coaching_reminder",
  "event_reminder",
  "post_reaction",
  "post_comment",
  "badge_earned",
  "system_notifications",
];

export default function SettingsPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("settings.seoTitle"), description: t("settings.seoDesc") });
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

  // Privacy
  const [isPublic, setIsPublic] = useState<boolean>(profile?.is_public ?? true);
  const [emailVisible, setEmailVisible] = useState<boolean>((profile as any)?.email_visible ?? false);
  const [showInMatching, setShowInMatching] = useState<boolean>((profile as any)?.show_in_matching ?? true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});
  const [savingNotifs, setSavingNotifs] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public ?? true);
      setEmailVisible((profile as any).email_visible ?? false);
      setShowInMatching((profile as any).show_in_matching ?? true);
    }
  }, [profile]);

  const handleSavePrivacy = async () => {
    if (!user) return;
    setSavingPrivacy(true);
    const { error } = await supabase.from("profiles").update({
      is_public: isPublic,
      email_visible: emailVisible,
      show_in_matching: showInMatching,
    } as any).eq("user_id", user.id);
    setSavingPrivacy(false);
    if (error) toast.error(error.message);
    else toast.success(t("settings.privacySaved"));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-user-data`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error(t("settings.exportImpossible"));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `growhub-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("settings.exportSuccess"));
    } catch (e: any) {
      toast.error(e.message || t("settings.exportError"));
    } finally {
      setExporting(false);
    }
  };

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
    const prefs: Record<string, boolean> = {};
    NOTIF_KEYS.forEach(k => { prefs[k] = savedPrefs?.[k] ?? true; });
    setNotifPrefs(prefs);
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
    toast.success(t("settings.saved"));
  };

  const themes = [
    { value: "light" as const, labelKey: "settings.themes.light", icon: Sun },
    { value: "dark" as const, labelKey: "settings.themes.dark", icon: Moon },
    { value: "system" as const, labelKey: "settings.themes.system", icon: Monitor },
  ];

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error(t("settings.passwordTooShort")); return; }
    if (newPassword !== confirmPassword) { toast.error(t("settings.passwordMismatch")); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("settings.passwordUpdated"));
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const confirmWord = t("settings.confirmWord");
  const handleDeleteAccount = async () => {
    if (deleteText !== confirmWord) { toast.error(t("settings.deleteError")); return; }
    if (user) {
      await supabase.from("profiles").delete().eq("user_id", user.id);
    }
    await signOut();
    toast.success(t("settings.deleted"));
    navigate("/auth");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" aria-hidden="true" /> {t("settings.badge")}
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            <span className="text-primary">{t("settings.title")}</span> {t("settings.titleAccent")}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        <GHCard title={t("settings.appearance")}>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((th) => (
              <button
                key={th.value}
                onClick={() => setTheme(th.value)}
                aria-label={t(th.labelKey)}
                aria-pressed={theme === th.value}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all min-h-11",
                  theme === th.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                )}
              >
                <th.icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium">{t(th.labelKey)}</span>
              </button>
            ))}
          </div>
        </GHCard>

        <GHCard title={t("settings.pushTitle")}>
          <p className="text-xs text-muted-foreground mb-3">{t("settings.pushDesc")}</p>
          <PushNotificationToggle />
        </GHCard>

        <GHCard title={t("settings.account")}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("settings.email")}</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">{user?.email}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("settings.name")}</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">{profile?.display_name ?? "—"}</div>
            </div>
          </div>
        </GHCard>

        <GHCard title={t("settings.notifPrefs")} className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">{t("settings.notifPrefsHint")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NOTIF_KEYS.map(key => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs[key] ?? true}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-xs font-medium">{t(`settings.types.${key}`)}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveNotifPrefs}
              disabled={savingNotifs}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-primary-hover transition-colors min-h-11"
            >
              {savingNotifs ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
              {t("settings.save")}
            </button>
          </div>
        </GHCard>

        <GHCard title={t("settings.changePassword")} className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">{t("settings.passwordHint")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("settings.newPassword")}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">{t("settings.confirmPassword")}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••" className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
            </div>
            <div className="flex items-end">
              <button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary-hover transition-colors min-h-11">
                {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />}
                {t("settings.modify")}
              </button>
            </div>
          </div>
        </GHCard>

        <GHCard title={t("settings.privacy")} className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">{t("settings.privacyHint")}</span>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border">
              <div>
                <p className="text-xs font-bold">{t("settings.publicProfile")}</p>
                <p className="text-[11px] text-muted-foreground">{t("settings.publicProfileDesc")}</p>
              </div>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 accent-primary" />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border">
              <div>
                <p className="text-xs font-bold">{t("settings.emailVisible")}</p>
                <p className="text-[11px] text-muted-foreground">{t("settings.emailVisibleDesc")}</p>
              </div>
              <input type="checkbox" checked={emailVisible} onChange={(e) => setEmailVisible(e.target.checked)} className="w-4 h-4 accent-primary" />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border">
              <div>
                <p className="text-xs font-bold">{t("settings.showInMatching")}</p>
                <p className="text-[11px] text-muted-foreground">{t("settings.showInMatchingDesc")}</p>
              </div>
              <input type="checkbox" checked={showInMatching} onChange={(e) => setShowInMatching(e.target.checked)} className="w-4 h-4 accent-primary" />
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSavePrivacy} disabled={savingPrivacy} className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 disabled:opacity-50 min-h-11">
              {savingPrivacy ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Save className="w-3.5 h-3.5" aria-hidden="true" />} {t("settings.save")}
            </button>
          </div>
        </GHCard>

        <GHCard title={t("settings.dataTitle")} className="md:col-span-2">
          <p className="text-xs text-muted-foreground mb-3">{t("settings.dataDesc")}</p>
          <button onClick={handleExport} disabled={exporting} className="bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-secondary/80 disabled:opacity-50 min-h-11">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Download className="w-3.5 h-3.5" aria-hidden="true" />} {t("settings.exportData")}
          </button>
        </GHCard>

        <GHCard className="md:col-span-2 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-destructive" aria-hidden="true" />
            <h3 className="font-heading text-sm font-bold text-destructive">{t("settings.dangerZone")}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t("settings.dangerDesc")}</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-destructive/20 transition-colors min-h-11">
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> {t("settings.deleteAccount")}
            </button>
          ) : (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-destructive">{t("settings.typeToConfirm")}</p>
              <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder={confirmWord} className="w-full bg-background border border-destructive/30 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleteText !== confirmWord} className="bg-destructive text-destructive-foreground rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50">{t("settings.confirmDelete")}</button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }} className="bg-card border border-border rounded-lg px-4 py-2 text-xs font-bold">{t("settings.cancel")}</button>
              </div>
            </div>
          )}
        </GHCard>
      </div>
    </motion.div>
  );
}
