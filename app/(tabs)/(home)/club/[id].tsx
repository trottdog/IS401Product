import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
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
  const route = useLocalSearchParams<{ id: string | string[] }>();
  const clubPageId = route.id
    ? (Array.isArray(route.id) ? route.id[0] : route.id)
    : undefined;
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [savingClub, setSavingClub] = useState(false);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  useEffect(() => {
    (async () => {
      if (!clubPageId) return;
      const [c, cats, e, b, allClubs, ann] = await Promise.all([
        store.getClub(clubPageId),
        store.getCategories(),
        store.getEvents(),
        store.getBuildings(),
        store.getClubs(),
        store.getAnnouncements(clubPageId),
      ]);
      if (c) {
        setClub(c);
        setCategory(cats.find(cat => cat.id === c.categoryId) || null);
      }
      const now = new Date();
      setEvents(sortEventsByDateAndTime(e.filter(ev => ev.clubId === clubPageId && !ev.isCancelled && new Date(ev.endTime) > now)));
      setBuildings(b);
      setClubs(allClubs);
      setAnnouncements(ann);

      if (user) {
        const memberships = await store.getMemberships(user.id);
        setMembership(memberships.find(m => m.clubId === clubPageId) || null);
      }
      setLoading(false);
    })();
  }, [clubPageId, user]);

  const handleJoin = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (!clubPageId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (membership) {
      Alert.alert("Leave Club", `Leave ${club?.name}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await store.leaveClub(user.id, clubPageId);
            setMembership(null);
            if (club) setClub({ ...club, memberCount: Math.max(0, club.memberCount - 1) });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]);
    } else {
      const m = await store.joinClub(user.id, clubPageId);
      setMembership(m);
      if (club) setClub({ ...club, memberCount: club.memberCount + 1 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getBuilding = (bid: string) => buildings.find(b => b.id === bid);
  const getClub = (cid: string) => clubs.find(c => c.id === cid);
  const isAdmin = membership?.role === "admin" || membership?.role === "president";

  const openEditModal = () => {
    if (!club) return;
    setEditName(club.name);
    setEditDescription(club.description);
    setEditContactEmail(club.contactEmail);
    setEditWebsite(club.website);
    setEditInstagram(club.instagram);
    setEditModalOpen(true);
  };

  const saveClubDetails = async () => {
    if (!club || !clubPageId) return;
    setSavingClub(true);
    try {
      const updated = await store.updateClubDetails(clubPageId, {
        name: editName.trim(),
        description: editDescription.trim(),
        contactEmail: editContactEmail.trim(),
        website: editWebsite.trim(),
        instagram: editInstagram.trim(),
      });
      setClub({
        ...club,
        name: updated.name,
        description: updated.description,
        contactEmail: updated.contactEmail,
        website: updated.website,
        instagram: updated.instagram,
        profileImage: updated.profileImage,
        coverImage: updated.coverImage,
      });
      setEditModalOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Could not save", e?.message || "Try again.");
    } finally {
      setSavingClub(false);
    }
  };

  const pickProfileImage = async () => {
    if (!club || !isAdmin) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const imageUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setClub(prev => (prev ? { ...prev, profileImage: imageUri } : prev));
      try {
        await store.updateClubProfileImage(club.id, imageUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.warn("Failed to save profile image:", e);
        Alert.alert("Could not save", "Profile image was not updated.");
      }
    }
  };

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
              {isAdmin && (
                <Pressable
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
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
                      setClub(prev => (prev ? { ...prev, coverImage: imageUri } : prev));
                      try {
                        await store.updateClubCoverImage(club.id, imageUri);
                      } catch (e) {
                        console.warn("Failed to save cover image:", e);
                        Alert.alert("Could not save", "Cover image was not updated.");
                      }
                    }
                  }}
                  style={styles.editCoverBtn}
                >
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => {
                if (isAdmin) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  pickProfileImage();
                }
              }}
              disabled={!isAdmin}
              style={[styles.avatar, { backgroundColor: club.imageColor }]}
            >
              {club.profileImage ? (
                <Image source={{ uri: club.profileImage }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{club.name.charAt(0)}</Text>
              )}
              {isAdmin && (
                <View style={styles.avatarEditHint}>
                  <Ionicons name="camera-outline" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
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

            {isAdmin && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  openEditModal();
                }}
                style={styles.editDetailsBtn}
              >
                <Ionicons name="create-outline" size={18} color={Colors.light.tint} />
                <Text style={styles.editDetailsBtnText}>Edit club details</Text>
              </Pressable>
            )}

            {isAdmin && clubPageId && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/(tabs)/(home)/create-event",
                    params: { clubId: clubPageId },
                  });
                }}
                style={styles.addEventBtn}
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.addEventBtnText}>Add event</Text>
              </Pressable>
            )}
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
                      <View key={e.id} style={styles.eventRow}>
                        <View style={styles.eventCardFlex}>
                          <EventCard
                            event={e}
                            club={getClub(e.clubId)}
                            building={getBuilding(e.buildingId)}
                            compact
                          />
                        </View>
                        {isAdmin && (
                          <Pressable
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              router.push({
                                pathname: "/(tabs)/(home)/create-event",
                                params: { eventId: e.id },
                              });
                            }}
                            style={styles.editEventBtn}
                            hitSlop={8}
                          >
                            <Ionicons name="pencil" size={18} color={Colors.light.tint} />
                            <Text style={styles.editEventBtnText}>Edit</Text>
                          </Pressable>
                        )}
                      </View>
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

      <Modal visible={editModalOpen} animationType="slide" transparent onRequestClose={() => setEditModalOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditModalOpen(false)} accessibilityLabel="Close" />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit club</Text>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Club name"
                placeholderTextColor={Colors.light.textTertiary}
              />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="About the club"
                placeholderTextColor={Colors.light.textTertiary}
                multiline
              />
              <Text style={styles.inputLabel}>Contact email</Text>
              <TextInput
                style={styles.textInput}
                value={editContactEmail}
                onChangeText={setEditContactEmail}
                placeholder="email@byu.edu"
                placeholderTextColor={Colors.light.textTertiary}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                value={editWebsite}
                onChangeText={setEditWebsite}
                placeholder="example.com"
                placeholderTextColor={Colors.light.textTertiary}
                autoCapitalize="none"
              />
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.textInput}
                value={editInstagram}
                onChangeText={setEditInstagram}
                placeholder="@handle"
                placeholderTextColor={Colors.light.textTertiary}
                autoCapitalize="none"
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditModalOpen(false)}
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                disabled={savingClub}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveClubDetails}
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                disabled={savingClub || !editName.trim() || !editDescription.trim()}
              >
                {savingClub ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnPrimaryText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  avatarEditHint: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
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
  editDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  editDetailsBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  addEventBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    alignSelf: "stretch",
  },
  addEventBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  eventCardFlex: {
    flex: 1,
    minWidth: 0,
  },
  editEventBtn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  editEventBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
    marginTop: 2,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalKeyboard: {
    width: "100%" as const,
  },
  modalCard: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 10 : 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSecondary: {
    backgroundColor: Colors.light.surfaceSecondary,
  },
  modalBtnSecondaryText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.light.tint,
  },
  modalBtnPrimaryText: {
    fontSize: 16,
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
