import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GHCard, Tag } from "@/components/ui-custom";
import { Sparkles, TrendingUp, Users, Calendar, Award, MessageSquare, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SmartNotif {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  action: string;
  link: string;
  priority: number;
  type: "engagement" | "milestone" | "opportunity" | "reminder";
}

export default function SmartNotifications() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: notifs } = useQuery({
    queryKey: ["smart-notifications", user?.id],
    enabled: !!user && !!profile,
    queryFn: async () => {
      const items: SmartNotif[] = [];

      // 1. Check profile completeness
      const fields = [profile?.bio, profile?.company_name, profile?.sector, profile?.city, profile?.skills?.length, profile?.interests?.length, (profile as any)?.looking_for?.length, (profile as any)?.offering?.length];
      const filled = fields.filter(Boolean).length;
      const completeness = Math.round((filled / fields.length) * 100);
      if (completeness < 80) {
        items.push({
          id: "profile-incomplete", icon: <Target className="w-4 h-4 text-orange-500" />,
          title: "Complétez votre profil", message: `Votre profil est à ${completeness}%. Un profil complet reçoit 3x plus de vues.`,
          action: "Compléter", link: "/profile", priority: 90, type: "engagement",
        });
      }

      // 2. Check intents
      if (!(profile as any)?.looking_for?.length && !(profile as any)?.offering?.length) {
        items.push({
          id: "no-intents", icon: <Sparkles className="w-4 h-4 text-primary" />,
          title: "Déclarez vos besoins", message: "Dites ce que vous cherchez et offrez pour être matché avec les bonnes personnes.",
          action: "Configurer", link: "/networking", priority: 85, type: "engagement",
        });
      }

      // 3. Check recent connections
      const { data: recentConnections } = await supabase
        .from("connections")
        .select("id, created_at")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      const newThisWeek = (recentConnections ?? []).filter(c => {
        const d = new Date(c.created_at);
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
        return d > weekAgo;
      }).length;

      if (newThisWeek > 0) {
        items.push({
          id: "new-connections", icon: <Users className="w-4 h-4 text-primary" />,
          title: `${newThisWeek} nouvelle${newThisWeek > 1 ? "s" : ""} connexion${newThisWeek > 1 ? "s" : ""} cette semaine`,
          message: "Votre réseau grandit ! Envoyez un message pour renforcer ces liens.",
          action: "Voir", link: "/networking", priority: 70, type: "milestone",
        });
      }

      // 4. Check upcoming events
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("event_id, events(title, starts_at)")
        .eq("user_id", user!.id);

      const upcoming = (registrations ?? []).filter((r: any) => r.events && new Date(r.events.starts_at) > new Date());
      if (upcoming.length > 0) {
        const next = upcoming[0] as any;
        const date = new Date(next.events.starts_at);
        const isToday = date.toDateString() === new Date().toDateString();
        const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
        if (isToday || isTomorrow) {
          items.push({
            id: "event-soon", icon: <Calendar className="w-4 h-4 text-blue-500" />,
            title: `Événement ${isToday ? "aujourd'hui" : "demain"} !`,
            message: `${next.events.title} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
            action: "Voir", link: "/events", priority: 95, type: "reminder",
          });
        }
      }

      // 5. Check streak
      const streak = (profile as any)?.login_streak;
      if (streak && streak >= 7) {
        items.push({
          id: "streak", icon: <Award className="w-4 h-4 text-yellow-500" />,
          title: `🔥 Série de ${streak} jours !`,
          message: "Continuez comme ça ! Vous êtes parmi les membres les plus actifs.",
          action: "Badges", link: "/badges", priority: 60, type: "milestone",
        });
      }

      // 6. Pending connection requests
      const { data: pending } = await supabase
        .from("connections")
        .select("id")
        .eq("receiver_id", user!.id)
        .eq("status", "pending");

      if ((pending ?? []).length > 0) {
        items.push({
          id: "pending-requests", icon: <Users className="w-4 h-4 text-orange-500" />,
          title: `${pending!.length} demande${pending!.length > 1 ? "s" : ""} en attente`,
          message: "Des personnes souhaitent rejoindre votre réseau.",
          action: "Répondre", link: "/networking", priority: 80, type: "opportunity",
        });
      }

      // 7. Unread messages
      const { data: unread } = await supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", user!.id)
        .eq("is_read", false);

      if ((unread ?? []).length > 0) {
        items.push({
          id: "unread-messages", icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
          title: `${unread!.length} message${unread!.length > 1 ? "s" : ""} non lu${unread!.length > 1 ? "s" : ""}`,
          message: "Consultez vos messages pour ne manquer aucune opportunité.",
          action: "Lire", link: "/messaging", priority: 75, type: "engagement",
        });
      }

      // 8. No posts yet?
      const { count: postCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", user!.id);

      if (!postCount || postCount === 0) {
        items.push({
          id: "first-post", icon: <TrendingUp className="w-4 h-4 text-primary" />,
          title: "Publiez votre premier post !",
          message: "Les membres actifs dans le feed reçoivent 5x plus de demandes de connexion.",
          action: "Publier", link: "/feed", priority: 65, type: "engagement",
        });
      }

      return items.sort((a, b) => b.priority - a.priority).slice(0, 5);
    },
    staleTime: 120_000,
  });

  if (!notifs || notifs.length === 0) return null;

  const typeColors = {
    engagement: "border-l-primary",
    milestone: "border-l-yellow-500",
    opportunity: "border-l-orange-500",
    reminder: "border-l-blue-500",
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-base font-bold">Pour vous aujourd'hui</h2>
      </div>
      <div className="space-y-2">
        {notifs.map(notif => (
          <div key={notif.id}
            className={`bg-card border border-border ${typeColors[notif.type]} border-l-[3px] rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/50 transition-colors`}
            onClick={() => navigate(notif.link)}>
            <div className="flex-shrink-0">{notif.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-heading text-xs font-bold">{notif.title}</div>
              <div className="text-[10px] text-muted-foreground truncate">{notif.message}</div>
            </div>
            <button className="text-[10px] font-bold text-primary bg-primary/10 rounded-lg px-2.5 py-1 hover:bg-primary/20 transition-colors flex-shrink-0">
              {notif.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
