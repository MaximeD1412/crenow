# Crenow possède le rail de paiement ; les connecteurs sont des adaptateurs de disponibilité

Refine : ADR 0002 (périmètre synchronisation).

## Contexte

Un partenaire peut utiliser un outil de réservation tiers (Google Calendar, puis logiciels métier type Reservio, Bookeo…). L'intuition « c'est leur outil qui détient le vrai créneau, **donc** on passe par leur paiement » est fausse et mortelle : la commission de Crenow **est** l'`application_fee` d'une charge Stripe que Crenow contrôle (ADR 0001, destination charges). Si l'argent transite par l'outil du partenaire, ce mécanisme disparaît et Crenow retombe sur des modèles faibles (affiliation, facturation auto-déclarée) — il n'est plus une marketplace mais un canal de lead-gen.

## Décision

**Découpler deux choses qu'on confond :**
- **Vérité de la disponibilité** (qui possède l'agenda / le créneau) → peut vivre dans l'outil tiers.
- **Rail de paiement** (qui encaisse l'utilisateur) → **toujours Crenow**, sans exception.

Concrètement, même connecté à un outil tiers, le flux est celui de la synchro entrante de l'ADR 0002 (**détection + écriture retour**) :
1. Crenow **lit** les créneaux libres via l'API de l'outil.
2. L'utilisateur **paie dans Crenow** (Stripe ; `application_fee` = commission — inchangé).
3. Crenow **écrit la réservation dans l'outil** (bloque le créneau) pour que le partenaire la voie.

L'outil tiers est un **système de disponibilité / d'agenda**, **jamais un rail de paiement**.

**Critère d'éligibilité d'un connecteur :** l'outil doit exposer une **écriture « créer / bloquer une réservation »** appelable **sans passer par son paiement**. À défaut → le partenaire **reste en publication manuelle** (plancher universel, ADR 0002). On ne casse jamais le modèle de commission pour gagner un partenaire.

## Conséquences

- Le mécanisme de commission (destination charges + `application_fee`) est **identique en manuel et en synchronisé** — un seul chemin de paiement à construire et maintenir.
- Le critère « API d'écriture de réservation » **alimente le sondage partenaires** (ADR 0002 / 0004) : il conditionne quels outils deviennent des connecteurs.
- Le double-booking résiduel (paiement direct dans l'outil au même instant) reste le **risque accepté** couvert par la machine incident/remboursement (ADR 0001 / 0005) ; la synchro le réduit sans l'annuler.
- Un outil qui **impose** son paiement est, par construction, **non connectable** : ses partenaires restent en manuel (ou relèvent, plus tard, d'un produit référral distinct, hors cœur marketplace).
