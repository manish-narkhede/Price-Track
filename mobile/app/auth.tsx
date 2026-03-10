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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {auth} from "../src/lib/firebase";
import {useAuth} from "../src/context/AuthContext";
import {useRouter} from "expo-router";

export default function AuthScreen() {
  const {user} = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  if (user) {
    return (
      <View style={styles.signedIn}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.signedInLabel}>Signed in</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === "login" ? "signup" : "login")}>
          <Text style={styles.switchText}>
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f9fafb"},
  scroll: {padding: 24, paddingTop: 60},
  title: {fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 28, textAlign: "center"},
  input: {
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
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  buttonDisabled: {backgroundColor: "#93c5fd"},
  buttonText: {color: "#fff", fontSize: 16, fontWeight: "700"},
  switchText: {color: "#2563eb", textAlign: "center", fontSize: 14},
  signedIn: {flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb"},
  avatar: {fontSize: 64, marginBottom: 12},
  email: {fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4},
  signedInLabel: {fontSize: 14, color: "#6b7280", marginBottom: 28},
  signOutBtn: {
    borderWidth: 1.5,
    borderColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signOutText: {color: "#ef4444", fontSize: 15, fontWeight: "600"},
});
