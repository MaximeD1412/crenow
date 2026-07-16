# Modèle de réservation et de disponibilité (V1)

## Contexte

Au lancement, Crenow n'est **pas** intégré aux outils de réservation des partenaires. Or le positionnement repose sur la spontanéité de dernière minute, qui exige une confirmation **instantanée** (réservation directe), laquelle exige une disponibilité fiable. Il fallait un modèle qui préserve la magie du dernier-minute sans intégration, tout en évitant le double-booking.

## Décision

- **Crenow détient la vérité** sur les créneaux créés manuellement par le partenaire. Le partenaire est responsable de la réalité de la disponibilité qu'il publie ; Crenow garantit qu'il ne vend jamais au-delà de la capacité.
- **Réservation directe par défaut** (capture immédiate quand le créneau est verrouillé avec succès). **« À confirmer »** (préautorisation + validation partenaire) reste disponible en **option paramétrable par le partenaire**, pas par défaut.
- **Créneau exclusif par défaut** : un seul groupe de réservation remporte le créneau. Le mode **partagé** (places vendues à des parties indépendantes jusqu'à capacité) est **paramétrable et repoussé post-V1**.
- **Groupes concurrents, sans blocage (optimiste)** : plusieurs groupes distincts peuvent viser le même créneau exclusif ; **le premier à compléter (toutes les places payées) gagne** ; les préautorisations des perdants sont annulées. *(Amendement même session : l'affichage du nombre de groupes concurrents est repoussé hors V1 — cas rare à la densité de lancement et risque d'« enchère » anxiogène ; la règle back-end est conservée, l'échec est géré gracieusement.)*
- Le différenciateur « rejoindre des inconnus » est porté par le **groupe public** (un seul groupe sur créneau exclusif, places restantes ouvertes) — indépendant du mode partagé.
- **Paiement** : paiement entier (solo / groupe privé) et **préautorisation par place à gating collectif, égal** (groupe public ou split entre amis) dès la V1. **Split inégal et annulation partielle repoussés en V2.**
- **Fenêtre de complétion d'un groupe** = `min(début de l'activité, première préautorisation + ~5-7 j)` (plafond Stripe). En V1, le split-groupe est limité aux activités à **≤ ~5 jours**.

## Alternatives rejetées

- **Sync agenda complet comme fondation V1** : trop lourd, et chaque outil diffère → repoussé (voir ADR à venir sur la synchro).
- **« À confirmer » par défaut** : plus sûr mais tue la spontanéité de dernière minute, cœur du produit.
- **Blocage pessimiste du créneau pendant la formation du groupe** : protège l'UX du groupe mais gèle des créneaux périssables ; incompatible avec la logique de remplissage.

## Conséquences

- La revérification de disponibilité à la capture (groupe) est triviale : Crenow détient la vérité sur ses créneaux publiés.
- Le double-booking résiduel (créneau réservé hors Crenow entre-temps) est un risque accepté, couvert par : responsabilité partenaire, remboursement automatique rapide, suivi du taux d'incident, CGU de dédouanement.
- Le modèle de données du créneau doit être **prêt pour la synchro** (origine externe, mapping) même si aucun connecteur n'est construit en V1.
