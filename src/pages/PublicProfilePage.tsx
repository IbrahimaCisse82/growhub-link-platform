import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSendConnection, useConnections } from "@/hooks/useGrowHub";
import { useEndorsements, useToggleEndorsement } from "@/hooks/useEndorsements";
import { motion } from "framer-motion";
import { GHCard, Tag, MetricCard } from "@/components/ui-custom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Globe, Linkedin, MessageSquare, UserPlus, Building2, ThumbsUp, Share2, Sparkles } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import VerifiedBadge from "@/components/VerifiedBadge";
import { CoachReviewsList } from "@/components/CoachReviews";
import { useCollaborations } from "@/hooks/useReviews";
import { RecommendationWall, WriteRecommendation } from "@/components/RecommendationWall";
import SSIGauge from "@/components/SSIGauge";

export default function PublicProfilePage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("publicProfile.seoTitle"), description: t("publicProfile.seoDesc") });
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sendConnection = useSendConnection();
  const { data: connections } = useConnections();
  const { data: endorsements } = useEndorsements(userId);
  const toggleEndorsement = useToggleEndorsement();
  const { data: collaborations } = useCollaborations(userId ?? null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      if (data && userId !== user?.id) {
        await supabase.rpc("increment_profile_views", { profile_user_id: userId! });
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

  // Detect a common connection for Warm Intro
  const { data: warmIntroBroker } = useQuery({
    queryKey: ["warm-intro-broker", userId, user?.id],
    enabled: !!userId && !!user && userId !== user.id,
    queryFn: async () => {
      // Connections of current user (accepted)
      const { data: mine } = await supabase.from("connections")
        .select("requester_id,receiver_id")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .eq("status", "accepted");
      const myFriends = new Set<string>();
      mine?.forEach((c: any) => myFriends.add(c.requester_id === user!.id ? c.receiver_id : c.requester_id));
      if (myFriends.size === 0) return null;
      // Connections of target user
      const { data: theirs } = await supabase.from("connections")
        .select("requester_id,receiver_id")
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("status", "accepted");
      for (const c of theirs ?? []) {
        const other = c.requester_id === userId ? c.receiver_id : c.requester_id;
        if (myFriends.has(other)) {
          const { data: p } = await supabase.from("profiles").select("user_id,display_name").eq("user_id", other).maybeSingle();
          return p;
        }
      }
      return null;
    },
  });

  const isOwnProfile = userId === user?.id;
  const isConnected = connections?.some(c => c.status === "accepted" && (c.requester_id === userId || c.receiver_id === userId));
  const isPending = connections?.some(c => c.status === "pending" && (c.requester_id === userId || c.receiver_id === userId));

  const handleConnect = () => {
    if (!userId) return;
    sendConnection.mutate({ receiverId: userId }, {
      onSuccess: () => toast.success(t("publicProfile.connectSent")),
      onError: () => toast.error(t("common.error")),
    });
  };

  const handleEndorse = (skill: string) => {
    if (!userId || isOwnProfile) return;
    toggleEndorsement.mutate({ endorsedId: userId, skill }, {
      onSuccess: () => toast.success(t("publicProfile.endorseUpdated")),
    });
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: profile?.display_name ?? t("publicProfile.profileFallback"), url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t("publicProfile.shareCopied"));
    }
  };

  const hasEndorsed = (skill: string) => {
    if (!user || !endorsements) return false;
    return endorsements[skill]?.endorserIds.includes(user.id) ?? false;
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>;
  if (!profile) return <GHCard className="text-center py-8"><p className="text-sm text-muted-foreground">{t("publicProfile.notFound")}</p></GHCard>;

  const roleLabels: Record<string, string> = {
    startup: t("roles.startup"), mentor: t("roles.mentor"), investor: t("roles.investor"), expert: t("roles.expert"),
    freelance: t("roles.freelance"), incubateur: t("roles.incubateur"), etudiant: t("roles.etudiant"),
    aspirationnel: t("roles.aspirationnel"), professionnel: t("roles.professionnel"), corporate: t("roles.corporate"),
  };
  const initials = (profile.display_name ?? "?").substring(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={() => navigate(-1)} aria-label={t("publicProfile.back")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 min-h-11">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("publicProfile.back")}
      </button>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-primary/20" alt={profile.display_name ?? ""} loading="lazy" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center font-heading text-2xl font-extrabold text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-heading text-2xl md:text-[28px] font-extrabold">{profile.display_name}</h1>
              <VerifiedBadge isVerified={profile.is_verified} size="lg" />
              <Tag variant="green">{roleLabels[userRole ?? "startup"] ?? t("publicProfile.memberFallback")}</Tag>
              {profile.company_stage && <Tag>{profile.company_stage}</Tag>}
            </div>
            {profile.headline && (
              <p className="text-sm text-primary font-medium mb-1">{profile.headline}</p>
            )}
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
            <div className="flex gap-2 flex-wrap">
              {!isOwnProfile && (
                <>
                  {isConnected ? (
                    <button onClick={() => navigate(`/messaging?partner=${userId}`)} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors min-h-11">
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> {t("publicProfile.sendMessage")}
                    </button>
                  ) : isPending ? (
                    <button disabled className="bg-secondary text-muted-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold min-h-11">
                      {t("publicProfile.pending")}
                    </button>
                  ) : (
                    <button onClick={handleConnect} className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors min-h-11">
                      <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> {t("publicProfile.connect")}
                    </button>
                  )}
                  <WriteRecommendation userId={userId!} userName={profile?.display_name ?? t("publicProfile.thisMember")} />
                  {!isConnected && warmIntroBroker && (
                    <button
                      onClick={() => {
                        navigate(`/messaging?partner=${warmIntroBroker.user_id}`);
                        toast.info(t("publicProfile.warmIntroToast", { name: warmIntroBroker.display_name }));
                      }}
                      className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-amber-500/20 transition-colors min-h-11"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> {t("publicProfile.warmIntro", { name: warmIntroBroker.display_name })}
                    </button>
                  )}
                </>
              )}
              <button onClick={handleShareProfile} className="bg-secondary text-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors min-h-11">
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> {t("publicProfile.share")}
              </button>
            </div>
          </div>
          {/* SSI gauge */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <SSIGauge score={profile.network_score ?? 0} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="👁️" value={String(profile.profile_views ?? 0)} label={t("publicProfile.profileViews")} badge={t("publicProfile.total")} badgeType="up" />
        <MetricCard icon="🤝" value={String(profile.network_score ?? 0)} label={t("publicProfile.networkScore")} badge="/100" badgeType="up" />
        <MetricCard icon="🎯" value={String((profile.skills ?? []).length)} label={t("publicProfile.skills")} badge={t("publicProfile.active")} badgeType="neutral" />
        <MetricCard icon="🌐" value={profile.sector ?? "—"} label={t("publicProfile.sector")} badge={t("publicProfile.activeBadge")} badgeType="neutral" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profile.bio && (
          <GHCard title={t("publicProfile.about")} className="md:col-span-2">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </GHCard>
        )}

        {/* Skills with endorsements */}
        {profile.skills && profile.skills.length > 0 && (
          <GHCard title={t("publicProfile.skillsRecos")}>
            <div className="space-y-2">
              {profile.skills.map((s: string) => {
                const count = endorsements?.[s]?.count ?? 0;
                const endorsed = hasEndorsed(s);
                return (
                  <div key={s} className="flex items-center justify-between gap-2 bg-secondary/30 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">{s}</span>
                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <span className="text-[10px] text-muted-foreground">{t("publicProfile.recoCount", { count })}</span>
                      )}
                      {!isOwnProfile && user && (
                        <button
                          onClick={() => handleEndorse(s)}
                          className={cn(
                            "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all",
                            endorsed
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <ThumbsUp className={cn("w-3 h-3", endorsed && "fill-primary")} aria-hidden="true" />
                          {endorsed ? t("publicProfile.endorsed") : t("publicProfile.endorse")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GHCard>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <GHCard title={t("publicProfile.interests")}>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((s: string) => <Tag key={s} variant="blue">{s}</Tag>)}
            </div>
          </GHCard>
        )}

        {/* Looking for & Offering */}
        {(profile.looking_for?.length > 0 || profile.offering?.length > 0) && (
          <GHCard title={t("publicProfile.lookingOffering")}>
            <div className="space-y-3">
              {profile.looking_for?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">{t("publicProfile.lookingHeader")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.looking_for.map((s: string) => <Tag key={s} variant="blue">{s}</Tag>)}
                  </div>
                </div>
              )}
              {profile.offering?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">{t("publicProfile.offeringHeader")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.offering.map((s: string) => <Tag key={s} variant="teal">{s}</Tag>)}
                  </div>
                </div>
              )}
            </div>
          </GHCard>
        )}

        {(profile.linkedin_url || profile.website_url) && (
          <GHCard title={t("publicProfile.links")}>
            <div className="space-y-2">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Linkedin className="w-4 h-4" aria-hidden="true" /> {t("publicProfile.linkedin", { defaultValue: "LinkedIn" })}
                </a>
              )}
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Globe className="w-4 h-4" aria-hidden="true" /> {t("publicProfile.website")}
                </a>
              )}
            </div>
          </GHCard>
        )}
        {/* Collaboration History */}
        {collaborations && collaborations.length > 0 && (
          <GHCard title={t("publicProfile.collabHistory")}>
            <div className="space-y-2">
              {collaborations.slice(0, 5).map(collab => {
                const partner = collab.user_id === userId ? collab.partner_profile : collab.user_profile;
                return (
                  <div key={collab.id} className="flex items-center gap-2.5 py-2 border-b border-border/40 last:border-b-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[9px] font-extrabold text-primary-foreground">
                      {(partner?.display_name ?? "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{partner?.display_name ?? "Membre"}</div>
                      <div className="text-[10px] text-muted-foreground">{collab.description ?? collab.collaboration_type}</div>
                    </div>
                    <Tag variant="teal">{collab.collaboration_type}</Tag>
                  </div>
                );
              })}
            </div>
          </GHCard>
        )}
        {/* Recommendations Wall */}
        <RecommendationWall userId={userId!} />
      </div>
    </motion.div>
  );
}
