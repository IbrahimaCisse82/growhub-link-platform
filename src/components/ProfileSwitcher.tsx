import { cn } from "@/lib/utils";

interface ProfileSwitcherProps {
  activeProfile: string;
  onSwitch: (profile: string) => void;
}

const profiles = [
  { id: "startup", label: "Startup", emoji: "⚡" },
  { id: "mentor", label: "Mentor/Expert", emoji: "✍️" },
  { id: "investor", label: "Investisseur", emoji: "💰" },
  { id: "freelance", label: "Freelance", emoji: "💼" },
  { id: "etudiant", label: "Étudiant", emoji: "🎓" },
  { id: "aspirationnel", label: "Aspirationnel", emoji: "⭐" },
];

export default function ProfileSwitcher({ activeProfile, onSwitch }: ProfileSwitcherProps) {
  return (
    <div className="flex gap-1.5 items-center px-7 h-11 bg-secondary/60 border-b border-border overflow-x-auto scrollbar-thin">
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() => onSwitch(p.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold whitespace-nowrap transition-all border border-transparent",
            activeProfile === p.id
              ? "text-primary bg-primary/10 border-primary/35"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <span>{p.emoji}</span>
          {p.label}
        </button>
      ))}
    </div>
  );
}
