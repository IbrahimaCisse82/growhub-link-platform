import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useUserBadges, useAllBadges } from "@/hooks/useGrowHub";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  networking: "from-[#103050] to-[#4096FF]",
  coaching: "from-[#200a30] to-[#A064FF]",
  community: "from-[#1a3a10] to-[#5CBF00]",
  growth: "from-[#301a08] to-[#D06020]",
  default: "from-[#0a3040] to-[#00B8A0]",
};

export default function BadgesPage() {
  const { data: userBadges } = useUserBadges();
  const { data: allBadges } = useAllBadges();

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) ?? []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Gamification
          </div>
          <h1 className="font-heading text-[32px] font-extrabold leading-tight mb-2.5">
            Vos <span className="text-primary">badges & réussites</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Débloquez des badges en atteignant vos objectifs et en contribuant à la communauté.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="🏆" value={String(userBadges?.length ?? 0)} label="Badges débloqués" badge="Total" badgeType="up" />
        <MetricCard icon="🎯" value={String(allBadges?.length ?? 0)} label="Badges disponibles" badge="Catalogue" badgeType="neutral" />
        <MetricCard icon="📈" value={allBadges && allBadges.length > 0 ? `${Math.round(((userBadges?.length ?? 0) / allBadges.length) * 100)}%` : "0%"} label="Progression" badge="Global" badgeType="up" />
        <MetricCard icon="⭐" value={userBadges && userBadges.length > 0 ? "Actif" : "Débutant"} label="Niveau" badge="Statut" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {allBadges?.map(badge => {
          const earned = earnedBadgeIds.has(badge.id);
          const gradientClass = categoryColors[badge.category ?? "default"] ?? categoryColors.default;
          return (
            <GHCard key={badge.id} className={cn("text-center", !earned && "opacity-40 grayscale")}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mx-auto mb-3 text-2xl`}>
                {badge.icon ?? "🏅"}
              </div>
              <div className="font-heading text-sm font-bold mb-1">{badge.name}</div>
              {badge.description && <p className="text-[11px] text-muted-foreground mb-2">{badge.description}</p>}
              {badge.category && <Tag variant={earned ? "green" : "default"}>{badge.category}</Tag>}
              {earned && (
                <div className="text-[10px] text-primary font-bold mt-2">
                  ✓ Débloqué {userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at
                    ? new Date(userBadges.find(ub => ub.badge_id === badge.id)!.earned_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                    : ""
                  }
                </div>
              )}
            </GHCard>
          );
        })}

        {(!allBadges || allBadges.length === 0) && (
          <GHCard className="col-span-4 text-center py-12">
            <Award className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Les badges seront bientôt disponibles !</p>
          </GHCard>
        )}
      </div>
    </motion.div>
  );
}
