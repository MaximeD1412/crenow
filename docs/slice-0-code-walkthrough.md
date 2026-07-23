# Slice 0 — Explication du code ajouté

> Compagnon de [`slice-0-walking-skeleton.md`](slice-0-walking-skeleton.md), qui couvre les *décisions*.
> Ce document-ci couvre le *code* : ce que fait chaque fichier, et pourquoi les lignes non évidentes sont là.

**Échelle** — 970 lignes écrites à la main (31 fichiers versionnés) contre 5 189 lignes générées
(47 fichiers : 38 modèles, 7 classes d'API). Le pipeline produit 5× ce qu'on écrit, et rien de ce qu'il
produit n'est versionné.

---

## 1. Le backend Java

### `backend/build.gradle.kts` — le manifeste des dépendances

```kotlin
plugins {
    java
    id("org.springframework.boot") version "4.0.7"
    id("io.spring.dependency-management") version "1.1.7"
}
```

Le plugin `dependency-management` importe le BOM de Spring Boot : c'est lui qui permet d'écrire des
dépendances **sans numéro de version** plus bas. Toutes les versions viennent d'un jeu cohérent testé
ensemble par l'équipe Spring.

```kotlin
java {
    toolchain { languageVersion = JavaLanguageVersion.of(25) }
}
```

Une **toolchain**, pas un `sourceCompatibility`. La différence compte : Gradle télécharge et utilise un JDK 25
si la machine n'en a pas, au lieu d'échouer ou de compiler silencieusement avec une autre version. Le build
donne le même résultat sur ta machine et en CI.

Les dépendances, groupées par rôle :

| Ligne | Pourquoi |
|---|---|
| `spring-boot-starter-web` | Tomcat + Spring MVC + Jackson — sert `/config` |
| `spring-boot-starter-actuator` | Expose `/actuator/health`, dont le test E2E se sert pour savoir quand l'app est prête |
| `spring-boot-starter-data-jpa` | Fournit le `DataSource` et Hibernate. Aucune entité n'existe encore : c'est la couche de persistance qu'exigent les slices suivantes, et sa présence prouve dès maintenant que la connexion DB monte |
| `spring-boot-flyway` | **La ligne critique** — voir §7 |
| `flyway-database-postgresql` | Le dialecte Flyway pour PostgreSQL |
| `runtimeOnly("org.postgresql:postgresql")` | Le driver JDBC. `runtimeOnly` et pas `implementation` : aucun code ne l'importe, on ne veut pas qu'il pollue le classpath de compilation |
| `springdoc-openapi-starter-webmvc-ui:3.0.3` | Sert la spec. **Seule version épinglée en dur** : springdoc n'est pas dans le BOM Spring Boot, donc il faut choisir. La ligne `3.0.x` cible Spring Boot 4 (la `2.x` cible Boot 3) |

Côté test, `testcontainers-junit-jupiter` et `testcontainers-postgresql` portent les noms **d'après le renommage
de Testcontainers 2.0** (avant : `junit-jupiter` et `postgresql` tout court). Leurs versions restent implicites :
Spring Boot 4 importe le `testcontainers-bom`.

```kotlin
tasks.withType<Test> { useJUnitPlatform() }
```

Sans ça, Gradle lance JUnit 4 et **ne trouve aucun test** — il passe au vert sans rien exécuter.

---

### `CrenowApplication.java` — le point d'entrée

```java
@SpringBootApplication
public class CrenowApplication {
    public static void main(String[] args) {
        SpringApplication.run(CrenowApplication.class, args);
    }
}
```

Rien de spécifique à Crenow. `@SpringBootApplication` déclenche le scan des composants **à partir de ce
package** (`com.crenow`) : tout code placé en dehors serait invisible. C'est ce qui rend l'arborescence des
packages structurante plutôt que décorative.

---

### `ConfigController.java` — l'endpoint traceur

```java
@RestController
public class ConfigController {

    private final String stripePublishableKey;

    public ConfigController(@Value("${crenow.stripe.publishable-key}") String stripePublishableKey) {
        this.stripePublishableKey = stripePublishableKey;
    }

    @GetMapping("/config")
    public ConfigResponse getConfig() {
        return new ConfigResponse(stripePublishableKey);
    }
}
```

Trois choix délibérés :

1. **Injection par constructeur**, pas `@Value` sur un champ. Le champ est `final`, l'objet est donc
   complètement construit ou pas construit du tout — et il reste instanciable dans un test sans conteneur Spring.
2. **Si la propriété manque, l'application refuse de démarrer.** C'est voulu : mieux vaut un échec au démarrage
   qu'un `/config` qui renvoie `null` et une app mobile qui casse plus tard chez un utilisateur.
3. **`/config` et non `/v1/config`.** Le préfixe `/v1` vient du `context-path` (voir plus bas) ; il n'est écrit
   dans aucun contrôleur, donc changer de version ne demande pas de toucher au code.

### `ConfigResponse.java`

```java
public record ConfigResponse(String stripePublishableKey) { }
```

Un `record` : Jackson le sérialise directement en `{"stripePublishableKey": "..."}`. Le nom du composant
**est** le nom de la clé JSON, qui **est** la propriété du schéma `Config` dans `openapi.yaml`. Renommer ici
casse le contrat — c'est justement ce qu'on veut rendre visible.

---

### `application.yml` — la configuration

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/crenow}
```

La syntaxe `${VAR:défaut}` donne un dev qui marche sans rien configurer, et une prod entièrement pilotée par
l'environnement. Aucun secret dans le repo.

```yaml
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
```

Deux garde-fous qui comptent pour la suite :

- **`ddl-auto: validate`** — Hibernate n'a **pas** le droit de créer ou modifier le schéma. Flyway en est seul
  propriétaire. Sans ça, Hibernate et Flyway se marchent dessus et le schéma réel finit par dépendre de l'ordre
  de démarrage.
- **`open-in-view: false`** — coupe le comportement par défaut qui garde une session Hibernate ouverte pendant
  le rendu de la réponse. Ce défaut masque les problèmes de chargement paresseux et tient une connexion du pool
  plus longtemps que nécessaire. Sur un produit transactionnel, c'est un piège à retardement.

```yaml
server:
  servlet:
    context-path: /v1
