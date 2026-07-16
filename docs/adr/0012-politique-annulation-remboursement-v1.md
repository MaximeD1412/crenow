# Politique d'annulation & remboursement (V1)

Instruit la branche laissée ouverte (perimetre-v1, Blocs 7/8/31/32). ADR 0005 en est le sommet (annulation partenaire).

## Décision

**Barème binaire, 4 préréglages** (Bloc 40.6), pas de dégressif en V1 :

| Politique | Règle |
|---|---|
| Flexible | Remboursement **intégral si annulation ≥ 24 h** avant le créneau, sinon **0** |
| **Standard** (défaut) | idem à **12 h** |
| Strict | idem à **3 h** |
| Non-remboursable | aucun remboursement une fois confirmé |

Prérempli **Standard** à l'onboarding, modifiable par le partenaire.

**Avant / après confirmation** (Bloc 29.6) :
- **Avant** (à-confirmer non capturé, ou groupe non complété) → annuler l'auth, aucun mouvement, **pas de politique** → annulation libre.
- **Après** (capturé) → la politique s'applique.

**Remboursement utilisateur intégral = intégral** : on **rembourse aussi la commission** (`refund_application_fee`) → l'utilisateur est fait entier (cohérent avec la confiance, ADR 0003). Crenow ne garde **aucune** commission de service sur une annulation. Les **frais Stripe non remboursables** sont assumés par la plateforme (faible).

**Annulation partenaire** (ADR 0005) : **toujours** remboursement intégral + reversal de commission + incident tracké.

**No-show** (Bloc 52.4) : utilisateur débité, **aucun remboursement**, le partenaire garde le paiement.

## Conséquences

- Une annulation utilisateur porte sur **la réservation entière**. Quitter *individuellement* un groupe confirmé = **annulation partielle → V2**.
- Repoussé V2 (déjà hors V1) : barèmes **dégressifs**, **avoirs/crédits/wallet**, annulation partielle.
- Le seuil de la politique se mesure par rapport au **début du créneau** ; il alimentera plus tard les pénalités/barèmes de fiabilité (branche ADR 0005).
