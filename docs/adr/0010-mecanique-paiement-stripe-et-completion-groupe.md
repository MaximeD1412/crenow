# Mécanique de paiement Stripe & complétion de groupe

Traduit en Stripe les règles de l'ADR 0001 et fige la politique de complétion. Voir aussi ADR 0009 (Crenow = rail de paiement).

## Connect

- **Comptes connectés partenaires : Stripe Express** (Stripe héberge l'onboarding + le KYC/conformité — c'est le « gate publication » des maquettes).
- **Type de charge : destination charges avec `application_fee_amount`** — Crenow encaisse l'utilisateur, prélève sa commission, transfère le reste au compte connecté. Fait de Crenow l'entité de contrôle (cohérent avec source de vérité + machine incident/remboursement). *Direct charges rejetées* (feraient du partenaire le marchand de référence).
- **Commission = `application_fee` paramétrable** (le taux exact est une décision business non instruite). Crenow assume frais Stripe + remboursements/litiges → la commission doit les couvrir.
- **Développement contre Stripe réel en mode test dès la 1re tranche** (pas de simulation) — dérisquer l'intégration la plus dure tôt.

## Préautorisation / capture

| Cas | `capture_method` | Comportement |
|---|---|---|
| Réservation **directe** (défaut) | `manual` | Autorise à la confirmation client ; le back **claim** le créneau (verrou sérialisé, ADR 0011) puis **capture immédiatement** → `RÉSA: Confirmée` / `PAIEMENT: Débité`. Claim échoué → auth annulée (« aucun débit »). |
| **À confirmer** (option partenaire) | `manual` | Préautorise ; capture à la confirmation ; annule l'auth si refus/expiration |
| **Groupe** (public / split privé) | `manual` par participant | 1 préautorisation par place ; capture de tous à la complétion |

> **Amendement (session contrat d'API)** : la directe passe en `capture_method: manual`, **pas** `automatic`. Avec `automatic` + confirmation côté client, la capture a lieu à l'instant de la confirmation, **avant** que le back puisse exécuter le claim sérialisé (ADR 0011) → on capturerait un perdant en cas de concurrence, en violation de « les perdants ne sont jamais capturés ». `manual` uniforme (directe **et** à-confirmer **et** groupe) donne une seule colonne vertébrale `authorize → claim → capture`. « Directe » signifie désormais *pas d'attente de validation partenaire* + capture immédiate **après** le claim — pas une capture automatique Stripe. Ne pas revenir à `automatic`.

- Délais de réponse partenaire (« à confirmer ») par proximité (Bloc 30.2) : < 3 h → ~10 min · 3–24 h → ~30 min · > 24 h → ~2 h.
- Fenêtre de complétion de groupe = `min(début activité, 1re préauth + ~5-7 j)` (expiration des auth cartes ~7 j). Split-groupe limité aux activités **≤ ~5 j**. Fenêtre écoulée sans complétion → toutes les auths annulées → échec gracieux → rebond alerte (ADR 0006).
- **Webhooks Stripe idempotents = source de vérité de l'état paiement** ; le back tient l'état réservation (séparation Bloc 29).

## Complétion : « claim-then-capture »

Ordre impératif à la complétion (protège contre le double-booking et évite de capturer un perdant) :

1. **Réclamer le créneau** dans une **transaction sérialisée** (`SELECT … FOR UPDATE` sur la ligne créneau) : vérifier qu'il est encore non attribué, le marquer attribué à ce groupe. (Voir ADR concurrence à venir.)
2. **Puis capturer** les préautorisations.

Si le claim échoue (un groupe concurrent ou une réservation directe a gagné entre-temps) → **annuler les préautorisations** de ce groupe → « aucun débit », rebond alerte. Les perdants ne sont **jamais** capturés.

## Échec de capture d'un participant (politique « B-lite »)

Une capture peut échouer (carte perdue, blocage émetteur, auth expirée). On **ne fait pas** tout-ou-rien :

- Capturer les bons payeurs, **éjecter le membre en échec** (aucun débit pour lui, rebond alerte).
- **Payeurs OK ≥ seuil de viabilité** (minimum de la variante) → groupe **confirmé à effectif réduit** ; la place libérée reste vide (**pas de retry ni backfill en V1** — hostile au dernier-minute et à la concurrence de créneau).
- **Payeurs OK < seuil** → groupe **non viable** → **rembourser** les captés (machine ADR 0001/0005), annuler le reste → rebond alerte pour tous.
- **Split égal only** (ADR 0001) : personne ne couvre la part manquante (le rééquilibrage inégal est repoussé V2).
- Un échec de paiement **n'est pas un no-show** → aucune sanction en V1 (ADR 0003).

## Repoussé V2

Retry live d'une carte en échec, backfill de la place libérée, split inégal / absorption par l'organisateur.