```

Le contrat annonce `servers: http://localhost:8080/v1`. Plutôt que de préfixer chaque contrôleur, toute
l'application vit sous `/v1` — les paths du code correspondent alors **exactement** aux paths de la spec.

```yaml
crenow:
  stripe:
    publishable-key: ${STRIPE_PUBLISHABLE_KEY:pk_test_crenow_dev_placeholder}
```

Clé *publiable* — non secrète par nature. L'intérêt de la servir plutôt que de la figer dans le bundle mobile :
rotation et bascule test ↔ live sans republier l'app.

---

### `V1__baseline.sql` — la migration

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Une ligne, mais elle porte deux preuves : Flyway s'exécute réellement, et la base est un PostgreSQL doté de
**PostGIS**. La Slice 2 s'appuiera dessus pour la colonne géo et la recherche `ST_DWithin`.

Le nom de fichier est un contrat Flyway : `V1__` (deux underscores) donne la version `1`, celle-là même que le
test interroge.

---

## 2. Le test backend — le fichier le plus dense

`ConfigEndpointIT.java` mérite d'être lu en entier, car c'est lui qui **prouve** les critères d'acceptation.

```java
@Container
@ServiceConnection
static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(
        DockerImageName.parse("postgis/postgis:16-3.4")
                .asCompatibleSubstituteFor("postgres"));
```

Trois subtilités empilées :

- **`asCompatibleSubstituteFor("postgres")`** — Testcontainers vérifie qu'on lui passe bien une image
  PostgreSQL. `postgis/postgis` n'étant pas `postgres`, il refuserait de démarrer. Cette clause dit « fais-moi
  confiance, c'est un PostgreSQL compatible ».
- **`@ServiceConnection`** — remplace le vieux bloc `@DynamicPropertySource` qui recopiait à la main URL,
  utilisateur et mot de passe. Spring Boot lit le conteneur et câble le `DataSource` tout seul.
- **`static`** — un seul conteneur pour toute la classe, pas un par test.

```java
@DynamicPropertySource
static void stripeProperties(DynamicPropertyRegistry registry) {
    registry.add("crenow.stripe.publishable-key", () -> "pk_test_it_key");
}
```

On fixe une valeur *connue* pour pouvoir affirmer l'égalité exacte. Le test ne vérifie pas « il y a une
chaîne » mais « c'est **cette** chaîne » — donc que la valeur traverse vraiment la configuration jusqu'au JSON.

```java
client = RestTestClient.bindToServer()
        .baseUrl("http://localhost:" + port + "/v1").build();
```

`RestTestClient` est le remplaçant de `TestRestTemplate`, **supprimé** de Spring Boot 4. Le `/v1` est ajouté
explicitement parce qu'on tape sur un vrai serveur HTTP sur un port aléatoire.

