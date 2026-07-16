# Concurrence & attribution des créneaux

Met en œuvre « premier à compléter gagne » de l'ADR 0001, sans sur-booking. Support de la complétion décrite en ADR 0010.

## Décision

**Formation optimiste, attribution sérialisée.** Pendant que des groupes se forment, le créneau reste vendable (ADR 0001 : on ne gèle pas un créneau périssable). Toute la correction se joue à **l'instant de la complétion**.

**Un créneau exclusif = une seule attribution.** Il porte `claimed_by` (null tant que libre), gagné par **un** booking (réservation directe) **ou** un groupe. Les **places** et le **seuil de viabilité** vivent **dans le groupe**, pas sur le créneau — plusieurs groupes concurrents visent le même créneau sans le décrémenter tant qu'aucun n'a gagné.

**Section critique = transaction sérialisée + `claim-then-capture` :**

```
BEGIN
  SELECT … FOR UPDATE sur la ligne créneau     -- sérialise les prétendants
  si claimed_by NOT NULL → ABORT               -- échec gracieux, annuler les préauths
  claimed_by := ce groupe / booking
COMMIT
puis capturer les préautorisations             -- politique B-lite (ADR 0010)
```

Le premier à poser `claimed_by` gagne ; les autres abortent → « aucun débit » + rebond alerte (ADR 0006). Une **réservation directe** passe par le **même verrou** → elle complète instantanément et peut coiffer un groupe en formation.

**Ceinture + bretelles :** un **index partiel unique** `UNIQUE(créneau_id) WHERE claimed` rend le sur-booking **structurellement impossible**, même en cas de bug logique.

**« Retirer les places restantes »** (ADR 0005) : réduire les places ouvertes du groupe/créneau aux non-réservées, sous le même verrou — instantané, sans conséquence.

## Conséquences

- **Capacité = vérité Crenow** (ADR 0001). Pour un créneau **synchronisé**, l'écriture retour dans l'outil externe se fait **après** claim+capture (best-effort ; double-book résiduel = incident, ADR 0009).
- **Perdants jamais capturés** : l'ordre claim→capture garantit que seul le gagnant est débité ; les autres voient leurs préautorisations annulées (« aucun débit », propre).
- **Mode partagé repoussé** : vendre des places à des parties indépendantes jusqu'à capacité (compteur `places_restantes` décrémenté sur le créneau) est un *autre* modèle de concurrence → post-V1. En V1, on ne code que l'attribution unique de l'exclusif.
