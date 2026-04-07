import { motion } from "framer-motion";
import { useMatching } from "@/hooks/useMatching";
import { useAuth } from "@/hooks/useAuth";
import { useSendConnection } from "@/hooks/useConnections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserPlus, Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function OnboardingMatches({ onComplete }: Props) {
  const { data: matches, isLoading } = useMatching(6);
  const sendConnection = useSendConnection();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const handleConnect = (userId: string) => {
    sendConnection.mutate(userId, {
      onSuccess: () => {
        setSentIds(prev => new Set(prev).add(userId));
        toast.success("Demande envoyée !");
      },
      onError: () => toast.error("Erreur lors de l'envoi"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-2">
            <Sparkles className="w-4 h-4" /> Matching intelligent
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Vos premiers matchs
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Basé sur votre profil, voici les membres qui correspondent le mieux à vos besoins. Connectez-vous dès maintenant !
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.map((match, idx) => (
              <motion.div key={match.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={match.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {match.display_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-foreground text-sm truncate">{match.display_name}</h3>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                            {match.match_score}%
                          </Badge>
                        </div>
                        {match.company_name && (
                          <p className="text-xs text-muted-foreground truncate">{match.company_name}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {match.match_reasons.slice(0, 2).map(r => (
                            <span key={r} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-full">{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={sentIds.has(match.user_id) ? "secondary" : "default"}
                      className="w-full mt-3"
                      disabled={sentIds.has(match.user_id)}
                      onClick={() => handleConnect(match.user_id)}
                    >
                      {sentIds.has(match.user_id) ? (
                        <><Check className="w-3.5 h-3.5 mr-1" /> Demande envoyée</>
                      ) : (
                        <><UserPlus className="w-3.5 h-3.5 mr-1" /> Se connecter</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun match trouvé pour le moment. Plus de membres rejoignent chaque jour !</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button size="lg" onClick={onComplete} className="px-8">
            {sentIds.size > 0 ? "Accéder au Dashboard" : "Passer et commencer"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {sentIds.size > 0 
            ? `${sentIds.size} connexion${sentIds.size > 1 ? "s" : ""} envoyée${sentIds.size > 1 ? "s" : ""} — retrouvez d'autres matchs sur votre Dashboard`
            : "Vous pourrez trouver plus de matchs depuis votre Dashboard"
          }
        </p>
      </div>
    </div>
  );
}
