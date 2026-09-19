import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GHCard, Tag } from "@/components/ui-custom";
import { Trophy, Share2, X, Sparkles, Users, MessageSquare, Calendar, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface DetectedMilestone {
  type: string;
  value: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  shareText: string;
}



export default function MilestoneDetector() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const MILESTONE_THRESHOLDS = [
  {
    type: "connections", thresholds: [5, 10, 25, 50, 100, 250, 500],
    label: (v) => t("c4.milestone.connections.label", { count: v }),
    desc: (v) => t("c4.milestone.connections.desc", { count: v }),
    icon: <Users className="w-5 h-5 text-primary" />,
    shareLabel: (v) => t("c4.milestone.connections.share", { count: v }),
  },
  {
    type: "posts", thresholds: [1, 5, 10, 25, 50, 100],
    label: (v) => v === 1 ? t("c4.milestone.posts.labelFirst") : t("c4.milestone.posts.label", { count: v }),
    desc: (v) => v === 1 ? t("c4.milestone.posts.descFirst") : t("c4.milestone.posts.desc", { count: v }),
    icon: <MessageSquare className="w-5 h-5 text-ghblue" />,
    shareLabel: (v) => v === 1 ? t("c4.milestone.posts.shareFirst") : t("c4.milestone.posts.share", { count: v }),
  },
  {
    type: "events", thresholds: [1, 5, 10, 25],
    label: (v) => v === 1 ? t("c4.milestone.events.labelFirst") : t("c4.milestone.events.label", { count: v }),
    desc: (v) => t("c4.milestone.events.desc", { count: v, plural: v > 1 ? "s" : "" }),
    icon: <Calendar className="w-5 h-5 text-ghorange" />,
    shareLabel: (v) => t("c4.milestone.events.share", { count: v, plural: v > 1 ? "s" : "" }),
  },
  {
    type: "badges", thresholds: [1, 3, 5, 10],
    label: (v) => v === 1 ? t("c4.milestone.badges.labelFirst") : t("c4.milestone.badges.label", { count: v }),
    desc: (v) => t("c4.milestone.badges.desc", { count: v, plural: v > 1 ? "s" : "" }),
    icon: <Award className="w-5 h-5 text-ghgold" />,
    shareLabel: (v) => t("c4.milestone.badges.share", { count: v, plural: v > 1 ? "s" : "" }),
  },
  {
    type: "coaching", thresholds: [1, 5, 10, 25],
    label: (v) => v === 1 ? t("c4.milestone.coaching.labelFirst") : t("c4.milestone.coaching.label", { count: v }),
    desc: (v) => t("c4.milestone.coaching.desc", { count: v, plural: v > 1 ? "s" : "" }),
    icon: <TrendingUp className="w-5 h-5 text-ghpurple" />,
    shareLabel: (v) => t("c4.milestone.coaching.share", { count: v, plural: v > 1 ? "s" : "" }),
  },
];
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: newMilestones } = useQuery({
    queryKey: ["milestone-detection", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get current counts
      const [connRes, postRes, eventRes, badgeRes, coachRes, existingRes] = await Promise.all([
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", user!.id),
        supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("coaching_sessions").select("id", { count: "exact", head: true }).eq("learner_id", user!.id).eq("status", "completed"),
        supabase.from("milestones").select("milestone_type, milestone_value").eq("user_id", user!.id),
      ]);

      const counts: Record<string, number> = {
        connections: connRes.count ?? 0,
        posts: postRes.count ?? 0,
        events: eventRes.count ?? 0,
        badges: badgeRes.count ?? 0,
        coaching: coachRes.count ?? 0,
      };

      const existing = new Set((existingRes.data ?? []).map(m => `${m.milestone_type}_${m.milestone_value}`));
      const detected: DetectedMilestone[] = [];

      for (const config of MILESTONE_THRESHOLDS) {
        const current = counts[config.type] ?? 0;
        for (const threshold of config.thresholds) {
          if (current >= threshold && !existing.has(`${config.type}_${threshold}`)) {
            detected.push({
              type: config.type,
              value: threshold,
              title: config.label(threshold),
              description: config.desc(threshold),
              icon: config.icon,
              shareText: config.shareLabel(threshold),
            });
          }
        }
      }

      // Auto-save detected milestones
      for (const m of detected) {
        await supabase.from("milestones").insert({
          user_id: user!.id,
          milestone_type: m.type,
          milestone_value: m.value,
          title: m.title,
          description: m.description,
        });
      }

      return detected;
    },
    staleTime: 300_000,
  });

  const shareAsMilestone = useMutation({
    mutationFn: async (milestone: DetectedMilestone) => {
      await supabase.from("posts").insert({
        author_id: user!.id,
        content: milestone.shareText,
        post_type: "milestone",
      });
      await supabase.from("milestones").update({ is_shared: true })
        .eq("user_id", user!.id)
        .eq("milestone_type", milestone.type)
        .eq("milestone_value", milestone.value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-infinite"] });
      toast.success(t("c4.milestone.shareSuccess"));
    },
  });

  const handleShare = (m: DetectedMilestone) => {
    shareAsMilestone.mutate(m);
    setDismissed(d => [...d, `${m.type}_${m.value}`]);
  };

  const handleShareExternal = (m: DetectedMilestone) => {
    const url = `https://growhublink.com`;
    const text = encodeURIComponent(m.shareText);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${text}`, "_blank");
  };

  const visible = (newMilestones ?? []).filter(m => !dismissed.includes(`${m.type}_${m.value}`));

  if (!visible.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-ghgold" />
        <h2 className="font-heading text-base font-bold">{t("c4.milestone.newMilestones")}</h2>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {visible.map((m) => (
            <motion.div
              key={`${m.type}_${m.value}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-gradient-to-r from-card to-ghgold/5 border-2 border-ghgold/30 rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-ghgold/10 rounded-full blur-2xl" />
              <button onClick={() => setDismissed(d => [...d, `${m.type}_${m.value}`])}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-ghgold/20 flex items-center justify-center flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-bold mb-1">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{m.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleShare(m)}
                      className="bg-primary text-primary-foreground rounded-xl px-4 py-2 font-heading text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-all">
                      <Sparkles className="w-3 h-3" /> {t("c4.milestone.shareInFeed")}
                    </button>
                    <button onClick={() => handleShareExternal(m)}
                      className="bg-secondary text-foreground rounded-xl px-4 py-2 font-heading text-[11px] font-bold flex items-center gap-1.5 hover:bg-secondary/80 transition-all">
                      <Share2 className="w-3 h-3" /> {t("c4.milestone.linkedin")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
