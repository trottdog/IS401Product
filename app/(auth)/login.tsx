import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import Colors from "@/lib/theme/colors";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function LoginScreen() {
  const { login } = useAuth();
  const layout = useResponsiveLayout();
  const [email, setEmail] = useState("student@byu.edu");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.dismissAll();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <View style={[styles.container, Platform.OS === "web" && styles.containerWeb]}>
        <View style={[styles.brandPanel, layout.isDesktop && styles.brandPanelDesktop]}>
          <Text style={styles.brandEyebrow}>Campus clubs</Text>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.titleBrand}>BYUconnect</Text>
          <Text style={styles.subtitle}>Sign in to discover campus events, organizations, and opportunities from a layout that works just as well on your phone as it does in a browser.</Text>
        </View>

        <View style={[styles.content, layout.isDesktop && styles.contentDesktop]}>
          <View style={styles.formCard}>
            <View style={styles.header}>
              <Text style={styles.formTitle}>Sign in</Text>
              <Text style={styles.formSubtitle}>Use your BYU email to continue.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@byu.edu"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  loading && { opacity: 0.7 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", gap: 24, paddingVertical: 24 },
  containerWeb: { flexDirection: "row" },
  brandPanel: { paddingTop: 32, paddingRight: 8 },
  brandPanelDesktop: { flex: 1, justifyContent: "center", paddingRight: 36 },
  brandEyebrow: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.light.accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 },
  content: { justifyContent: "center" },
  contentDesktop: { width: 440 },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 34,
    elevation: 3,
  },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  titleBrand: { fontSize: 36, fontFamily: "Inter_700Bold", color: Colors.light.tint, marginTop: 4 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 8, lineHeight: 23, maxWidth: 520 },
  formTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.light.text },
  formSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 8 },
  form: { gap: 20 },
  inputWrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  input: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  button: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: "center" as const,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  link: { color: Colors.light.accent, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    paddingTop: 24,
    gap: 4,
  },
  footerText: { color: Colors.light.textSecondary, fontSize: 14, fontFamily: "Inter_400Regular" },
});
