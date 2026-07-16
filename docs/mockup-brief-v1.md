# Brief maquettes V1 — Crenow

Document destiné à un agent qui produit les maquettes. Lis d'abord [CONTEXT.md](../CONTEXT.md) (vocabulaire) et les ADR de [docs/adr/](adr/) (décisions).

## ⚠️ Règle d'override — à lire avant tout

Il existe une note produit de ~17 000 lignes (`crenow_note_produit_initiale_v53.md`). **Elle est du contexte historique et détaillé, PAS la décision courante.** Elle contredit les décisions actuelles à de nombreux endroits (elle décrit un produit d'échelle ; on maquette un produit de validation).

**En cas de conflit, l'ordre d'autorité est : ADR > [perimetre-v1.md](perimetre-v1.md) > CONTEXT.md > la note.**

Utilise la note **uniquement** pour le contenu écran-par-écran (via les pointeurs de Bloc ci-dessous), jamais pour re-décider le périmètre. Points où la note est périmée : lancement multi-catégorie (→ concentré, ADR 0004), split payant en V2 (→ V1, ADR 0001), synchro « tous les outils » (→ Google Calendar seul, ADR 0002), alertes différées (→ V1, ADR 0006), affichage des groupes concurrents (→ repoussé, ADR 0001), moteur de réputation (→ hors V1, ADR 0003).

## Fidélité attendue

Wireframes propres et hiérarchisés par défaut. **N'invente pas d'identité de marque lourde** (logo, palette) — elle n'est pas décidée. Concentre-toi sur structure, contenu, états et parcours.

## Contexte produit en une ligne

Boucle cœur : **alerte/notif de dispo → découverte → détail créneau → réservation** (place restante incluse). Lancement concentré sur **une catégorie sport à places** (badminton/squash, foot indoor, escalade, cours collectifs), géo lyonnaise serrée.

---

## Inventaire des écrans V1

### Utilisateur

| Écran | Contenu de référence | Notes V1 | Dur ? |
|---|---|---|---|
| Onboarding utilisateur | Bloc 16 (§39) + Bloc 41 (§64) | Intérêts + zone + **proposer une 1re alerte**. Vérif progressive : pas de tél à l'inscription, tél au 1er paiement. Prénom obligatoire | |
| Accueil / découverte | Bloc 43 (§66) | Surface **découverte-ou-intention** ; **pas de section communautés** ; « groupes à compléter » plus bas | ⚠️ |
| Recherche / filtres | Bloc 20 (§43) + Bloc 57 (§80) | Filtres : catégorie, distance, période, prix, places | |
| Détail d'un créneau | Bloc 44 (§67) | Afficher clairement **directe vs à confirmer**, politique d'annulation, places restantes | ⚠️ |
| Réservation (solo/direct) | Bloc 45 (§68) + Bloc 28 (§51) | Récap → paiement → confirmation | |
| Créer / rejoindre un groupe | Bloc 46 (§69) + Bloc 47 (§70) | **Privé** (inviter) + **public** (rejoindre des inconnus, voir les participants avant de payer) | ⚠️⚠️ |
| Mes réservations | Bloc 29 (§52) | Distinguer **statut réservation** et **statut paiement** | ⚠️ |
| Alertes / envies / suivre | Bloc 55 (§78) + Bloc 56 (§79) | Version minimale (ADR 0006). **Pas de créneau favori** | |
| Préférences de notifications | Bloc 21 (§44) | Par catégorie ; transactionnel toujours actif ; plafond commercial | |
| Profil utilisateur | Bloc 41 (§64) | Minimal : prénom, photo optionnelle. Profil public social (Bloc 53) → **hors V1** | |

### Partenaire

| Écran | Contenu de référence | Notes V1 | Dur ? |
|---|---|---|---|
| Onboarding partenaire | Bloc 17 (§40) | Compte → entreprise → établissement → activité → politique → mode → **Stripe (gate publication)** → validation | |
| Dashboard partenaire | Bloc 59 (§82) | Vue créneaux + réservations reçues | |
| Créer un créneau | Bloc 60 (§83) | Rapide, modèle à la volée, duplication, lien privé, brouillon, **prévisualisation**. Photo héritée du modèle/établissement | ⚠️ |
| Activités modèles + variantes | Bloc 61 (§84) + Bloc 62 (§85) | Modèle → variantes (durée/prix/capacité/niveau). Pas de vocabulaire dynamique, pas d'analytics par modèle | |
| Réservations reçues + présent/absent | Bloc 30 (§53) | Notif instantanée ; bouton présent/absent (donnée brute) ; **retirer places libres** vs **annuler résa** | ⚠️ |
| Annulation partenaire | Bloc 31 (§54) | Déclenche remboursement + incident. Pas d'écrasement silencieux (ADR 0005) | |
| Connexion synchro | Bloc 25 (§48) | **Google Calendar uniquement** (ADR 0002) : sortant + entrant mode validation. Autres outils = « bientôt » | |
| Page partenaire publique | Bloc 58 (§81) | Vitrine + créneaux du partenaire | |

---

## Les 3 écrans durs — spécifiés en états

Ce sont les écrans où une maquette naïve casse le produit.

### 1. Accueil — l'état vide est le cas nominal, pas une erreur

| État | Contenu |
|---|---|
| **Fourni** | Sections temporelles « Dispo ce soir / Ce week-end », dernières places, créneaux suivis/récurrents, groupes à compléter (plus bas) |
| **Maigre** | Élargir la fenêtre (semaine) + remonter le récurrent (cours collectifs) pour ne jamais montrer un écran vide |
| **Vide** | **Se transforme en capture d'intention.** Ex. « Rien ce soir dans tes activités ? → *Préviens-moi quand un créneau se libère* » → création d'alerte |

Ne jamais afficher une section vide façon « aucun résultat » sèche. Le vide = une invitation à poser une alerte.

### 2. Réservation groupe public — l'attente doit se lire comme *normale*

Vocabulaire à respecter : **préautorisé ≠ débité.** Copy clé : *« Ta place est réservée. Rien n'est débité tant que le groupe n'est pas complet. »*

| État | Affichage |
|---|---|
| Place prise, groupe incomplet | Barre de progression **« 3/4 — il manque 1 personne »**, ton positif, « préautorisé » visible |
| Groupe complet | Capture → **« Réservation confirmée »**, « paiement débité » |
| Échec (incomplet / concurrent a gagné / créneau parti) | **« Aucun débit. »** + rebond : **« On te prévient si un créneau similaire se libère ? »** → crée une alerte |

**Ne PAS afficher le nombre de groupes concurrents** (ADR 0001, révisé) — cas rare au lancement, risque d'enchère anxiogène. L'échec gracieux suffit.

### 3. Langage paiement / statut — partout où l'argent apparaît

Séparer visuellement **statut de réservation** et **statut de paiement**. États paiement à savoir représenter (Bloc 28 §51.7) : `Préautorisé` · `En attente de confirmation` · `Confirmée` · `Débité` · `Préautorisation annulée` · `Remboursement en cours` · `Remboursé`. Toujours dire à l'utilisateur **s'il est débité ou seulement préautorisé**.

---

## À NE PAS maquetter (hors V1)

Communautés · messagerie / chat · profils publics sociaux · mini-réseau social · split de paiement inégal/personnalisé · annulation partielle · scores / badges de réputation visibles · connecteurs de synchro autres que Google Calendar · vocabulaire dynamique par catégorie · analytics par activité modèle · affichage des groupes concurrents.
