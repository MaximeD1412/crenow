# Crenow

Marketplace de **créneaux libres** et **places restantes** pour des activités locales : côté utilisateur, trouver une activité disponible maintenant / bientôt autour de soi ; côté partenaire, remplir des créneaux qui seraient restés vides. Modèle générique multi-catégorie (sport, activités de groupe, ateliers créatifs…), le vocabulaire affiché s'adapte au type / sous-type.

## Langage

**Créneau** :
Objet central réservable sur Crenow — une plage horaire chez un partenaire correspondant à une activité, avec une capacité et un prix. C'est l'unité autour de laquelle tout gravite (le nom « Crenow » en découle).
_Éviter_ : slot (en surface produit), offre, annonce.

**Place** :
Une unité de capacité au sein d'un créneau. Un créneau a une **capacité** (nombre de places total) et un nombre de **places restantes**.
_Éviter_ : siège, ticket.

**Place restante** :
Une place encore disponible sur un créneau déjà partiellement rempli — le cas « rejoindre une partie / activité incomplète ». Différenciateur produit face aux apps de réservation classiques.

**Mode du créneau (exclusif / partagé)** :
- **Exclusif** (défaut) : un seul **groupe de réservation** repart avec le créneau (escape game, court de padel). Plusieurs groupes distincts peuvent le convoiter, mais un seul gagne.
- **Partagé** (paramétrable, surtout post-V1) : les places sont vendues à des parties **indépendantes** jusqu'à capacité (cours collectif, événement de masse).
Ne pas confondre « partagé » (plusieurs groupes indépendants) avec un **groupe public** (un seul groupe, sur un créneau exclusif, dont les places restantes sont ouvertes à des inconnus).

**Groupes concurrents** :
Plusieurs **groupes de réservation** distincts qui visent le **même** créneau exclusif. Aucun blocage : le **premier à compléter** (toutes les places payées) remporte le créneau ; les préautorisations des autres sont annulées. L'affichage de leur nombre est repoussé hors V1 (rare au lancement) — la règle reste back-end, l'échec est géré gracieusement.

**Utilisateur** :
La personne qui se connecte à Crenow — **une seule identité** par personne, porteuse de son prénom (obligatoire) et de ses **rôles**. Explore sans compte ; l'identité devient nécessaire pour réserver, rejoindre/créer un groupe de réservation ou poser une alerte.
_Éviter_ : compte (ambigu), membre.

**Rôle** :
Capacité attachée à une **identité** d'utilisateur — `réserver` (défaut), `partenaire` (publier des créneaux), `admin` (valider, bannir). L'autorisation porte sur les **rôles**, jamais sur un « type de compte » : une même personne peut réserver **et** publier.

