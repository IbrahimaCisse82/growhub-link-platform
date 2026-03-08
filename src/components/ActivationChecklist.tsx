import { useAuth } from "@/hooks/useAuth";
import { useConnections, usePosts } from "@/hooks/useGrowHub";
import { useCircles } from "@/hooks/useCircles";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  done: boolean;
  path: string;
}

export default function ActivationChecklist() {
  const { profile } = useAuth();
  const { data: connections } = useConnections();
  const { data: posts } = usePosts();
  const { data: circles } = useCircles();
  const navigate = useNavigate();

  const profileComplete = !!(profile?.bio && profile?.company_name && profile?.sector && profile?.avatar_url);
  const acceptedConnections = connections?.filter(c => c.status === "accepted") ?? [];
  const hasThreeConnections = acceptedConnections.length >= 3;
  const hasPost = (posts?.length ?? 0) > 0;
  const hasCircle = (circles?.filter(c => c.is_member) ?? []).length > 0;

  const items: ChecklistItem[] = [
    { key: "profile", label: "Compléter votre profil", description: "Photo, bio, secteur et entreprise", done: profileComplete, path: "/profile" },
    { key: "connections", label: "Connecter 3 personnes", description: `${Math.min(acceptedConnections.length, 3)}/3 connexions`, done: hasThreeConnections, path: "/networking" },
    { key: "circle", label: "Rejoindre un cercle", description: "Trouvez votre communauté", done: hasCircle, path: "/circles" },
    { key: "post", label: "Publier un premier post", description: "Partagez avec la communauté", done: hasPost, path: "/feed" },
  ];

  const completedCount = items.filter(i => i.done).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (percentage === 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-primary/20 rounded-2xl p-5 mb-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading text-sm font-extrabold">🚀 Activez votre compte</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{completedCount}/{items.length} étapes complétées</p>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-secondary" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-heading text-xs font-extrabold text-primary">{percentage}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.done && navigate(item.path)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all",
              item.done ? "opacity-60" : "hover:bg-secondary cursor-pointer"
            )}
          >
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className={cn("text-xs font-bold", item.done && "line-through")}>{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.description}</div>
            </div>
            {!item.done && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
