# Plan de finalisation — GrowHub Africa (vers 100 %)

## État actuel (estimé ~96 %)
- 11 lots fonctionnels livrés (Auth, Coaching, Deal Rooms, Feed, Messagerie, Marketplace, Événements, Gamification, Coaching avancé, Admin, Analytics).
- i18n FR/EN : 49/52 pages + composants migrés, namespaces c1–c4 branchés.
- 47 tests Vitest au vert, typecheck OK, 4 failles de sécurité corrigées.

## Étape 1 — Sécurité & conformité
- Passer en revue les avertissements restants du scan de sécurité (exposition de colonnes sensibles, politiques trop permissives) et corriger ce qui est réellement exploitable.
- Vérifier le linter de la base de données après corrections.

## Étape 2 — Paiements (rappel : prestataires à linker plus tard)
- Garder l'architecture actuelle (Wave / Orange / MTN / Stripe via webhook sécurisé HMAC).
- Ajouter le secret `MOBILE_MONEY_WEBHOOK_SECRET` côté serveur et documenter le branchement futur des prestataires.
- Pas d'intégration live des prestataires dans cette phase (conformément à votre consigne).

## Étape 3 — Finitions UX & contenu
- Derniers libellés figés restants migrés vers les fichiers de langue.
- Vérifier états vides, skeletons et page 404 sur les parcours principaux.
- Métadonnées SEO de la page d'accueil vérifiées (titre, description, partage social).

## Étape 4 — Qualité & vérification finale
- Typecheck + suite de tests complète au vert.
- Test de bout en bout dans l'aperçu : inscription, tableau de bord par rôle, feed, messagerie, coaching, deal room.
- Revue des performances : lazy loading des routes confirmé, pas de régression.

## Étape 5 — Mise en production
- Publication de l'application une fois les étapes 1 à 4 validées.

## Ce qui restera hors périmètre (par choix)
- Intégration réelle des prestataires de paiement (à linker plus tard, à votre demande).
- Version anglaise V2.0 déjà prête côté fichiers de langue.
