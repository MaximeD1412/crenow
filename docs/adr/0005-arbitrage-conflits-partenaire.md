# Arbitrage des conflits partenaire & régime permanent (V1)

## Contexte

En réservation directe (défaut, ADR 0001), une réservation Crenow peut tomber à tout instant, alors que le partenaire peut aussi vendre le même créneau par ses propres canaux (comptoir, téléphone). Le double-booking est un risque accepté — mais seulement s'il est rendu rare *et* arbitré clairement quand il survient.

## Décision

**Kit d'opération partenaire (V1) :**
- **Notification instantanée** de chaque réservation (push + email).
- **Mirror sortant** dans l'outil du partenaire (Google Calendar — ADR 0002).
- **« Retirer les places restantes » en un tap** (n'affecte que les places non réservées).

**Arbitrage — Crenow protège en priorité l'utilisateur qui a payé :**
- Retirer des places **libres** : instantané, sans conséquence.
- Annuler une place **déjà réservée** : passe par le chemin **annulation partenaire** → remboursement automatique + incident tracké (et, plus tard, impact sur le score de fiabilité partenaire).
- **Aucun écrasement silencieux** d'une réservation payée.

## Alternatives rejetées

- **Laisser le partenaire écraser une résa Crenow confirmée** en cas de conflit physique : détruirait la confiance utilisateur, socle du produit.

## Conséquences

- La photo obligatoire vit sur l'**activité modèle / l'établissement** (héritée par le créneau), pour que le push ad-hoc reste instantané.
- Cet arbitrage est le sommet de la future **politique d'annulation** (branche non encore instruite) : les barèmes de remboursement/pénalité s'y rattacheront.
