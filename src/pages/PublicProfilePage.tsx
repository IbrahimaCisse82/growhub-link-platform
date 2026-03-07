import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSendConnection, useConnections } from "@/hooks/useGrowHub";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Globe, Linkedin, MessageSquare, UserPlus, Building2 } from "lucide-react";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sendConnection = useSendConnection();
  const { data: connections } = useConnections();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      // Increment view count
      if (data && userId !== user?.id) {
        await supabase.from("profiles").update({ profile_views: (data.profile_views ?? 0) + 1 }).eq("user_id", userId!);
      }
      return data;
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["public-role", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId!).maybeSingle();
      return data?.role ?? "startup";
    },
  });

  const isOwnProfile = userId === user?.id;
  const isConnected = connections?.some(c => c.status === "accepted" && (c.requester_id === userId || c.receiver_id === userId));
  const isPending = connections?.some(c => c.status === "pending" && (c.requester_id === userId || c.receiver_id === userId));

  const handleConnect = () => {
    if (!userId) return;
    sendConnection.mutate({ receiverId: userId }, {
      onSuccess: () => toast.success("Demande envoyée !"),
      onError: () => toast.error("Erreur"),
    });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>;
  if (!profile) return <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">Profil introuvable</p></GHCard>;

  const roleLabels: Record<string, string> = { startup: "Startup", mentor: "Mentor", investor: "Investisseur", expert: "Expert" };
  const initials = (profile.display_name ?? "?").substring(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-primary/20" alt="" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-2xl font-extrabold text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-heading text-2xl md:text-[28px] font-extrabold">{profile.display_name}</h1>
              <Tag variant="green">{roleLabels[userRole ?? "startup"] ?? "Membre"}</Tag>
              {profile.company_stage && <Tag>{profile.company_stage}</Tag>}
            </div>
            {profile.company_name && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                <Building2 className="w-3.5 h-3.5" /> {profile.company_name}
                {profile.sector && <span>· {profile.sector}</span>}
              </div>
            )}
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                <MapPin className="w-3.5 h-3.5" /> {[profile.city, profile.country].filter(Boolean).join(", ")}
              </div>
            )}
            {!isOwnProfile && (
              <div className="flex gap-2 flex-wrap">
                {isConnected ? (
                  <button onClick={() => navigate("/messaging")} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> Envoyer un message
                  </button>
                ) : isPending ? (
                  <button disabled className="bg-secondary text-muted-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold">
                    Demande en attente
                  </button>
                ) : (
                  <button onClick={handleConnect} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Se connecter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👁️" value={String(profile.profile_views ?? 0)} label="Vues du profil" badge="Total" badgeType="up" />
        <MetricCard icon="🤝" value={String(profile.network_score ?? 0)} label="Score réseau" badge="/100" badgeType="up" />
        <MetricCard icon="🎯" value={String((profile.skills ?? []).length)} label="Compétences" badge="Actives" badgeType="neutral" />
        <MetricCard icon="🌐" value={profile.sector ?? "—"} label="Secteur" badge="Actif" badgeType="neutral" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bio */}
        {profile.bio && (
          <GHCard title="À propos" className="md:col-span-2">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </GHCard>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <GHCard title="Compétences">
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s: string) => <Tag key={s} variant="green">{s}</Tag>)}
            </div>
          </GHCard>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <GHCard title="Intérêts">
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((s: string) => <Tag key={s} variant="blue">{s}</Tag>)}
            </div>
          </GHCard>
        )}

        {/* Links */}
        {(profile.linkedin_url || profile.website_url) && (
          <GHCard title="Liens">
            <div className="space-y-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Globe className="w-4 h-4" /> Site web
                </a>
              )}
            </div>
          </GHCard>
        )}
      </div>
    </motion.div>
  );
}
