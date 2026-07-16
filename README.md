# Crenow

Marketplace de **créneaux libres** et **places restantes** pour des activités locales.
Voir [`CONTEXT.md`](CONTEXT.md) pour le langage du domaine et [`docs/adr/`](docs/adr) pour les décisions.

## Monorepo layout (ADR 0007)

```
backend/          Java 25 + Spring Boot 4 (Gradle) — source de vérité de l'API
shared/openapi/   Contrat OpenAPI (openapi.yaml) + client TS généré (@crenow/api-client)
apps/mobile/      App utilisateur Expo + React Native (consomme le client généré)
docs/, CONTEXT.md Décisions (ADR) et langage du domaine
e2e/              Smoke test bout-en-bout via le client généré
```

Deux chaînes de build coexistent, orchestrées à la racine : **Gradle** (backend) et **pnpm + Turbo** (TS).

## Prérequis

- **Java 25** (`java -version`)
- **Node ≥ 22** + **pnpm** (`corepack enable`)
- **Docker** — requis pour les tests (Testcontainers) et la base de dev locale

## Le contrat est la source de vérité (ADR 0013)

Le backend expose l'API décrite par [`shared/openapi/openapi.yaml`](shared/openapi/openapi.yaml).
Le client TS est **généré** depuis cette spec (openapi-generator, `typescript-fetch`) — ne jamais
éditer `shared/openapi/src/generated/` à la main.

```bash
pnpm install
pnpm generate:client     # openapi.yaml -> shared/openapi/src/generated
pnpm build               # génère + compile le client, via Turbo
pnpm typecheck           # typecheck de tous les paquets TS
```

## Backend

```bash
# Base de dev locale (PostGIS)
pnpm dev:db                       # docker compose up -d db

cd backend
./gradlew bootRun                 # démarre sur http://localhost:8080/v1
./gradlew test                    # tests d'intégration (Testcontainers, nécessite Docker)
```

Tracer public (sans auth) :

```bash
curl http://localhost:8080/v1/config
# { "stripePublishableKey": "pk_test_crenow_dev_placeholder" }
```

Spec servie par springdoc : `http://localhost:8080/v1/v3/api-docs` · UI : `/v1/swagger-ui.html`.

### Configuration (env)

| Variable | Défaut (dev) | Rôle |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/crenow` | JDBC Postgres |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `crenow` / `crenow` | Identifiants DB |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_crenow_dev_placeholder` | Clé publiable renvoyée par `GET /config` |
| `SERVER_PORT` | `8080` | Port HTTP |

## Mobile

```bash
cd apps/mobile
pnpm start                        # Expo (consomme @crenow/api-client)
```

## Tests bout-en-bout (nécessite Docker)

Le smoke test démarre un PostGIS (Testcontainers) + le jar backend, puis appelle
`GET /config` **via le client généré** :

```bash
pnpm build                        # jar + client à jour
pnpm test:e2e                     # e2e/ : client généré -> backend -> /config
```

## Test complet

```bash
./backend/gradlew -p backend test   # backend (Testcontainers)
pnpm test                           # paquets TS + e2e
```