Puis les trois assertions, une par critère :

```java
// 1 — l'endpoint renvoie bien la clé configurée
.jsonPath("$.stripePublishableKey").isEqualTo("pk_test_it_key");

// 2 — springdoc sert une spec qui contient réellement /config
.contains("\"/config\"").contains("stripePublishableKey");

// 3 — Flyway a tourné ET PostGIS existe
"SELECT count(*) FROM flyway_schema_history WHERE version = '1'"   → 1
"SELECT count(*) FROM pg_extension WHERE extname = 'postgis'"      → 1
```

**La troisième est celle qui a payé.** Elle n'interroge pas Spring : elle interroge la base, en SQL, sur son
état réel. C'est ce qui a révélé que Flyway ne tournait pas alors que tout le reste était vert (§7).

---

## 3. Ce que la génération produit

Rien de ce qui suit n'est écrit ni versionné — `openapi.yaml` en est la seule source.

Depuis six lignes de contrat :

```yaml
Config:
  type: object
  required: [stripePublishableKey]
  properties:
    stripePublishableKey: { type: string }
```

le générateur produit `models/Config.ts` :

```ts
export interface Config {
    stripePublishableKey: string;
}

export function instanceOfConfig(value: object): value is Config { … }
export function ConfigFromJSON(json: any): Config { … }
export function ConfigToJSON(json: any): any { … }
```

Soit le type **plus** les fonctions de conversion JSON ↔ objet. Sur des schémas plus riches (dates, énums,
objets imbriqués), ce sont ces fonctions qui transforment un `string` ISO en `Date` — d'où les 5 189 lignes
totales pour un contrat qui en fait 872.

Et `apis/ConfigApi.ts` :

```ts
async getConfig(initOverrides?): Promise<Config> {
    const response = await this.getConfigRaw(initOverrides);
    return await response.value();
}
```

Le nom `getConfig` vient de l'`operationId`, le type de retour du schéma de réponse, le path du contrat. La
description en JSDoc est même reprise du champ `description` de la spec. **Aucun de ces éléments n'est
retapé** : renommer l'`operationId` renomme la méthode dans les deux apps.

---

## 4. L'orchestration

### `pnpm-workspace.yaml`

```yaml
packages: ["shared/openapi", "apps/*", "e2e"]
allowBuilds:
  '@openapitools/openapi-generator-cli': true
  cpu-features: false
  protobufjs: false
  ssh2: false
```

Le bloc `allowBuilds` est une protection de pnpm : par défaut, **aucun** paquet ne peut exécuter de script à
l'installation (vecteur classique d'attaque de chaîne d'approvisionnement). On autorise le générateur — il
télécharge son JAR — et on refuse les trois autres, qui sont des compilations natives pour Docker-over-SSH dont
on n'a pas l'usage.

### `turbo.json` — le graphe de dépendances des tâches

```json
"build":     { "dependsOn": ["^build", "generate"] },
"typecheck": { "dependsOn": ["^build", "generate"] },
"test":      { "dependsOn": ["^build", "generate"] }
```

Le `^` signifie « la tâche `build` de mes **dépendances** ». C'est ce qui garantit qu'on ne peut pas typechecker
le mobile contre un client périmé : Turbo régénère puis recompile `@crenow/api-client` avant. C'est la pièce
qui rend viable le fait de **ne pas versionner** le client.

### Le script de génération

```
openapi-generator-cli generate -i ./openapi.yaml -g typescript-fetch -o ./src/generated
  --additional-properties=supportsES6=true
  --openapi-normalizer KEEP_ONLY_FIRST_TAG_IN_OPERATION=true
```

Le `--openapi-normalizer` est le correctif décrit en §7. Il agit **en mémoire, au moment de générer** :
`openapi.yaml` n'est pas modifié.

---

## 5. Le test bout-en-bout

`e2e/src/globalSetup.ts` est le seul fichier qui orchestre les deux mondes. Il démarre PostGIS, lance le vrai
jar Spring Boot dessus, attend qu'il soit prêt, puis rend la main aux tests.

