# Unité de prix : per-slot vs per-spot

## Décision

La `Variant` porte un flag **`pricingModel = PER_SLOT | PER_SPOT`** en plus de `price`. La catégorie de lancement (« sport à places ») contient les deux mentalités : **court/terrain** = prix pour le créneau entier (padel, foot indoor) ; **cours collectif / séance** = prix par personne (escalade, cours collectifs).

Le `Slot` (et `SlotSummary`) exposent **`price` (canonique), `totalPrice` et `pricePerSpot`**, tous **calculés côté serveur**. Aucun client ne divise jamais un montant — le back est la vérité, y compris pour le split égal et la place restante.

Solo direct (tranche traceuse) : le booking paie **le créneau entier** → `amount = totalPrice`, quel que soit le `pricingModel`. Le chemin split/place-restante consomme `pricePerSpot`.

## Pourquoi

- Collapser sur une seule unité casse la moitié de la catégorie de lancement et brise la confiance partenaire (« pourquoi mon court à 40 € s'affiche à 10 € ? »).
- Fournir les deux montants pré-calculés élimine la division côté client → pas de dérive d'arrondi entre trois apps, argent toujours cohérent.

## Conséquences

- `pricingModel` est un attribut de `Variant`, figé sur le `Slot` à la publication (cohérent ADR 0014 : termes engageants dénormalisés).
- Arrondi du split égal (ex. 40 € / 3) : politique d'arrondi à définir au moment du split groupe (hors tranche traceuse solo).
