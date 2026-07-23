package com.crenow.config;

import com.crenow.config.dto.ConfigResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public tracer endpoint {@code GET /config} (no auth) — the thinnest full-path request that
 * proves the build chain, DB connection, spec pipeline and client generation end-to-end.
 *
 * <p>Returns the Stripe publishable key from server-side configuration rather than a hardcoded
 * app constant, so the key can rotate and switch between test and live without shipping a new
 * build.</p>
 */
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
