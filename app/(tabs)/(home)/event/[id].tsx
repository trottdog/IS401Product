import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Platform, Share, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Event, Club, Building, Category, getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import * as store from "@/lib/api/store";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [loading, setLoading] = useState(true);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [e, clubs, buildings, categories] = await Promise.all([
        store.getEvent(id),
        store.getClubs(),
        store.getBuildings(),
        store.getCategories(),
      ]);
      if (e) {
        setEvent(e);
        setClub(clubs.find(c => c.id === e.clubId) || null);
        setBuilding(buildings.find(b => b.id === e.buildingId) || null);
        setCategory(categories.find(c => c.id === e.categoryId) || null);
      }
      if (user) {
        const [saves, reservations] = await Promise.all([
          store.getSaves(user.id),
          store.getReservations(user.id),
        ]);
        setIsSaved(saves.some(s => s.eventId === id));
        setIsReserved(reservations.some(r => r.eventId === id));
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading || !event) {
    return (
      <PageShell>
        <View style={[styles.center, { paddingTop: topInset }]}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </PageShell>
    );
  }

  const timeLabel = getTimeLabel(event.startTime, event.endTime);
  const timeLabelColor = getTimeLabelColor(timeLabel);
  const spotsLeft = event.maxCapacity ? event.maxCapacity - event.currentReservations : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const handleSave = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSaved) {
      await store.unsaveEvent(user.id, event.id);
      setIsSaved(false);
    } else {
      await store.saveEvent(user.id, event.id);
      setIsSaved(true);
    }
  };

  const handleReserve = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (isReserved) {
      if (Platform.OS === "web") {
        if (window.confirm("Cancel your reservation?")) {
          await store.cancelReservation(user.id, event.id);
          setIsReserved(false);
          setEvent(prev => prev ? { ...prev, currentReservations: prev.currentReservations - 1 } : prev);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert("Cancel Reservation", "Are you sure you want to cancel?", [
          { text: "Keep", style: "cancel" },
          {
            text: "Cancel",
            style: "destructive",
            onPress: async () => {
              await store.cancelReservation(user.id, event.id);
              setIsReserved(false);
              setEvent(prev => prev ? { ...prev, currentReservations: prev.currentReservations - 1 } : prev);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]);
      }
      return;
    }
    if (isFull) {
      Alert.alert("Full", "This event is at capacity");
      return;
    }
    const res = await store.makeReservation(user.id, event.id);
    if (res) {
      setIsReserved(true);
      setEvent(prev => prev ? { ...prev, currentReservations: prev.currentReservations + 1 } : prev);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out "${event.title}" at BYU! ${building?.name || ""}` });
    } catch {}
  };

  return (
    <PageShell>
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
          <Pressable onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/(tabs)/(home)"); } }} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
          </Pressable>
          <View style={styles.topBarActions}>
            {isAdmin && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/(tabs)/(home)/create-event",
                    params: { clubId: event.clubId, eventId: event.id },
                  });
                }}
                hitSlop={12}
              >
                <Ionicons name="pencil-outline" size={24} color={Colors.light.text} />
              </Pressable>
            )}
            <Pressable onPress={handleSave} hitSlop={12}>
              <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={isSaved ? Colors.light.tint : Colors.light.text} />
            </Pressable>
            <Pressable onPress={handleShare} hitSlop={12}>
              <Ionicons name="share-outline" size={24} color={Colors.light.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 60, paddingBottom: layout.tabBarHeight + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.coverContainer}>
            {event.coverImage ? (
              <Image source={{ uri: event.coverImage }} style={styles.coverImage} resizeMode="cover" />
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
                  setEvent(prev => prev ? { ...prev, coverImage: imageUri } : prev);
                  try {
                    await store.updateEventCoverImage(event.id, imageUri);
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

          <View style={[styles.timeBadge, { backgroundColor: timeLabelColor + "18" }]}>
            <Text style={[styles.timeBadgeText, { color: timeLabelColor }]}>{timeLabel}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          {club && (
            <Pressable
              onPress={() => router.push({ pathname: "/(tabs)/(home)/club/[id]", params: { id: club.id } })}
              style={styles.clubRow}
            >
              <View style={[styles.clubDot, { backgroundColor: club.imageColor }]} />
              <Text style={styles.clubName}>{club.name}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.textTertiary} />
            </Pressable>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color={Colors.light.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{formatEventDate(event.startTime)}</Text>
                <Text style={styles.infoValue}>{formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</Text>
              </View>
            </View>

            {building && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={20} color={Colors.light.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{building.name}</Text>
                  <Text style={styles.infoValue}>Room {event.room}</Text>
                </View>
              </View>
            )}

            {category && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialIcons name={category.icon as any} size={20} color={Colors.light.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{category.name}</Text>
                </View>
              </View>
            )}

            {event.hasFood && event.foodDescription && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialIcons name="restaurant" size={20} color={Colors.light.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{event.foodDescription}</Text>
                </View>
              </View>
            )}
          </View>

          {event.hasLimitedCapacity && event.maxCapacity && (
            <View style={styles.capacityCard}>
              <View style={styles.capacityHeader}>
                <Text style={styles.capacityTitle}>Capacity</Text>
                <Text style={[styles.capacityCount, isFull && { color: Colors.light.error }]}>
                  {event.currentReservations}/{event.maxCapacity}
                </Text>
              </View>
              <View style={styles.capacityBarBg}>
                <View
                  style={[
                    styles.capacityBarFill,
                    {
                      width: `${(event.currentReservations / event.maxCapacity) * 100}%`,
                      backgroundColor: isFull ? Colors.light.error : Colors.light.accent,
                    },
                  ]}
                />
              </View>
              {spotsLeft !== null && (
                <Text style={[styles.spotsText, isFull && { color: Colors.light.error }]}>
                  {isFull ? "No spots available" : `${spotsLeft} spots remaining`}
                </Text>
              )}
            </View>
          )}

          <View style={styles.descSection}>
            <Text style={styles.descTitle}>About</Text>
            <Text style={styles.descText}>{event.description}</Text>
          </View>

          {event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              {event.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

        </ScrollView>

        <View style={[styles.bottomBar, { bottom: Platform.OS === "web" ? 84 : 49 + bottomInset, paddingBottom: 12 }]}>
          {event.hasLimitedCapacity ? (
            <Pressable
              onPress={handleReserve}
              disabled={isFull && !isReserved}
              style={({ pressed }) => [
                styles.primaryBtn,
                isReserved && styles.reservedBtn,
                isFull && !isReserved && styles.disabledBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Ionicons
                name={isReserved ? "checkmark-circle" : "ticket-outline"}
                size={20}
                color={isReserved ? Colors.light.success : "#fff"}
              />
              <Text style={[styles.primaryBtnText, isReserved && { color: Colors.light.success }]}>
                {isReserved ? "Reserved" : isFull ? "Full" : "Reserve Spot"}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.noReservation}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.light.success} />
              <Text style={styles.noReservationText}>Open event - no reservation needed</Text>
            </View>
          )}
        </View>
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
  topBarActions: {
    flexDirection: "row",
    gap: 16,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  timeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  timeBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 32,
    marginBottom: 12,
  },
  clubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  clubDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  clubName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.accent,
    flex: 1,
  },
  infoSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    padding: 16,
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1, gap: 1 },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  capacityCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  capacityTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  capacityCount: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  capacityBarBg: {
    height: 6,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  capacityBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  spotsText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  descSection: {
    marginBottom: 20,
  },
  descTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  descText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  tagsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 0,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.borderLight,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
  },
  reservedBtn: {
    backgroundColor: Colors.light.success + "15",
  },
  disabledBtn: {
    backgroundColor: Colors.light.textTertiary,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  noReservation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
  },
  noReservationText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.success,
  },
  coverContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  coverImage: {
    width: "100%" as const,
    height: 200,
    borderRadius: 16,
  },
  coverPlaceholder: {
    width: "100%" as const,
    height: 160,
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
