import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { ConfigApi, Configuration, type Config } from "@crenow/api-client";

// Base URL comes from app config (app.json `extra.apiBaseUrl`); no secrets baked into the app.
const apiBaseUrl =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? "http://localhost:8080/v1";

const configApi = new ConfigApi(new Configuration({ basePath: apiBaseUrl }));

/**
 * Walking-skeleton screen: fetches public client config through the generated @crenow/api-client
 * and shows the Stripe publishable key — proving the OpenAPI→TS pipeline is consumable by the app.
 */
export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    configApi
      .getConfig()
      .then(setConfig)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crenow</Text>
      {error ? (
        <Text style={styles.error}>Could not load config: {error}</Text>
      ) : config ? (
        <Text style={styles.key}>Stripe key: {config.stripePublishableKey}</Text>
      ) : (
        <ActivityIndicator />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: "600" },
  key: { fontSize: 14, color: "#333" },
  error: { fontSize: 14, color: "#b00020", textAlign: "center" },
});
