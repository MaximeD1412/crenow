# Stack technique & forme du repo

## Décision

Stack retenue pour Crenow :

| Couche | Choix |
|---|---|
| **Backend / API** | **Java 25 (LTS)** + **Spring Boot 4.x** (dernières versions GA), REST documentée via **springdoc-openapi** |
| **Base de données** | **PostgreSQL** (managé), migrations **Flyway** |
| **Persistance** | Spring Data JPA / Hibernate ; verrous pessimistes (`SELECT … FOR UPDATE`) sur les chemins critiques (capacité créneau, complétion de groupe) |
| **Paiement** | **Stripe Connect** |
| **Mobile utilisateur** | **React Native + Expo + TypeScript** |
| **Web partenaire/admin + pages publiques** | **Next.js + TypeScript + Tailwind + shadcn/ui** |
| **Notifications push** | Expo Notifications (client) + envoi piloté côté backend |
| **Repo** | **Monorepo** : `apps/{mobile,web}` · `backend/` (Gradle) · `shared/openapi` (spec + clients TS générés) |

Le backend est **source de vérité** ; les deux clients TS consomment l'API REST.

## Pourquoi (l'arbitrage)

Le dev est **seul** et à l'aise en Java **comme** en TS — l'argument « expertise Java existante » de la note ne tranche donc plus. Le choix est un vrai arbitrage entre trois axes :

- **full-TS / NestJS** — gagne sur l'*unification* (un langage sur les 3 applis, types partagés client↔serveur) ; le plus fort levier de vélocité en solo.
- **Go** — gagne sur la *sobriété d'exécution et le churn de dépendances minimal* sur plusieurs années ; mais deuxième langage, plus de câblage manuel, modélisation d'états plus verbeuse.
- **Java / Spring Boot** — gagne sur la *maturité transactionnelle et la stabilité long terme* (rétro-compatibilité, `@Transactional`, JPA éprouvé en paiement), et facilite un futur recrutement backend.

Priorité retenue par le fondateur après réflexion : **maintenance et robustesse sur plusieurs années > unification full-TS**. Le cœur de Crenow est financier et transactionnel (créneaux, préautorisations, capture, commission, remboursement) ; Spring Boot est le socle le plus conservateur pour le nourrir dans la durée. Java moderne (records, sealed interfaces) modélise proprement les machines à états `BookingStatus` / `PaymentStatus`.

## Conséquences

- **Deux langages** (Java backend, TS clients) : surface à maintenir plus large qu'en full-TS. Coût accepté.
- **Pas de types partagés natifs** à la frontière. À la place : le backend **génère la spec OpenAPI** (springdoc), et `shared/openapi` en dérive des **clients TS typés** pour le web et le mobile — la spec est la source de vérité du contrat. C'est le prochain livrable bloquant (voir ADR à venir sur le contrat d'API).
- **Flyway** (re)devient l'outil de migration (cohérent avec l'écosystème Java), et non Drizzle/Prisma.
- Le monorepo mélange builds Gradle (backend) et pnpm/Turbo (clients) : deux chaînes de build coexistent, orchestrées à la racine.
- **jOOQ** reste une option ultérieure si le contrôle SQL fin devient nécessaire au-delà de ce que JPA offre confortablement.

## Compléments d'infra (V1)

Choix standards et réversibles (pas d'ADR dédié) :

| Besoin | Choix |
|---|---|
| Push mobile | **Expo Push** (ciblage + plafond de fréquence côté back) |
| Email transactionnel (magic-link, confirmations) | **Postmark** (ou Resend) |
| Recherche texte | **PostgreSQL full-text** (`tsvector`) |
| Géo / distance (filtre cœur) | **PostGIS** |
| Stockage images | **Cloudflare R2** (S3-compatible) + upload par URL présignée |
| Jobs différés / planifiés (expiration auth, timeouts confirmation, fenêtre de complétion) | **db-scheduler** (adossé à Postgres — pas de Redis en V1) |
| Hébergement | Postgres managé (**Neon**/RDS) · backend **Render/Fly.io** · **Vercel** (web) · **Expo EAS** (mobile) |

`db-scheduler` est souligné : l'expiration fiable des préautorisations et des fenêtres de complétion est ce qui garantit « aucun débit » en cas d'échec de groupe (ADR 0010).
