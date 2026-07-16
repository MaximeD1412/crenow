package com.crenow.config.dto;

/**
 * Public client configuration ({@code Config} schema in the OpenAPI contract).
 *
 * <p>Carries non-secret constants the mobile/web clients need at runtime — currently the Stripe
 * publishable key. Served so the key is never frozen into the app bundles (rotation, test↔live
 * switch). The domain term is {@code Config} (see CONTEXT.md § FR→EN).</p>
 */
public record ConfigResponse(String stripePublishableKey) {
}
