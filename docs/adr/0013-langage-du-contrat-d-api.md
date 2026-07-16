# Langage et nommage du contrat d'API

## Décision

Le **contrat d'API (OpenAPI)** — paths, schémas, énumérations, propriétés — est rédigé **en anglais**, alors que le langage du domaine (produit, `CONTEXT.md`, discussions) reste **français**. La correspondance FR→EN est **figée une fois** dans `CONTEXT.md` (section « Correspondance FR → EN ») et fait autorité : aucune traduction à la volée ailleurs.

## Pourquoi

- **Cible internationale** : à terme l'application vise l'international ; du français dans le code/contrat serait un frein (i18n, contributeurs, accents dans les paths).
- **Ergonomie** : le contrat génère les clients TS (springdoc → Spring, Expo, Next.js) et lit mieux avec la scaffolding HTTP conventionnelle en anglais.
- Ce choix ne viole pas le glossaire : `slot` n'est banni qu'**en surface produit**, pas côté code/API.

## Conséquences

- **Risque de dérive** : traduire en anglais éloigne le contrat du langage ubiquitaire français. Mitigation : la table FR→EN de `CONTEXT.md` est la seule source de traduction ; un reviewer doit pouvoir diffuser le contrat terme-à-terme contre elle.
- **Coût de réversibilité élevé** : les noms fuient dans trois codebases via les clients générés → décision traitée comme durable.
- Choix de tokens actés : `Slot`, `Variant`, `ActivityTemplate`, `Partner`, `Venue`, `Spot`/`remainingSpots` (évite `seat`/`ticket`), `Booking` (+ `BookingType = DIRECT | REQUEST`), `BookingGroup`, `Alert`.
