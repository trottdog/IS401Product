import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import Colors from "@/lib/theme/colors";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function RegisterScreen() {
  const { register } = useAuth();
  const layout = useResponsiveLayout();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const success = await register(name.trim(), email.trim(), password);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.dismissAll();
      } else {
        Alert.alert("Error", "Could not create account");
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
          <Text style={styles.brandEyebrow}>Get connected</Text>
          <Text style={styles.title}>Join BYUconnect</Text>
          <Text style={styles.subtitle}>Create your account to start finding clubs, reserving events, and keeping up with what is happening across campus.</Text>
        </View>

        <View style={[styles.content, layout.isDesktop && styles.contentDesktop]}>
          <View style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

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
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Pressable
                onPress={handleRegister}
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
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </Pressable>
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
  contentDesktop: { width: 460 },
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
  title: { fontSize: 32, fontFamily: "Inter_700Bold", color: Colors.light.tint },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, marginTop: 8, lineHeight: 23, maxWidth: 520 },
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
});
