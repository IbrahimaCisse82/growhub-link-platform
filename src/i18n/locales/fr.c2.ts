export default {
  c2: {
    globalSearch: {
      typeLabels: { profile: "Membre", post: "Publication", event: "Événement" },
      searchButtonPlaceholder: "Rechercher...",
      inputPlaceholder: "Rechercher membres, publications, événements...",
      filters: { all: "Tout", profile: "Membres", post: "Posts", event: "Événements" },
      advanced: {
        title: "Filtres avancés",
        reset: "Réinitialiser",
        role: "Rôle",
        sector: "Secteur",
        city: "Ville",
        cityPlaceholder: "Ex: Paris, Lyon, Dakar...",
        openButton: "Ouvrir les filtres avancés",
      },
      loading: "Recherche en cours...",
      typeAtLeast: "Tapez au moins 2 caractères ou utilisez les filtres avancés",
      noResults: "Aucun résultat",
      noResultsFor: 'Aucun résultat pour "{{query}}"',
      withFilters: " avec ces filtres",
      footer: {
        hint: "↑↓ Naviguer · ↵ Ouvrir · Esc Fermer",
        resultCount: "{{count}} résultat",
        resultCount_plural: "{{count}} résultats",
      },
    },
    contextualHelp: {
      footer: "Besoin de plus d'aide ? Contactez-nous à",
      configs: {
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
      },
    },
    errorBoundary: {
      title: "Oups, une erreur est survenue",
      reload: "Recharger la page",
    },
    pwaInstall: {
      title: "Installer GrowHub",
      description: "Accédez rapidement à GrowHub depuis votre écran d'accueil.",
      installButton: "Installer l'app",
    },
    pushNotif: {
      enabledSuccess: "Notifications activées !",
      deniedError: "Notifications refusées. Vous pouvez les activer dans les paramètres du navigateur.",
      enabledLabel: "Notifications activées",
      blockedLabel: "Notifications bloquées dans le navigateur",
      enableButton: "Activer les notifications push",
    },
    messageTemplates: {
      defaults: {
        connectionRequest: { title: "Demande de connexion", content: "Bonjour {{nom}}, j'ai vu votre profil et je pense que nous pourrions avoir des synergies intéressantes. Seriez-vous disponible pour un échange ?" },
        warmIntro: { title: "Demande d'intro chaleureuse", content: "Bonjour {{nom}}, j'aimerais beaucoup être mis en relation avec {{cible}}. Pensez-vous pouvoir faciliter cette introduction ?" },
        eventFollowup: { title: "Suivi après événement", content: "Bonjour {{nom}}, ravi de vous avoir rencontré lors de {{événement}}. J'aimerais poursuivre notre conversation. Quand seriez-vous disponible ?" },
        collaboration: { title: "Proposition de collaboration", content: "Bonjour {{nom}}, je travaille sur {{projet}} et je pense que votre expertise en {{domaine}} pourrait être complémentaire. Discutons-en ?" },
      },
      categories: {
        networking: "Networking",
        intro: "Introduction",
        followup: "Suivi",
        collaboration: "Collaboration",
        other: "Autre",
      },
      title: "Templates de messages",
      compactTitle: "Templates",
      create: "Créer",
      cancel: "Annuler",
      save: "Sauver",
      titlePlaceholder: "Nom du template",
      contentPlaceholder: "Contenu (utilisez {{variable}} pour les champs dynamiques)",
      createdSuccess: "Template créé !",
      deletedSuccess: "Template supprimé",
      copiedSuccess: "Copié dans le presse-papier !",
    },
  },
};