```ts
const postgres = await new PostgreSqlContainer("postgis/postgis:16-3.4").start();

const backend = spawn("java", ["-jar", locateBackendJar()], {
  env: {
    SERVER_PORT: String(BACKEND_PORT),
    DATABASE_URL: `jdbc:postgresql://${postgres.getHost()}:${postgres.getPort()}/${postgres.getDatabase()}`,
    …
  },
});
```

Les variables d'environnement sont exactement celles déclarées dans `application.yml`. Le test **valide donc
aussi la configuration par environnement** : si un nom de variable était faux, le backend démarrerait sur la
mauvaise base et échouerait.

Trois détails défensifs :

```ts
const jar = entries.find((f) => f.endsWith(".jar") && !f.endsWith("-plain.jar"));
```

Gradle produit deux jars ; `-plain.jar` ne contient pas les dépendances et ne démarre pas. On exclut
explicitement le piège.

```ts
backend.on("exit", () => { exited = true; });
while (Date.now() < deadline) {
  if (exited) throw new Error("Backend process exited before becoming healthy.");
  …
}
```

Si le backend meurt au démarrage, on échoue **immédiatement avec la vraie cause** au lieu d'attendre 150 s pour
annoncer un timeout trompeur.

```ts
if (process.env.CRENOW_BASE_URL) return;
```

Une porte de sortie : en CI, si un backend tourne déjà, on le réutilise au lieu d'en lancer un second.

Le test lui-même tient en quatre lignes utiles :

```ts
const api = new ConfigApi(new Configuration({ basePath: process.env.CRENOW_BASE_URL }));
const config = await api.getConfig();
expect(config.stripePublishableKey).toBe(process.env.CRENOW_EXPECTED_STRIPE_KEY);
```

Aucune URL, aucun `fetch`, aucun nom de champ écrit à la main : tout vient du client généré. **C'est
précisément ce qui fait de ce test la preuve du pipeline** et pas seulement de l'endpoint.

---

## 6. Le mobile

`apps/mobile/App.tsx`, réduit à l'essentiel :

```tsx
const apiBaseUrl =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? "http://localhost:8080/v1";

const configApi = new ConfigApi(new Configuration({ basePath: apiBaseUrl }));

const [config, setConfig] = useState<Config | null>(null);
useEffect(() => {
  configApi.getConfig().then(setConfig).catch(…);
}, []);
```

Le type `Config` est **importé du client généré**, pas redéclaré. C'est ce qui satisfait « consommable par
l'app mobile » de façon vérifiable : si le contrat perdait `stripePublishableKey`, `pnpm typecheck` casserait
ici. L'app gère les trois états (chargement, erreur, succès) — un écran qui n'affiche que le cas heureux ne
prouverait pas grand-chose.

---

## 7. Les deux corrections, en code

### Flyway ne tournait pas

```diff
- implementation("org.flywaydb:flyway-core")
+ implementation("org.springframework.boot:spring-boot-flyway")
```

Spring Boot 4 a sorti les auto-configurations de `spring-boot-autoconfigure` vers des modules dédiés. Avec
`flyway-core` seul, les classes Flyway sont présentes mais **rien ne les déclenche**.

Le symptôme est ce qui rend ce bug intéressant : l'application démarrait, `/config` répondait `200`, les tests
web passaient. Seule l'assertion SQL sur `flyway_schema_history` a vu que la migration n'avait jamais tourné —
et donc que PostGIS n'existait pas.

### La collision de noms dans le client

`searchSlots` est tagué `[Slots, Discovery]`. Le générateur émet alors l'opération dans **les deux** classes,
chacune exportant une interface `SearchSlotsRequest`, et le fichier barrel réexporte les deux :

```
error TS2308: Module './DiscoveryApi' has already exported a member named 'SearchSlotsRequest'.
```

Corrigé par `KEEP_ONLY_FIRST_TAG_IN_OPERATION=true`, qui ne garde que le premier tag (`Slots`) au moment de la
génération. **`openapi.yaml` n'a pas été modifié** : l'ADR 0013 traite le contrat comme durable, et le problème
appartenait à l'outil, pas au contrat.

> Arbitrage ouvert : si le contrat ne doit porter qu'un tag, c'est une ligne dans la spec et le normalizer saute.

---

## 8. Ce que le `.gitignore` dit du projet

```gitignore
shared/openapi/src/generated/   # dérivé d'openapi.yaml — jamais édité à la main
backend/build/                  # sortie Gradle
backend/bin/                    # sortie du serveur de langage Java de l'IDE
```

Le premier est le plus significatif : le client généré est un **artefact de build**, pas du source. On ne peut
donc pas le corriger à la main pour masquer un désaccord avec le contrat — la seule façon de changer le client
est de changer la spec. C'est ce qui donne sa force à « le contrat fait autorité ».

`backend/bin/` a été ajouté après coup : l'extension Java de VS Code y compile en parallèle de Gradle, et ces
`.class` s'étaient invités dans le dépôt.
