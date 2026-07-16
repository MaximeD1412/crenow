# Périmètre V1 — synthèse

Roll-up des décisions prises en session. Les détails et le *pourquoi* sont dans les ADR référencés.

## Dans le V1

| Domaine | Décision | Réf |
|---|---|---|
| **Boucle cœur** | Notif de dispo pertinente → réservation, **place restante incluse** (rejoindre une activité incomplète = différenciateur) | — |
| **Créneau** | Vérité détenue par Crenow (créneaux créés manuellement) ; **directe par défaut**, « à confirmer » en option partenaire ; **exclusif par défaut** ; porte une origine externe (sync-ready) | ADR 0001 |
| **Groupes** | Groupe de réservation **privé** (inviter des amis) + **public** (rejoindre des inconnus) | ADR 0001 |
| **Concurrence** | Groupes concurrents sur créneau exclusif : **premier à compléter gagne**, sans blocage, nombre de groupes affiché | ADR 0001 |
| **Paiement** | Entier (solo / privé) + **préautorisation par place à gating collectif égal** (public + split égal entre amis). Fenêtre = `min(début activité, 1re préauth + ~5-7 j)` ; split-groupe ≤ ~5 j | ADR 0001 |
| **Incidents** | Remboursement automatique rapide, suivi du taux d'incident, CGU de dédouanement | ADR 0001 |
| **Synchro** | Publication manuelle (plancher universel) + **Google Calendar** : sortant (mirror, Crenow reste vérité) + entrant **mode validation**. Port fin piloté par le domaine ; pas de framework générique | ADR 0002 |
| **Confiance** | Tél vérifié au paiement + prénom + photo encouragée + **transparence participants** + signaler/bloquer + ban manuel + capture présent/absent (donnée brute) | ADR 0003 |
| **Notifications** | Transactionnelles (toujours) + alertes commerciales basiques par catégorie + plafond de fréquence + boost ciblé simple. **Optimiser contre le silence (densité), pas le spam** | — |
| **Lancement** | **1 catégorie** (sport à places, sans mener par le padel) × géo lyonnaise serrée, validée par un probe de prospection ; architecture multi-catégorie conservée | ADR 0004 |
| **Modèle de données** | Générique : **Activité modèle → Variante → Créneau** ; catégorie / capacité / mode / niveau / politique génériques ; authoring concret minimal + variantes bornées | — |
| **Parcours partenaire** | Onboarding note (Bloc 17) + création créneau note (Bloc 60) acceptés. Régime permanent : notif instantanée + mirror sortant + retrait places libres ; **Crenow protège l'utilisateur payé**, pas d'écrasement silencieux | ADR 0005 |
| **Accueil & alertes** | Accueil = surface découverte-ou-intention (fenêtre élargie + récurrent + état vide → alerte) ; **alerte minimale en V1** (carburant cold-start bilatéral) ; pas de section communautés | ADR 0006 |
| **Flux groupe public (UX)** | État d'attente normalisé (préautorisé ≠ débité, « 3/4 il manque 1 ») + échec rassurant qui rebondit sur une alerte ; affichage des groupes concurrents repoussé | ADR 0001 |

## Hors V1 (repoussé)

- **Social** : communautés, messagerie, profils publics, mini-réseau social.
- **Paiement** : split inégal / personnalisé, annulation partielle, wallet, avoirs.
- **Réservation** : mode « partagé » (places indépendantes, multi-groupes sur un créneau).
- **Synchro** : connecteurs métier, auto-publication par règles, framework générique de connecteurs, ICS.
- **Confiance** : moteur de scores internes, sanctions progressives automatiques, contestation, blacklist locale/globale automatisée.
- **Notifications** : scoring de pertinence, perso avancée, campagnes, A/B testing.
- **Modèle** : vocabulaire dynamique (moteur), cycle de vie étendu, analytics par activité modèle, champs complémentaires.

## Branches non encore instruites (sessions futures)

- Business model chiffré : commission exacte, pricing des boosts, seuils d'abonnement.
- Onboarding partenaire + dashboard (parcours complet).
- Onboarding utilisateur + écrans cœur de l'app (accueil, découverte/recherche, détail créneau, parcours de réservation).
- Politique d'annulation (options par défaut / configurables) — Blocs 7, 8, 31, 32.
- Liste d'attente & créneaux similaires — Bloc 67.
- Juridique : CGU/CGV, RGPD, statut marketplace, obligations Stripe Connect.
- Écrans cœur restants de l'app utilisateur : détail créneau, parcours de réservation (dont l'état groupe public), onboarding utilisateur.
