import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Club, Category, Event, ClubMembership, Announcement, Building } from "@/lib/types";
import { sortEventsByDateAndTime } from "@/lib/utils/events";
import * as store from "@/lib/api/store";
import { EventCard } from "@/components/cards/EventCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function ClubProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [membership, setMembership] = useState<ClubMembership | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [c, cats, e, b, allClubs, ann] = await Promise.all([
        store.getClub(id),
        store.getCategories(),
        store.getEvents(),
        store.getBuildings(),
        store.getClubs(),
        store.getAnnouncements(id),
      ]);
      if (c) {
        setClub(c);
        setCategory(cats.find(cat => cat.id === c.categoryId) || null);
      }
      const now = new Date();
      setEvents(sortEventsByDateAndTime(e.filter(ev => ev.clubId === id && !ev.isCancelled && new Date(ev.endTime) > now)));
      setBuildings(b);
      setClubs(allClubs);
      setAnnouncements(ann);

      if (user) {
        const memberships = await store.getMemberships(user.id);
        setMembership(memberships.find(m => m.clubId === id) || null);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleJoin = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (membership) {
      Alert.alert("Leave Club", `Leave ${club?.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await store.leaveClub(user.id, id);
            setMembership(null);
            if (club) setClub({ ...club, memberCount: Math.max(0, club.memberCount - 1) });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]);
    } else {
      const m = await store.joinClub(user.id, id);
      setMembership(m);
      if (club) setClub({ ...club, memberCount: club.memberCount + 1 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getBuilding = (bid: string) => buildings.find(b => b.id === bid);
  const getClub = (cid: string) => clubs.find(c => c.id === cid);
  const isAdmin = membership?.role === "admin" || membership?.role === "president";

  if (loading || !club) {
    return (
      <PageShell>
        <View style={[styles.center, { paddingTop: topInset }]}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
          <Pressable onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/(tabs)/(home)"); } }} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </Pressable>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.light.accent} />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 60, paddingBottom: layout.tabBarHeight + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.clubHeader, layout.isDesktop && styles.clubHeaderDesktop]}>
            <View style={styles.coverContainer}>
              {club.coverImage ? (
                <Image source={{ uri: club.coverImage }} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image-outline" size={32} color={Colors.light.textTertiary} />
                </View>
              )}
              <Pressable
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled && result.assets[0]) {
                    const asset = result.assets[0];
                    const imageUri = asset.base64
                      ? `data:image/jpeg;base64,${asset.base64}`
                      : asset.uri;
                    setClub(prev => prev ? { ...prev, coverImage: imageUri } : prev);
                    try {
                      await store.updateClubCoverImage(club.id, imageUri);
                    } catch (e) {
                      console.warn("Failed to save cover image:", e);
                    }
                  }
                }}
                style={styles.editCoverBtn}
              >
                <Ionicons name="camera-outline" size={16} color="#fff" />
              </Pressable>
            </View>
            <View style={[styles.avatar, { backgroundColor: club.imageColor }]}>
              <Text style={styles.avatarText}>{club.name.charAt(0)}</Text>
            </View>
            <Text style={styles.clubName}>{club.name}</Text>
            {category && (
              <View style={styles.categoryBadge}>
                <MaterialIcons name={category.icon as any} size={14} color={Colors.light.accent} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            )}
            <Text style={styles.memberCount}>{club.memberCount} members</Text>

            <Pressable
              onPress={handleJoin}
              style={({ pressed }) => [
                styles.joinBtn,
                membership && styles.joinedBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Ionicons
                name={membership ? "checkmark-circle" : "add-circle-outline"}
                size={18}
                color={membership ? Colors.light.success : "#fff"}
              />
              <Text style={[styles.joinBtnText, membership && { color: Colors.light.success }]}>
                {membership ? (isAdmin ? "Admin" : "Joined") : "Join Club"}
              </Text>
            </Pressable>
          </View>

          <SegmentedControl
            segments={["About", "Activity", "Contact"]}
            selectedIndex={tab}
            onChange={setTab}
          />

          <View style={styles.tabContent}>
            {tab === 0 && (
              <View style={styles.aboutSection}>
                <Text style={styles.description}>{club.description}</Text>
              </View>
            )}

            {tab === 1 && (
              <View style={styles.activitySection}>
                {announcements.length > 0 && (
                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle}>Announcements</Text>
                    {announcements.map(a => (
                      <View key={a.id} style={styles.announcementCard}>
                        <Text style={styles.announcementTitle}>{a.title}</Text>
                        <Text style={styles.announcementBody}>{a.body}</Text>
                        <Text style={styles.announcementDate}>
                          {new Date(a.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>Upcoming Events</Text>
                  {events.length > 0 ? (
                    events.map(e => (
                      <EventCard
                        key={e.id}
                        event={e}
                        club={getClub(e.clubId)}
                        building={getBuilding(e.buildingId)}
                        compact
                      />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No upcoming events</Text>
                  )}
                </View>
              </View>
            )}

            {tab === 2 && (
              <View style={styles.contactSection}>
                {club.contactEmail && (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Ionicons name="mail-outline" size={18} color={Colors.light.accent} />
                    </View>
                    <Text style={styles.contactValue}>{club.contactEmail}</Text>
                  </View>
                )}
                {club.website && (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Ionicons name="globe-outline" size={18} color={Colors.light.accent} />
                    </View>
                    <Text style={styles.contactValue}>{club.website}</Text>
                  </View>
                )}
                {club.instagram && (
                  <View style={styles.contactRow}>
                    <View style={styles.contactIcon}>
                      <Ionicons name="logo-instagram" size={18} color={Colors.light.accent} />
                    </View>
                    <Text style={styles.contactValue}>{club.instagram}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adminText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.accent,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  clubHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  clubHeaderDesktop: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  clubName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.accent,
  },
  memberCount: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  joinedBtn: {
    backgroundColor: Colors.light.success + "15",
  },
  joinBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  tabContent: {
    paddingTop: 20,
  },
  aboutSection: {},
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  activitySection: { gap: 24 },
  subsection: {},
  subsectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  announcementCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  announcementTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  announcementBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  announcementDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    textAlign: "center",
    paddingVertical: 20,
  },
  contactSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  contactValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    flex: 1,
  },
  coverContainer: {
    width: "100%" as const,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  coverImage: {
    width: "100%" as const,
    height: 180,
    borderRadius: 16,
  },
  coverPlaceholder: {
    width: "100%" as const,
    height: 140,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  editCoverBtn: {
    position: "absolute" as const,
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});
