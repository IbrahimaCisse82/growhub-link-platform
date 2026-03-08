import { useState } from "react";
import { useCoachReviews, useCreateReview } from "@/hooks/useReviews";
import { GHCard, Tag } from "@/components/ui-custom";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import VerifiedBadge from "./VerifiedBadge";

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn("transition-colors", readonly ? "cursor-default" : "cursor-pointer")}
        >
          <Star className={cn("w-4 h-4", (hover || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
        </button>
      ))}
    </div>
  );
}

export function CoachReviewsList({ coachId }: { coachId: string }) {
  const { data: reviews, isLoading } = useCoachReviews(coachId);

  if (isLoading) return null;
  if (!reviews || reviews.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-3">Aucun avis pour le moment</p>;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <StarRating value={Math.round(avgRating)} readonly />
        <span className="font-heading text-sm font-extrabold">{avgRating.toFixed(1)}</span>
        <span className="text-[10px] text-muted-foreground">({reviews.length} avis)</span>
      </div>
      <div className="space-y-2.5">
        {reviews.slice(0, 5).map((review) => (
          <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[9px] font-extrabold text-primary-foreground">
                {(review.reviewer_profile?.display_name ?? "?").substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold">{review.reviewer_profile?.display_name ?? "Anonyme"}</span>
                  <VerifiedBadge isVerified={review.reviewer_profile?.is_verified} size="sm" />
                </div>
              </div>
              <StarRating value={review.rating} readonly />
            </div>
            {review.review_text && <p className="text-xs text-foreground/70 leading-relaxed">{review.review_text}</p>}
            <div className="text-[9px] text-muted-foreground mt-1">{new Date(review.created_at).toLocaleDateString("fr-FR")}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function WriteReviewForm({ coachId, sessionId, onDone }: { coachId: string; sessionId?: string; onDone?: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Sélectionnez une note");
    try {
      await createReview.mutateAsync({ coachId, sessionId, rating, reviewText: text || undefined });
      toast.success("Avis publié !");
      setRating(0);
      setText("");
      onDone?.();
    } catch {
      toast.error("Erreur lors de la publication");
    }
  };

  return (
    <div className="border border-border rounded-xl p-3.5 bg-secondary/30">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-bold">Votre avis</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Décrivez votre expérience (optionnel)..."
        rows={2}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-2"
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || createReview.isPending}
        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        {createReview.isPending ? "Publication..." : "Publier l'avis"}
      </button>
    </div>
  );
}
