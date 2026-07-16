package com.crenow.config;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * End-to-end walking-skeleton test: the app boots against a real PostgreSQL+PostGIS,
 * Flyway runs the baseline migration, and the public {@code GET /config} tracer returns
 * the configured Stripe publishable key. This is the backend-side proof of the full path;
 * the Node E2E ({@code e2e/}) proves the same endpoint through the generated TS client.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ConfigEndpointIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:16-3.4")
                    .asCompatibleSubstituteFor("postgres"));

    @DynamicPropertySource
    static void stripeProperties(DynamicPropertyRegistry registry) {
        registry.add("crenow.stripe.publishable-key", () -> "pk_test_it_key");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private DataSource dataSource;

    private RestTestClient client;

    @BeforeEach
    void setUp() {
        // context-path is /v1 (matches the OpenAPI `servers` url), so the app root is host:port/v1.
        client = RestTestClient.bindToServer().baseUrl("http://localhost:" + port + "/v1").build();
    }

    @Test
    void getConfigReturnsStripePublishableKey() {
        client.get().uri("/config").exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.stripePublishableKey").isEqualTo("pk_test_it_key");
    }

    @Test
    void springdocServesSpecIncludingConfigPath() {
        client.get().uri("/v3/api-docs").exchange()
                .expectStatus().isOk()
                .expectBody(String.class)
                .value(body -> assertThat(body)
                        .contains("\"/config\"")
                        .contains("stripePublishableKey"));
    }

    @Test
    void flywayRanAndPostgisIsEnabled() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        Integer baselineApplied = jdbc.queryForObject(
                "SELECT count(*) FROM flyway_schema_history WHERE version = '1'", Integer.class);
        assertThat(baselineApplied).isEqualTo(1);

        Integer postgisInstalled = jdbc.queryForObject(
                "SELECT count(*) FROM pg_extension WHERE extname = 'postgis'", Integer.class);
        assertThat(postgisInstalled).isEqualTo(1);
    }
}
