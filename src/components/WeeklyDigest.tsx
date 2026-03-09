import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { GHCard, Tag } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Mail, Users, TrendingUp, Calendar, Star, ChevronRight, Sparkles, Eye, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DigestData {
  newConnections: number;
  profileViews: number;
  newMessages: number;
  topMatch: { display_name: string; user_id: string; match_score: number } | null;
  upcomingEvents: { title: string; starts_at: string }[];
  postEngagement: { totalLikes: number; totalComments: number };
  ssiChange: number;
  weekHighlight: string;
}

export default function WeeklyDigest() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: digest, isLoading } = useQuery({
    queryKey: ["weekly-digest", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<DigestData> => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString();

      const [connRes, msgRes, postsRes, eventsRes, topMatchRes] = await Promise.all([
        supabase.from("connections").select("id").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted").gte("created_at", weekAgoISO),
        supabase.from("messages").select("id").eq("receiver_id", user!.id).gte("created_at", weekAgoISO),
        supabase.from("posts").select("likes_count, comments_count").eq("author_id", user!.id).gte("created_at", weekAgoISO),
        supabase.from("event_registrations").select("event_id, events(title, starts_at)").eq("user_id", user!.id),
        supabase.from("connections").select("requester_id, receiver_id, match_score, profiles!connections_receiver_id_fkey(display_name)").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted").order("match_score", { ascending: false, nullsFirst: false }).limit(1),
      ]);

      const newConnections = connRes.data?.length ?? 0;
      const newMessages = msgRes.data?.length ?? 0;
      const posts = postsRes.data ?? [];
      const totalLikes = posts.reduce((s, p) => s + (p.likes_count ?? 0), 0);
      const totalComments = posts.reduce((s, p) => s + (p.comments_count ?? 0), 0);

      const upcoming = (eventsRes.data ?? [])
        .filter((r: any) => r.events && new Date(r.events.starts_at) > new Date())
        .map((r: any) => ({ title: r.events.title, starts_at: r.events.starts_at }))
        .slice(0, 3);

      // Get best match with real match_score
      let topMatch: { display_name: string; user_id: string; match_score: number } | null = null;
      if (topMatchRes.data?.[0]) {
        const conn = topMatchRes.data[0] as any;
        const otherId = conn.requester_id === user!.id ? conn.receiver_id : conn.requester_id;
        topMatch = {
          display_name: conn.profiles?.display_name ?? "Connexion",
          user_id: otherId,
          match_score: conn.match_score ?? 0,
        };
      }

      // Generate highlight
      let weekHighlight = "Semaine calme — c'est le moment de poster et d'élargir votre réseau !";
      if (newConnections >= 5) weekHighlight = `🔥 Semaine explosive ! ${newConnections} nouvelles connexions, votre réseau s'emballe !`;
      else if (newConnections >= 2) weekHighlight = `Bonne semaine ! ${newConnections} nouvelles connexions et des opportunités en vue.`;
      else if (totalLikes > 10) weekHighlight = `Vos posts cartonnent ! ${totalLikes} likes cette semaine.`;

      return {
        newConnections,
        profileViews: profile?.profile_views ?? 0,
        newMessages,
        topMatch,
        upcomingEvents: upcoming,
        postEngagement: { totalLikes, totalComments },
        weekHighlight,
      };
    },
    staleTime: 300_000,
  });

  if (isLoading) return <Skeleton className="h-48 rounded-2xl mb-5" />;
  if (!digest) return null;

  const stats = [
    { icon: Users, label: "Nouvelles connexions", value: digest.newConnections, color: "text-primary" },
    { icon: Eye, label: "Vues profil", value: digest.profileViews, color: "text-ghpurple" },
    { icon: MessageSquare, label: "Messages reçus", value: digest.newMessages, color: "text-ghblue" },
    { icon: TrendingUp, label: "Likes reçus", value: digest.postEngagement.totalLikes, color: "text-ghorange" },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-base font-bold">Digest Hebdo</h2>
        <Tag variant="green">Cette semaine</Tag>
      </div>

      {/* Highlight */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-3">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-heading text-sm font-bold mb-1">Résumé de la semaine</div>
            <p className="text-xs text-foreground/70">{digest.weekHighlight}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
            <div className="font-heading text-lg font-extrabold">{s.value}</div>
            <div className="text-[9px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      {digest.upcomingEvents.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-ghblue" />
            <span className="text-xs font-bold">Événements à venir</span>
          </div>
          {digest.upcomingEvents.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-t border-border first:border-0">
              <span className="text-xs text-foreground/80">{e.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(e.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-2">
        <button onClick={() => navigate("/analytics")}
          className="flex-1 bg-secondary text-foreground rounded-xl py-2 md:py-2.5 font-heading text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 md:gap-1.5 hover:bg-secondary/80 transition-all">
          <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" /> Analytics
        </button>
        <button onClick={() => navigate("/networking")}
          className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 md:py-2.5 font-heading text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 md:gap-1.5 hover:bg-primary-hover transition-all">
          <Users className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" /> <span className="hidden md:inline">Développer mon</span> Réseau
        </button>
      </div>
    </div>
  );
}
