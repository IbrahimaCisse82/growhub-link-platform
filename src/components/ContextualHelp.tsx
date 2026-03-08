import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpItem {
  question: string;
  answer: string;
}

interface ContextualHelpProps {
  title: string;
  items: HelpItem[];
}

export default function ContextualHelp({ title, items }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[100] w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-all hover:shadow-[var(--shadow-glow)]"
        aria-label="Aide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Help panel */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 right-4 lg:bottom-20 lg:right-6 z-[401] w-[340px] max-h-[70vh] bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-sm font-extrabold">{title}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[55vh] p-3">
                {items.map((item, i) => (
                  <div key={i} className="mb-1">
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-left hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
                          expandedIndex === i && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-3 pb-3 text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground text-center">
                  Besoin de plus d'aide ? Contactez-nous à <span className="text-primary font-medium">support@growhublink.com</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Pre-built help configs per page
export const helpConfigs: Record<string, { title: string; items: { question: string; answer: string }[] }> = {
  dashboard: {
    title: "Aide — Dashboard",
    items: [
      { question: "Que montre le Dashboard ?", answer: "Le Dashboard est votre centre de commande. Il affiche vos objectifs, statistiques clés, checklist d'activation et recommandations personnalisées basées sur votre profil." },
      { question: "Comment fonctionne la checklist ?", answer: "La checklist d'activation vous guide pour compléter votre profil et tirer le meilleur parti de la plateforme. Chaque action complétée augmente votre score réseau." },
      { question: "Qu'est-ce que le score réseau ?", answer: "Votre score réseau reflète votre activité et votre engagement. Plus vous participez (posts, connexions, événements), plus votre score augmente." },
      { question: "Comment voir mes streaks ?", answer: "Les streaks comptent vos jours de connexion consécutifs. Connectez-vous chaque jour pour maintenir votre série et monter dans le classement." },
    ],
  },
  networking: {
    title: "Aide — Networking",
    items: [
      { question: "Comment fonctionne le matching ?", answer: "Notre algorithme analyse vos compétences, intérêts et secteur pour vous recommander les profils les plus pertinents avec un score de compatibilité." },
      { question: "Comment envoyer une demande ?", answer: "Cliquez sur 'Connecter' sur le profil souhaité. Vous pouvez ajouter un message personnalisé pour augmenter vos chances d'acceptation." },
      { question: "Puis-je filtrer les profils ?", answer: "Oui ! Utilisez la recherche globale (⌘K) et les filtres par rôle, secteur, ville et compétences pour trouver exactement qui vous cherchez." },
      { question: "Qu'est-ce qu'un profil vérifié ?", answer: "Le badge ✓ indique que l'identité du membre a été vérifiée. Cela renforce la confiance dans les échanges." },
    ],
  },
  coaching: {
    title: "Aide — Coaching",
    items: [
      { question: "Comment réserver une session ?", answer: "Parcourez les coachs disponibles, cliquez sur 'Réserver', choisissez une date et un sujet. Le coach recevra une notification instantanée." },
      { question: "Comment annuler une session ?", answer: "Dans la section 'Sessions à venir', cliquez sur l'icône ✕ à côté de la session. L'annulation est gratuite jusqu'à 24h avant." },
      { question: "Comment évaluer un coach ?", answer: "Après une session terminée, cliquez sur 'Évaluer' dans l'historique pour donner une note et un commentaire." },
      { question: "Les sessions sont-elles payantes ?", answer: "Le tarif horaire est affiché sur chaque profil coach. Le paiement sécurisé via PayPal sera bientôt disponible." },
    ],
  },
  feed: {
    title: "Aide — Fil d'actualité",
    items: [
      { question: "Que puis-je publier ?", answer: "Partagez des textes, milestones, questions, ressources ou annonces. Vous pouvez aussi ajouter des tags et médias." },
      { question: "Comment fonctionnent les réactions ?", answer: "Cliquez sur l'emoji pour réagir à une publication. L'auteur reçoit une notification en temps réel." },
      { question: "Qu'est-ce qu'un sondage ?", answer: "Créez un sondage avec votre publication pour recueillir l'avis de la communauté. Les résultats sont visibles en temps réel." },
    ],
  },
  messaging: {
    title: "Aide — Messagerie",
    items: [
      { question: "Comment démarrer une conversation ?", answer: "Allez sur le profil d'un membre connecté et cliquez sur 'Message', ou utilisez la page Messagerie pour retrouver vos conversations." },
      { question: "Les messages sont-ils en temps réel ?", answer: "Oui ! Les messages arrivent instantanément grâce à notre système temps réel. Vous recevez aussi un toast de notification." },
      { question: "Puis-je envoyer des fichiers ?", answer: "Pour l'instant, la messagerie prend en charge le texte. L'envoi de fichiers et images sera bientôt disponible." },
    ],
  },
  events: {
    title: "Aide — Événements",
    items: [
      { question: "Comment m'inscrire ?", answer: "Cliquez sur 'S'inscrire' sur l'événement souhaité. Vous recevrez une notification de rappel avant le début." },
      { question: "Comment créer un événement ?", answer: "Cliquez sur 'Créer un événement' et remplissez les détails (titre, date, type, lien visio). Vos événements sont visibles par toute la communauté." },
      { question: "Quels types d'événements ?", answer: "Webinars, workshops, meetups, conférences et demo days. Chaque type a son format adapté." },
    ],
  },
};
