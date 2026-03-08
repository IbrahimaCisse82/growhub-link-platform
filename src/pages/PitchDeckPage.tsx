import { useState } from "react";
import { motion } from "framer-motion";
import { GHCard, MetricCard, Tag } from "@/components/ui-custom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Eye, FileText, Trash2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

const templates = [
  { id: "classic", name: "Classic VC", description: "Structure standard pour investisseurs" },
  { id: "storytelling", name: "Storytelling", description: "Narration immersive de votre vision" },
  { id: "data-driven", name: "Data-Driven", description: "Focus sur les métriques et la traction" },
  { id: "minimal", name: "Minimal", description: "Design épuré et percutant" },
];

export default function PitchDeckPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: decks, isLoading } = useQuery({
    queryKey: ["pitch-decks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pitch_decks")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDeck = async (template: string) => {
    if (!user) return;
    setCreating(true);
    const defaultSlides = [
      { title: "Problème", content: "Décrivez le problème que vous résolvez" },
      { title: "Solution", content: "Votre solution unique" },
      { title: "Marché", content: "Taille du marché adressable" },
      { title: "Business Model", content: "Comment vous gagnez de l'argent" },
      { title: "Traction", content: "Vos métriques clés et jalons" },
      { title: "Équipe", content: "Présentez votre équipe fondatrice" },
      { title: "Roadmap", content: "Vos prochaines étapes" },
      { title: "Ask", content: "Ce que vous recherchez" },
    ];
    const { error } = await supabase.from("pitch_decks").insert({
      user_id: user.id,
      title: `Pitch Deck - ${new Date().toLocaleDateString("fr-FR")}`,
      template,
      slides: defaultSlides,
    });
    setCreating(false);
    if (error) toast.error("Erreur lors de la création");
    else {
      toast.success("Pitch Deck créé !");
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
    }
  };

  const deleteDeck = async (id: string) => {
    await supabase.from("pitch_decks").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
    toast.success("Supprimé");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="bg-gradient-to-br from-card to-primary/5 border-2 border-primary/25 rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-[3px] text-[10px] font-bold text-primary uppercase tracking-wider mb-3.5">
            <span className="w-[5px] h-[5px] bg-primary rounded-full animate-pulse-dot" />
            Pitch Deck Builder
          </div>
          <h1 className="font-heading text-2xl md:text-[32px] font-extrabold leading-tight mb-2.5">
            Créez un pitch <span className="text-primary">irrésistible</span>
          </h1>
          <p className="text-foreground/60 text-sm leading-relaxed max-w-[460px]">
            Templates conçus avec des VCs, IA pour optimiser votre storytelling, et export prêt à envoyer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
        <MetricCard icon="📄" value={String(decks?.length ?? 0)} label="Pitch Decks" badge="Créés" badgeType="up" />
        <MetricCard icon="👁️" value={String(decks?.reduce((sum, d) => sum + (d.view_count ?? 0), 0) ?? 0)} label="Vues totales" badge="Total" badgeType="up" />
        <MetricCard icon="📊" value={String(decks?.filter((d) => d.is_public).length ?? 0)} label="Publics" badge="Partagés" badgeType="neutral" />
        <MetricCard icon="✨" value="4" label="Templates" badge="Disponibles" badgeType="neutral" />
      </div>

      {/* Templates */}
      <h3 className="font-heading text-sm font-bold mb-3">Créer un nouveau Pitch Deck</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {templates.map((t) => (
          <GHCard key={t.id} className="cursor-pointer hover:border-primary/40 transition-all" onClick={() => createDeck(t.id)}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="font-heading text-xs font-bold">{t.name}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.description}</p>
            </div>
          </GHCard>
        ))}
      </div>

      {/* Existing decks */}
      <h3 className="font-heading text-sm font-bold mb-3">Mes Pitch Decks</h3>
      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-2" />)
      ) : !decks || decks.length === 0 ? (
        <GHCard className="text-center py-8">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun pitch deck. Choisissez un template ci-dessus pour commencer.</p>
        </GHCard>
      ) : (
        decks.map((deck) => (
          <GHCard key={deck.id} className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold">{deck.title}</span>
                <Tag variant={deck.is_public ? "green" : "default"}>{deck.is_public ? "Public" : "Privé"}</Tag>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Template: {deck.template} · {((deck.slides as any[]) ?? []).length} slides · {deck.view_count ?? 0} vues ·
                Modifié le {new Date(deck.updated_at).toLocaleDateString("fr-FR")}
              </div>
            </div>
            <button onClick={() => deleteDeck(deck.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </GHCard>
        ))
      )}
    </motion.div>
  );
}
