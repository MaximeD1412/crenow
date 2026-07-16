# Alertes / capture d'intention en V1

## Contexte

À la densité de lancement (une catégorie, géo serrée — ADR 0004), l'accueil « créneaux dispo près de toi » sera souvent vide : la pire première impression pour un produit de spontanéité. La note voit le risque (« éviter les sections vides », Bloc 43 §66.8) sans mécanisme, et range les alertes en branche différée — alors même qu'elle les qualifie de « fonctionnalité centrale, plus importante que les favoris » (Bloc 55 §78.5).

## Décision

**Remonter l'alerte / capture d'intention dans le V1** (contre la roadmap de la note, en accord avec son §78.5). L'accueil est une surface **découverte-ou-intention**, pas un feed live-only :
- fenêtre temporelle élargie (ce soir / ce week-end) ;
- rembourrage par les créneaux **récurrents** (cours collectifs) ;
- **état vide → création d'alerte** (« préviens-moi quand X se libère près de moi »).

Alerte **minimale** : `activité/catégorie + zone/distance + période + prix max optionnel` → push au match. Repoussé : alertes multi-conditions, filtres « partenaires favoris seulement », envie floue (NLP).

Pas de section **communautés** sur l'accueil V1 (étage social différé). Les « groupes à compléter » restent (cœur).

## Raison (le triple travail de l'alerte)

1. Sauve l'accueil vide.
2. Fait le pont **pull → push** (intention posée → rappel quand satisfaisable).
3. **Génère le signal de demande pour les partenaires** (« 40 personnes attendent du padel vendredi soir à Lyon 7 ») — carburant cold-start des **deux** côtés.

## Critère de scope appliqué

Ajouter au V1 uniquement ce qui aide à **atteindre** la liquidité (alertes), pas ce qui **optimise** une liquidité déjà là (réputation, vocabulaire dynamique → hors V1).
