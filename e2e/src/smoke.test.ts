import { describe, expect, it } from "vitest";
import { Configuration, ConfigApi } from "@crenow/api-client";

/**
 * The tracer request travels the whole chain through the *generated* client:
 * generated ConfigApi -> HTTP -> running Spring Boot -> GET /config (backed by real Postgres+PostGIS).
 * Proves the OpenAPI -> TS pipeline produces a client the apps can actually call.
 */
describe("GET /config through the generated client", () => {
  it("returns the configured Stripe publishable key", async () => {
    const api = new ConfigApi(new Configuration({ basePath: process.env.CRENOW_BASE_URL }));

    const config = await api.getConfig();

    expect(config.stripePublishableKey).toBeTruthy();
    expect(config.stripePublishableKey).toBe(process.env.CRENOW_EXPECTED_STRIPE_KEY);
  });
});
