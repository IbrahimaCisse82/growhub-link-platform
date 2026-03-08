import { motion } from "framer-motion";
import { GHCard } from "@/components/ui-custom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function SettingsPage() {
  usePageMeta({ title: "Paramètres", description: "Configurez votre compte et vos préférences GrowHub." });
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();

  const themes = [
    { value: "light" as const, label: "Clair", icon: Sun },
    { value: "dark" as const, label: "Sombre", icon: Moon },
    { value: "system" as const, label: "Système", icon: Monitor },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Paramètres
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            <span className="text-primary">Paramètres</span> du compte
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
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

        <GHCard title="Compte">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Email</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Nom</label>
              <div className="bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground">
                {profile?.display_name ?? "—"}
              </div>
            </div>
          </div>
        </GHCard>
      </div>
    </motion.div>
  );
}
