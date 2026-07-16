# Forme côté lecture : découverte et ressource Slot

## Décision

**Découverte composée côté serveur.** Deux endpoints de lecture : `GET /v1/slots` (recherche générique — filtres catégorie/distance/période/prix/places, géo PostGIS `ST_DWithin`, pagination curseur) et `GET /v1/discovery` — un flux **composé par le serveur** qui renvoie des sections labellisées (`{ key, title, slots[] }`) et porte la logique des trois « écrans durs » (fourni → maigre → vide). L'état vide renvoie un objet `suggestedAlert` prérempli (zone + catégorie) → la bascule « préviens-moi » est un simple `POST /alerts`.

**Deux représentations, par composition.** `SlotSummary` (cartes de liste) et `Slot` (détail) ; les objets liés (`variant`, `activityTemplate`, `venue`→`partner`) sont **embarqués** dans le détail, pas référencés par ID.

**Termes effectifs dénormalisés + figés sur le Slot.** Le `Slot` porte ses propres `bookingType`, `mode`, `cancellationPolicy`, `price`, `capacity`, `minParticipants` — **capturés à la publication**, même si l'origine est en amont (option partenaire sur l'`ActivityTemplate`, tarif/capacité sur la `Variant`). Les objets embarqués restent pour le **contexte d'affichage** (description, niveau, catégorie) ; les **termes commerciaux engageants** vivent sur le Slot.

## Pourquoi

- **Ne pas rejouer trois fois la logique de découverte.** Le fallback fourni/maigre/vide et le rebond alerte sont produit-critiques ; côté serveur, ils évoluent sans release des clients (Spring, Expo, Next.js rendus identiques).
- **Latence mobile.** Le détail se rend en un appel (embedding) plutôt qu'en cascade de fetches (HAL par ID rejeté).
- **Immutabilité des termes vendus.** « Crenow détient la vérité sur le créneau » (ADR 0001) : un partenaire qui édite un template ne doit **jamais** altérer silencieusement les termes d'un slot déjà publié/vendu. Le snapshot à la publication garantit cette stabilité.

## Conséquences

- Édition d'un `ActivityTemplate`/`Variant` → n'affecte que les **futurs** slots ; les slots publiés gardent leurs termes figés.
- Le contrat expose une légère duplication (termes présents sur le Slot **et** dans les objets embarqués) — assumée, c'est le prix de l'immuabilité.
