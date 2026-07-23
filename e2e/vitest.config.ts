import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./src/globalSetup.ts"],
    // Booting a Postgres container + the Spring Boot jar takes a while on a cold start.
    hookTimeout: 180_000,
    testTimeout: 30_000,
  },
});
