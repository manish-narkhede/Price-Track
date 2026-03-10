import React, {useState} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {useRouter} from "expo-router";
import {trackProduct} from "../src/lib/api";
import {useAuth} from "../src/context/AuthContext";

export default function HomeScreen() {
  const {user} = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (!user) {
      router.push("/auth");
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a product URL.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      Alert.alert("Error", "Please enter a valid URL starting with http:// or https://");
      return;
    }
    setLoading(true);
    try {
      const result = await trackProduct(trimmed);
      router.push(`/product/${result.productId}`);
    } catch {
      Alert.alert("Error", "Failed to fetch product. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Track Any Product Price</Text>
        <Text style={styles.subheading}>
          Paste an Amazon or Flipkart URL to view price history and get drop alerts.
        </Text>

        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://www.amazon.in/dp/B0..."
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleTrack}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Loading…" : "Track Price"}</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          {[
            {icon: "📈", title: "Price History", desc: "View historical price charts."},
            {icon: "🔔", title: "Drop Alerts", desc: "Get notified when price falls."},
            {icon: "🛒", title: "Best Time to Buy", desc: "See the all-time lowest price."},
          ].map(({icon, title, desc}) => (
            <View key={title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f9fafb"},
  scroll: {paddingHorizontal: 20, paddingVertical: 32, alignItems: "center"},
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 320,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 36,
  },
  buttonDisabled: {backgroundColor: "#93c5fd"},
  buttonText: {color: "#fff", fontSize: 16, fontWeight: "700"},
  features: {flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center"},
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    width: 155,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  featureIcon: {fontSize: 28, marginBottom: 8},
  featureTitle: {fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 4, textAlign: "center"},
  featureDesc: {fontSize: 12, color: "#6b7280", textAlign: "center"},
});
