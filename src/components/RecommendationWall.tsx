import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GHCard, Tag } from "@/components/ui-custom";
import { Star, Quote, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Recommendation {
  id: string;
  recommender_id: string;
  recommended_id: string;
  skill: string;
  message: string | null;
  created_at: string;
  recommender_profile?: { display_name: string; avatar_url: string | null; company_name: string | null };
}

export function RecommendationWall({ userId }: { userId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = userId === user?.id;

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("recommended_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch recommender profiles
      const recommenderIds = [...new Set((data ?? []).map(r => r.recommender_id))];
      if (recommenderIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, company_name")
        .in("user_id", recommenderIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));
      return (data ?? []).map(r => ({
        ...r,
        recommender_profile: profileMap.get(r.recommender_id) ?? undefined,
      })) as Recommendation[];
    },
  });

  if (isLoading) return null;
  if (!recommendations || recommendations.length === 0) {
    if (!isOwnProfile) return null;
    return (
      <GHCard title="💬 Recommandations" className="md:col-span-2">
        <p className="text-xs text-muted-foreground text-center py-4">Aucune recommandation encore. Demandez à vos contacts de vous recommander !</p>
      </GHCard>
    );
  }

  return (
    <GHCard title="💬 Recommandations" className="md:col-span-2">
      <div className="space-y-3">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-secondary/30 rounded-xl p-4 relative">
            <Quote className="absolute top-3 right-3 w-5 h-5 text-muted-foreground/20" />
            <div className="flex items-start gap-3 mb-2">
              {rec.recommender_profile?.avatar_url ? (
                <img src={rec.recommender_profile.avatar_url} className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${rec.recommender_id}`)} alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ghgreen-dark to-primary flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${rec.recommender_id}`)}>
                  {(rec.recommender_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs font-bold cursor-pointer hover:text-primary" onClick={() => navigate(`/profile/${rec.recommender_id}`)}>
                  {rec.recommender_profile?.display_name ?? "Membre"}
                </div>
                <div className="text-[10px] text-muted-foreground">{rec.recommender_profile?.company_name ?? ""}</div>
              </div>
              <Tag variant="green">{rec.skill}</Tag>
            </div>
            {rec.message && (
              <p className="text-xs text-foreground/80 italic leading-relaxed">"{rec.message}"</p>
            )}
            <div className="text-[10px] text-muted-foreground mt-2">
              {new Date(rec.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </GHCard>
  );
}

export function WriteRecommendation({ userId, userName }: { userId: string; userName: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  const createRecommendation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("recommendations").insert({
        recommender_id: user!.id,
        recommended_id: userId,
        skill,
        message: message || null,
        is_public: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", userId] });
      toast.success("Recommandation envoyée !");
      setSkill(""); setMessage(""); setShow(false);
    },
    onError: () => toast.error("Erreur"),
  });

  if (!user || user.id === userId) return null;

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="bg-secondary text-foreground rounded-xl px-4 py-2.5 font-heading text-xs font-bold flex items-center gap-2 hover:bg-secondary/80 transition-colors">
        <Star className="w-3.5 h-3.5" /> Recommander
      </button>
    );
  }

  return (
    <GHCard title={`Recommander ${userName}`} className="md:col-span-2 mt-3">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-foreground/70 mb-1 block">Compétence</label>
          <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="Ex: Leadership, Marketing, Développement..."
            className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
        </div>
        <div>
          <label className="text-xs font-bold text-foreground/70 mb-1 block">Message (optionnel)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Décrivez votre expérience avec cette personne..."
            className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:border-primary/40" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => createRecommendation.mutate()} disabled={!skill.trim()}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-primary-hover transition-all">
            <Send className="w-3.5 h-3.5" /> Envoyer
          </button>
          <button onClick={() => setShow(false)} className="bg-secondary text-foreground rounded-xl px-5 py-2.5 font-heading text-xs font-bold">Annuler</button>
        </div>
      </div>
    </GHCard>
  );
}
