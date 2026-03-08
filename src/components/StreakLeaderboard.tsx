import { useStreaks, useLeaderboard } from "@/hooks/useStreaks";
import { GHCard, Tag } from "@/components/ui-custom";
import { Flame, Trophy, Crown, Medal, Award, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function StreakBadge() {
  const { data } = useStreaks();
  const streak = data?.login_streak ?? 0;
  if (streak <= 0) return null;

  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/25 rounded-full px-3 py-1">
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="font-heading text-xs font-extrabold text-orange-600 dark:text-orange-400">{streak} jour{streak > 1 ? "s" : ""}</span>
    </motion.div>
  );
}

const podiumIcons = [Crown, Medal, Award];
const podiumColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];

export function LeaderboardWidget() {
  const { data: leaders, isLoading } = useLeaderboard(5);
  const navigate = useNavigate();

  if (isLoading || !leaders || leaders.length === 0) return null;

  return (
    <GHCard title="🏆 Leaderboard" headerRight={<Tag variant="orange">Top membres</Tag>}>
      <div className="space-y-1">
        {leaders.map((user, i) => {
          const Icon = podiumIcons[i] || Trophy;
          return (
            <button
              key={user.user_id}
              onClick={() => navigate(`/profile/${user.user_id}`)}
              className="w-full flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-secondary transition-all text-left"
            >
              <div className={cn("w-6 text-center font-heading text-sm font-extrabold", i < 3 ? podiumColors[i] : "text-muted-foreground")}>
                {i < 3 ? <Icon className="w-4 h-4 mx-auto" /> : `${i + 1}`}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-extrabold text-primary-foreground flex-shrink-0 overflow-hidden relative">
                {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  user.display_name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold truncate">{user.display_name}</span>
                  {user.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{user.company_name ?? ""}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-heading text-xs font-extrabold text-primary">{user.network_score ?? 0}</div>
                <div className="text-[9px] text-muted-foreground">pts</div>
              </div>
              {(user.login_streak ?? 0) > 2 && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[9px] font-bold text-orange-500">{user.login_streak}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </GHCard>
  );
}
