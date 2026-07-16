# Lancement concentré (une catégorie, géo serrée)

## Contexte

Crenow est un produit *notification-driven* : sa valeur dépend d'une densité suffisante d'offre et de demande pour que les notifications soient assez fréquentes et pertinentes (habitude utilisateur + remplissage rapide côté partenaire). Le risque existentiel au lancement n'est pas le spam mais le **silence**. Or le pivot multi-catégorie du Bloc 34 (décision défensive face à Anybuddy) **étale** la densité sur 3 catégories × tout Lyon → cold-start qui échoue partout à la fois.

## Décision

**Dissocier l'architecture du go-to-market :**
- **Architecture & marque : multi-catégorie** (modèle générique, pas « l'app padel »). Le Bloc 34 est préservé sur ce plan.
- **Go-to-market de lancement : UNE catégorie, géo lyonnaise serrée**, jusqu'à atteindre la liquidité, puis expansion **catégorie par catégorie**. « Multi-catégorie » = capacité produit + posture de marque, **pas** un plan de lancement.
- **Catégorie de départ (lean) : sport / loisir à créneaux récurrents avec places restantes, sans mener par le padel** (badminton/squash, foot indoor, escalade, cours collectifs). Meilleures mécaniques répétition × périssabilité + différenciateur « place restante » natif + plus forte densité lyonnaise, tout en esquivant le cœur d'Anybuddy.
- **Validation avant de coder du spécifique : probe de prospection de 1-2 semaines** sur les 2 meilleurs candidats-catégories, qui tranche aussi le premier connecteur de synchro (quel outil les partenaires signés utilisent — voir ADR 0002).

## Alternatives rejetées

- **Lancement multi-catégorie opérationnel (Bloc 34 tel quel)** : étale la densité, cold-start échoue partout.
- **Catégories à whitespace mais faible répétition (escape game, ateliers)** : mécaniques de densité trop faibles pour faire tourner le flywheel de notifications.
- **Mener par le padel** : collision frontale avec Anybuddy.

## Conséquences

- Le critère de choix de catégorie est **répétition × périssabilité**, pas le ticket ni l'image.
- Le probe alimente le choix du connecteur (ADR 0002) et la liste partenaires.
- Concentrer sur le sport rapproche d'Anybuddy : mitigé en menant par l'angle « dernière minute / place restante » et les sous-types non-raquette.
