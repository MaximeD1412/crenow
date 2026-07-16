# Orchestration réservation directe : authorize → claim → capture

## Décision

Une réservation directe suit une colonne vertébrale en trois temps, **`manual capture`** de bout en bout (ADR 0010 amendé) :

1. **`POST /v1/bookings`** → crée le `Booking` (pending) + le PaymentIntent Stripe (`manual`, destination charge, `application_fee_amount`), renvoie `payment.clientSecret`.
2. **Authorize (côté client)** — l'app confirme le PaymentIntent (PaymentSheet) → `requires_capture` (autorisé, non débité).
3. **Claim + capture (côté serveur)** — verrou sérialisé (ADR 0011) : réclamer le créneau, puis capturer. Claim perdu ou capture échouée → annuler l'auth (« aucun débit »).

**Double déclencheur idempotent** pour l'étape 3 :
- **`POST /v1/bookings/{id}/confirm`** — appelé par le client juste après l'autorisation ; exécute claim+capture **synchrone** et renvoie le `Booking` résolu. Canal de résultat **primaire** + claim le plus rapide (meilleur dans la course « premier à compléter gagne »).
- **Webhook `payment_intent.amount_capturable_updated`** — exécute **la même** routine idempotente si le client ne rappelle jamais (connexion coupée, app tuée). Filet de sécurité.

Le claim (verrou sérialisé + index partiel unique, ADR 0011) et la capture étant idempotents, lancer la routine depuis les deux déclencheurs est sûr et convergent : le premier gagne, l'autre no-op.

**Canaux de résultat** : (1) réponse synchrone du `confirm` — `Booking` résolu (`CONFIRMED`/`CAPTURED`, ou `FAILED` + auth annulée + `suggestedAlert` de rebond, miroir de l'état vide découverte et du rebond maquette « aucun débit → on te prévient ? ») ; (2) **push Expo** quand c'est le *webhook* qui résout un booking non confirmé en direct ; (3) `GET /v1/bookings/{id}` pour réconciliation.

## Pourquoi

- **Webhook seul** : livraison non instantanée → spinner + claim tardif qui perd la course. Rejeté comme unique voie.
- **Client seul** : autorisation orpheline si le client tombe après l'auth. Rejeté comme unique voie.
- **Hybride** : UX instantanée sur le chemin heureux + résolution garantie sur le cas dégradé, sans double débit grâce à l'idempotence.

## Conséquences

- Toutes les variantes (directe / à-confirmer / groupe) partagent cette colonne `authorize → claim → capture` ; elles ne diffèrent que par le déclencheur du claim (immédiat / validation partenaire / complétion de groupe).
- Le back doit rendre claim et capture strictement idempotents et réconcilier les deux déclencheurs sur le même état de `Booking`.