**Partenaire** :
**Organisation** (une entreprise → un ou plusieurs **établissements**) qui publie des créneaux, rattachée à un **Utilisateur** responsable via son rôle `partenaire` — **pas** une identité de connexion distincte. Marketing/produit : « partenaire ». Code : `partner` / `vendor` / `venue` selon le niveau métier.
_Éviter_ : client (ambigu avec l'utilisateur final), vendeur (en surface produit).

**Établissement / Lieu** :
Lieu physique rattaché à un partenaire. Un **partenaire** peut avoir plusieurs **établissements**.

**Activité** :
Nature de ce qui est proposé sur un créneau (padel, poterie, escape game, yoga…). Terme **descriptif** de contexte, pas l'objet réservable.
_Éviter_ : d'employer « activité » là où on parle en fait du **créneau** réservable.

**Catégorie / Type / Sous-type** :
Classification de l'activité qui pilote le vocabulaire dynamique et le ciblage (ex. Sport → Padel ; Activités de groupe → Escape game). Le padel n'est qu'un **sous-type**, pas le centre du produit.

**Ressource** :
Ce qui est mobilisé pour honorer un créneau (un court, une salle d'atelier, une session d'escape game). Abstraction générique permettant de couvrir toutes les catégories.

**Activité modèle** :
Base **réutilisable** définie par un partenaire (titre, catégorie / sous-catégorie, description, politique d'annulation, mode par défaut) à partir de laquelle on génère des créneaux. À distinguer du **créneau** (occurrence datée). Relation : Activité modèle (1) → **Variante** (N).

**Variante** :
Format d'une activité modèle portant durée / prix / capacité / min-max participants / niveau (ex. padel 60 min vs 90 min ; escape game 2/4/6 joueurs). Un **créneau** est l'occurrence datée d'**une** variante. Le **prix** s'entend soit **par créneau entier** (court, terrain), soit **par place** (cours collectif) — porté par le flag `pricingModel` (ADR 0015).

**Seuil de viabilité (d'un groupe)** :
Le **minimum de participants** porté par la variante, dans son rôle d'arbitre de confirmation d'un **groupe de réservation**. Si un membre lâche ou échoue au paiement à la complétion : payeurs restants **≥ seuil** → le groupe se confirme à effectif réduit ; **< seuil** → il échoue (remboursement). Quand `minimum = capacité` (effectif exact requis), tout lâcheur fait échouer le groupe.

**Réservation** :
Engagement d'un utilisateur sur un créneau (pour une ou plusieurs places).

**Réservation directe** :
Réservation confirmée immédiatement, quand la disponibilité est fiable.
_À distinguer de_ : **Réservation à confirmer**.

**Réservation à confirmer** :
Réservation qui nécessite une validation du partenaire avant d'être confirmée (disponibilité non garantie).

**Groupe de réservation** :
Organisation **temporaire** autour d'**un créneau précis** : réunir les participants, gérer le paiement à plusieurs, puis disparaître / passer en historique après l'activité. Peut être **privé** (inviter ses amis) ou **public** (ouvert à d'autres utilisateurs pour compléter les places).
_Éviter_ : réservation groupée, groupe (seul).

**Participant** :
Un utilisateur membre d'un groupe de réservation pour un créneau donné.

**Communauté** :
Groupe **durable** d'utilisateurs réunis autour d'un intérêt, d'un lieu ou d'un type de sortie. Sert à recevoir des opportunités et à créer plus vite des groupes de réservation. Appartient à l'étage **social**.
_À distinguer nettement de_ : **Groupe de réservation** (temporaire, lié à un créneau).

**Boost** :
Mise en avant — payante ou offerte — d'un créneau auprès d'une audience ciblée (notifications / visibilité).

**Alerte** :
Intention **durable** posée par l'utilisateur (`activité/catégorie + zone/distance + période + prix max optionnel`) qui déclenche une notification quand un créneau correspondant se publie. Plus importante que les favoris. Sert aussi de **signal de demande** aux partenaires.
_À noter_ : pas de « créneau favori » — un créneau est périssable ; les signaux durables portent sur l'activité, le partenaire ou l'alerte.

**Suivre (partenaire / activité)** :
Signal durable pour recevoir les nouveaux créneaux d'un partenaire ou d'une activité/catégorie et personnaliser l'accueil.

**Envie** :
Intention plus large et moins structurée qu'une **alerte** (« un escape game ce week-end »). Sert à personnaliser l'accueil et à suggérer des alertes. Version minimale seulement en V1 (l'interprétation floue est repoussée).

**Synchronisation sortante** :
Crenow écrit les réservations confirmées dans l'outil du partenaire (ex. Google Calendar), pour qu'il les voie sans ouvrir l'app. Crenow **reste source de vérité**.

**Synchronisation entrante** :
Crenow lit l'outil du partenaire pour **détecter** des créneaux libérés / annulations et les proposer à la publication. Déplace la source de vérité vers l'outil externe → nécessite le **mode validation** et une écriture retour.

**Mode validation / Mode automatique** :
Deux façons de traiter un créneau détecté par synchronisation entrante. **Validation** : Crenow suggère, le partenaire confirme la publication (défaut, seul retenu en V1). **Automatique** : publication selon des règles prédéfinies, sans intervention (post-V1).

**Retirer les places restantes** :
Action partenaire qui réduit la disponibilité d'un créneau aux seules places **non encore réservées**. Instantané, sans conséquence. À ne pas confondre avec l'**annulation partenaire**.

**Annulation partenaire** :
Action par laquelle un partenaire annule une place **déjà réservée** (payée). Déclenche le chemin remboursement automatique + incident tracké. Ne peut jamais « écraser » silencieusement une résa payée.

**No-show** :
Absence d'un utilisateur à une réservation **confirmée**. Signalable par le partenaire uniquement sur réservation confirmée.

**Score interne** :
Indicateur de fiabilité (utilisateur ou partenaire) maintenu par Crenow, **non visible**, post-V1. En V1 on ne capture que la donnée brute « présent / absent ».

**Blacklist locale / Sanction globale** :
Un partenaire peut bloquer un utilisateur **chez lui** (locale, sa décision). Une sanction à l'échelle de Crenow (globale) relève de Crenow après analyse. Les deux sont liées mais distinctes.

**Notification transactionnelle / commerciale** :
- **Transactionnelle** : liée à une réservation de l'utilisateur (confirmation, rappel, annulation, remboursement…). Toujours envoyée.
- **Commerciale** : opportunité / marketing (nouveau créneau, dernière place, boost, réduction). Soumise aux préférences, au consentement et à un plafond de fréquence.

## Ambiguïtés signalées

**« Groupe »** — mot surchargé. Trois notions distinctes :
- **Groupe de réservation** : temporaire, lié à un créneau, porte le paiement à plusieurs. Proche du cœur produit.
- **Communauté** : durable, liée à un intérêt. Étage social, différé après validation.
- **Groupe d'amis / carnet** (« Mes potes padel ») : liste de contacts réutilisable pour inviter vite. Commodité, pas un objet métier central.
Ne jamais dire « groupe » seul dans le produit ou le code.

**« Réserver »** — recouvre deux flux au comportement opposé : réserver un **créneau entier** (seul ou avec ses amis) vs **rejoindre une place restante** (compléter le créneau d'un partenaire ou d'un autre utilisateur). Les nommer distinctement.

**« Compte »** — à éviter seul. Il n'y a **qu'une identité** par personne (l'**Utilisateur**), porteuse de **rôles**. Le **Partenaire** est une organisation rattachée à cette identité via le rôle `partenaire`, **pas** un second compte ni une seconde connexion.

## Correspondance FR → EN (contrat d'API)

Le langage du domaine reste **français** (produit + discussions). Le **contrat d'API** (paths, schémas, énumérations) est en **anglais** — objectif international, ergonomie REST/TS (voir ADR 0013). Traduction figée une fois, ici : ne jamais traduire un terme à la volée ailleurs.

| Domaine (FR) | Contrat (EN) | Remarque |
|---|---|---|
| Créneau | `Slot` | « slot » banni en surface produit, autorisé côté code/API |
| Variante | `Variant` | |
| Activité modèle | `ActivityTemplate` | base réutilisable → génère des `Slot` |
| Activité (descriptif) | `Activity` | |
| Catégorie / Type / Sous-type | `Category` / `Type` / `Subtype` | |
| Ressource | `Resource` | |
| Partenaire | `Partner` | l'organisation |
| Établissement / Lieu | `Venue` | |
| Place / Place restante | `Spot` / `remainingSpots` | évite `seat`/`ticket` (bannis) |
| Réservation | `Booking` | |
| Réservation directe | `BookingType = DIRECT` | |
| Réservation à confirmer | `BookingType = REQUEST` | request-to-book |
| Groupe de réservation | `BookingGroup` (private / public) | |
| Participant | `Participant` | |
| Alerte | `Alert` | |
| Suivre | `Follow` | |
| Envie | `Wish` | |
| Communauté | `Community` | hors V1 |
| Boost | `Boost` | |
| Seuil de viabilité | `viabilityThreshold` / `minParticipants` | |
| Mode exclusif / partagé | `EXCLUSIVE` / `SHARED` | |

## Dialogue d'exemple

> **Dev** : Quand un utilisateur « rejoint une partie », il crée une réservation ?
> **Domaine** : Il rejoint un **groupe de réservation** existant en prenant une **place restante** sur le **créneau**. Sa **réservation** ne porte que sur sa place.
> **Dev** : Et si c'est lui qui lance la partie et invite des amis ?
> **Domaine** : Il crée un **groupe de réservation** privé sur ce créneau et invite des **participants**. S'il ouvre les places restantes aux autres, le groupe devient public.
> **Dev** : La « communauté Padel Lyon Sud » là-dedans ?
> **Domaine** : Rien à voir avec un créneau précis. C'est une **communauté** — durable — qui sert juste à faire naître plus vite ces groupes de réservation. Étage social, pas le cœur.
