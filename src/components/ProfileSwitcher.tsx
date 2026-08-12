import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProfileSwitcherProps {
  activeProfile: string;
  onSwitch: (profile: string) => void;
}

const profileIds = ["startup", "mentor", "investor", "expert", "freelance", "incubateur", "etudiant", "professionnel", "corporate", "aspirationnel"];
const emojis: Record<string, string> = {
  startup: "⚡", mentor: "✍️", investor: "💰", expert: "🧠", freelance: "💼",
  incubateur: "🏢", etudiant: "🎓", professionnel: "👔", corporate: "🏛️", aspirationnel: "⭐",
};

export default function ProfileSwitcher({ activeProfile, onSwitch }: ProfileSwitcherProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1.5 items-center px-7 h-11 bg-secondary/60 border-b border-border overflow-x-auto scrollbar-thin">
      {profileIds.map((id) => (
        <button
          key={id}
          onClick={() => onSwitch(id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold whitespace-nowrap transition-all border border-transparent",
            activeProfile === id
              ? "text-primary bg-primary/10 border-primary/35"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <span>{emojis[id]}</span>
          {t(`prof.profileSwitcher.profiles.${id}`)}
        </button>
      ))}
    </div>
  );
}
