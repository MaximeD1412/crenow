# Périmètre de la couche confiance (V1)

## Contexte

Le flux public « rejoindre des inconnus » est en V1 (voir ADR 0001), ce qui impose une couche de confiance. La note (Bloc 9) décrit un moteur de réputation complet (scores internes double-sens, sanctions progressives, contestation, blacklist locale/globale) — mais le défère elle-même en V1.1/V2 (§30.9). Il fallait décider ce qui est réellement porteur pour *lancer*.

## Décision

**Noyau confiance en V1 (seul) :**
- Téléphone vérifié au premier paiement / pour rejoindre-créer un groupe public (Bloc 41).
- Prénom obligatoire, nom optionnel, photo optionnelle mais encouragée.
- **Transparence** : dans le flux public, l'utilisateur voit les participants déjà inscrits (prénom + photo) **avant** de payer/rejoindre. C'est le vrai mécanisme de sécurité IRL.
- **Signaler / bloquer** + **bannissement manuel par un admin**.
- Capture partenaire « présent / absent » : **donnée brute uniquement**, sans sanction automatique.

**Repoussé en V1.1+ :** scores internes utilisateur/partenaire, sanctions progressives automatiques, flux de contestation, distinction automatisée blacklist locale / sanction globale.

## Raison (non évidente)

Le modèle de **paiement à la place** (ADR 0001) neutralise déjà le principal risque économique du flux public : « n'a pas payé » → le groupe ne se confirme pas (géré par le gating, sans réputation) ; « a payé mais absent » → il a déjà payé, le partenaire n'est pas lésé. Le moteur de scores est donc **confortable, pas vital** pour lancer. Ce qui protège réellement, c'est transparence + signalement + modération manuelle.

## Conséquences

- La capture « présent/absent » dès la V1 constitue le **jeu de données** qui permettra de construire le scoring plus tard sans rétro-collecte.
- Point ouvert : visibilité de la photo (restreinte aux co-participants d'un groupe, pas d'annuaire public) — à confirmer au design des profils.
