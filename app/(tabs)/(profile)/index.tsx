import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { EventSave, Reservation, Event, Club, Building } from "@/lib/types";
import { sortEventsByDateAndTime } from "@/lib/utils/events";
import * as store from "@/lib/api/store";
import { EventCard } from "@/components/cards/EventCard";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();
  const [saves, setSaves] = useState<EventSave[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      (async () => {
        const [s, r, e, c, b] = await Promise.all([
          store.getSaves(user.id),
          store.getReservations(user.id),
          store.getEvents(),
          store.getClubs(),
          store.getBuildings(),
        ]);
        setSaves(s);
        setReservations(r);
        setEvents(e);
        setClubs(c);
        setBuildings(b);
      })();
    }, [user])
  );

  if (!isAuthenticated) {
    return (
      <PageShell>
        <View style={[styles.center, { paddingTop: topInset }]}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to see your profile</Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      </PageShell>
    );
  }

  const savedEventIds = new Set(saves.map(s => s.eventId));
  const reservedEventIds = new Set(reservations.map(r => r.eventId));
  const savedEvents = sortEventsByDateAndTime(events.filter(e => savedEventIds.has(e.id)));
  const reservedEvents = sortEventsByDateAndTime(events.filter(e => reservedEventIds.has(e.id)));

  const getClub = (id: string) => clubs.find(c => c.id === id);
  const getBuilding = (id: string) => buildings.find(b => b.id === id);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await logout();
        },
      },
    ]);
  };

  const handleUnsave = async (eventId: string) => {
    if (!user) return;
    await store.unsaveEvent(user.id, eventId);
    setSaves(prev => prev.filter(s => s.eventId !== eventId));
  };

  return (
    <PageShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: topInset, paddingBottom: layout.tabBarHeight + 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Your BYUconnect home base</Text>
            <Text style={styles.headerSubtitle}>Saved plans, reservations, and account details stay easy to scan on every screen size.</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push("/(tabs)/(profile)/notifications")} hitSlop={10} style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.heroRow, layout.isDesktop && styles.heroRowDesktop]}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{savedEvents.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{reservedEvents.length}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
          </View>
        </View>

        {reservedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Reservations</Text>
            {reservedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                club={getClub(event.clubId)}
                building={getBuilding(event.buildingId)}
                compact
              />
            ))}
          </View>
        )}

        {savedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Events</Text>
            {savedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                club={getClub(event.clubId)}
                building={getBuilding(event.buildingId)}
                isSaved
                onSave={() => handleUnsave(event.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 23,
    maxWidth: 720,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  signInBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  signInText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  heroRow: {
    gap: 16,
    marginBottom: 24,
  },
  heroRowDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    flex: 1,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    padding: 16,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    flex: 1,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.borderLight,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.error,
  },
});
