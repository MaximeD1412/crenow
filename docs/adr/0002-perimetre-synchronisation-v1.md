# Périmètre de la synchronisation (V1)

## Contexte

La synchro avec les outils des partenaires est un argument de valeur fort (automatisation → justifie la commission ; « le partenaire n'ouvre presque jamais l'app »). La note (Bloc 25 §48.1) la déclare « fonctionnalité principale » avec « compatibilité avec le plus d'outils possible » — mais chaque connecteur bidirectionnel est un projet distinct, et beaucoup de logiciels métier n'ont pas d'API d'écriture. Il fallait un périmètre V1 réaliste qui prouve le modèle sans engloutir le lancement.

## Décision

- **Publication manuelle = plancher universel**, disponible dès le jour 1 pour tous les partenaires.
- **V1 sync = Google Calendar uniquement**, seul connecteur bidirectionnel agnostique réellement construisible. Objectif : **valider le modèle de synchro** de bout en bout, pas couvrir tous les partenaires.
- **Deux directions distinctes :**
  - **Sortante** (mirror des réservations confirmées vers l'agenda partenaire) : Crenow **reste source de vérité**. Cheap et sûr.
  - **Entrante** (détection des créneaux libérés) : **mode validation uniquement** (suggestion → confirmation partenaire → Crenow reprend la vérité). Jamais d'auto-publication en V1.
- **Connecteurs de logiciels métier : repoussés**, pilotés par un **sondage des premiers partenaires** (quels outils utilisent-ils réellement). **Aucun connecteur métier ne conditionne la date de lancement.**
- **Pas de framework de connecteurs générique (§48.9) en V1.** À la place : un **port fin piloté par le domaine** (interface Java `détecterCréneauxLibérés / écrireRéservation / annulerRéservation`), Google Calendar comme premier adapter, et le créneau porte une **origine externe** (`source`, `external_ref`). Le framework générique est extrait au **connecteur #2** (règle de deux).

## Alternatives rejetées

- **« Le plus d'outils possible » en V1** (note 48.1) : irréaliste, chaque connecteur bidirectionnel est un projet.
- **Synchro entrante en lecture seule sans écriture retour** : réintroduit le double-booking (l'agenda partenaire devient maître sans que Crenow puisse bloquer).
- **Framework générique de connecteurs dès la V1** : abstraction prématurée, moulée sur un seul connecteur.

## Conséquences

- **Source de vérité conditionnelle à la connexion** : Crenow pour les créneaux manuels et publiés ; l'outil externe pour la détection entrante avant publication. La machine à incidents de l'ADR 0001 (remboursement auto) **reste nécessaire** : même bidirectionnelle, la synchro laisse une fenêtre de course et *réduit* le taux d'incident sans l'annuler.
- Les partenaires à fort volume sur logiciel métier restent en **publication manuelle** jusqu'à l'arrivée de leur connecteur.
