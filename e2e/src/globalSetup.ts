import { spawn, type ChildProcess } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";

const HERE = dirname(fileURLToPath(import.meta.url));
const BACKEND_LIBS = resolve(HERE, "../../backend/build/libs");
const BACKEND_PORT = 18080;
const BASE_URL = `http://localhost:${BACKEND_PORT}/v1`;
const STRIPE_KEY = "pk_test_e2e_key";

/**
 * Boots the full walking-skeleton stack for the Node E2E:
 *   PostGIS container -> Spring Boot jar (Flyway migrates) -> ready to serve /config.
 *
 * If CRENOW_BASE_URL is already set (e.g. a backend running in CI), we reuse it and skip
 * provisioning. Requires Docker for the Postgres container and a pre-built bootJar
 * (the `pretest` script runs `./gradlew bootJar`).
 */
export default async function setup() {
  if (process.env.CRENOW_BASE_URL) {
    return; // Externally provided backend; nothing to provision or tear down.
  }

  const postgres: StartedPostgreSqlContainer = await new PostgreSqlContainer("postgis/postgis:16-3.4").start();

  const backend = spawn("java", ["-jar", locateBackendJar()], {
    env: {
      ...process.env,
      SERVER_PORT: String(BACKEND_PORT),
      DATABASE_URL: `jdbc:postgresql://${postgres.getHost()}:${postgres.getPort()}/${postgres.getDatabase()}`,
      DATABASE_USERNAME: postgres.getUsername(),
      DATABASE_PASSWORD: postgres.getPassword(),
      STRIPE_PUBLISHABLE_KEY: STRIPE_KEY,
    },
    stdio: "inherit",
  });

  try {
    await waitForHealth(`${BASE_URL}/actuator/health`, backend);
  } catch (err) {
    backend.kill("SIGKILL");
    await postgres.stop();
    throw err;
  }

  process.env.CRENOW_BASE_URL = BASE_URL;
  process.env.CRENOW_EXPECTED_STRIPE_KEY = STRIPE_KEY;

  return async () => {
    backend.kill("SIGTERM");
    await postgres.stop();
  };
}

function locateBackendJar(): string {
  let entries: string[];
  try {
    entries = readdirSync(BACKEND_LIBS);
  } catch {
    throw new Error(`Backend jar dir not found at ${BACKEND_LIBS}. Run \`./gradlew bootJar\` in backend/ first.`);
  }
  const jar = entries.find((f) => f.endsWith(".jar") && !f.endsWith("-plain.jar"));
  if (!jar) {
    throw new Error(`No bootable jar in ${BACKEND_LIBS}. Run \`./gradlew bootJar\` in backend/ first.`);
  }
  return resolve(BACKEND_LIBS, jar);
}

async function waitForHealth(healthUrl: string, backend: ChildProcess): Promise<void> {
  const deadline = Date.now() + 150_000;
  let exited = false;
  backend.on("exit", (code) => {
    exited = true;
    if (code !== 0 && code !== null) {
      // Surfaced by the timeout below with context; keep the flag for the loop.
    }
  });

  while (Date.now() < deadline) {
    if (exited) {
      throw new Error("Backend process exited before becoming healthy.");
    }
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        const body = (await res.json()) as { status?: string };
        if (body.status === "UP") {
          return;
        }
      }
    } catch {
      // Not up yet; retry.
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`Backend did not report healthy at ${healthUrl} within timeout.`);
}
