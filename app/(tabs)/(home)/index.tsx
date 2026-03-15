import React, { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Platform, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Event, Club, Building, EventSave, getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import { sortEventsByDateAndTime } from "@/lib/utils/events";
import * as store from "@/lib/api/store";
import { EventCard } from "@/components/cards/EventCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MapViewWrapper } from "@/components/map/MapViewWrapper";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

const BYU_REGION = {
  latitude: 40.2502,
  longitude: -111.6493,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [saves, setSaves] = useState<EventSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [showBuildingSheet, setShowBuildingSheet] = useState(false);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  const loadData = useCallback(async () => {
    await store.initializeStore();
    const [e, c, b] = await Promise.all([
      store.getEvents(),
      store.getClubs(),
      store.getBuildings(),
    ]);
    if (user) {
      const s = await store.getSaves(user.id);
      setSaves(s);
    }
    setEvents(e);
    setClubs(c);
    setBuildings(b);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const sortedEvents = useMemo(() => {
    const now = new Date();
    const filtered = events.filter(e => !e.isCancelled && new Date(e.endTime) > now);
    const happeningNow = filtered.filter(e => now >= new Date(e.startTime) && now <= new Date(e.endTime));
    const rest = filtered.filter(e => !(now >= new Date(e.startTime) && now <= new Date(e.endTime)));
    return [...happeningNow, ...sortEventsByDateAndTime(rest)];
  }, [events]);

  const buildingEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();
    events.forEach(e => {
      if (!e.isCancelled && new Date(e.endTime) > now) {
        counts[e.buildingId] = (counts[e.buildingId] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  const buildingEvents = useMemo(() => {
    if (!selectedBuilding) return [];
    const now = new Date();
    const list = sortedEvents.filter(e => e.buildingId === selectedBuilding && new Date(e.endTime) > now);
    return sortEventsByDateAndTime(list);
  }, [selectedBuilding, sortedEvents]);

  const getClub = (id: string) => clubs.find(c => c.id === id);
  const getBuilding = (id: string) => buildings.find(b => b.id === id);
  const savedIds = new Set(saves.map(s => s.eventId));

  const handleSave = async (eventId: string) => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (savedIds.has(eventId)) {
      await store.unsaveEvent(user.id, eventId);
      setSaves(prev => prev.filter(s => s.eventId !== eventId));
    } else {
      const s = await store.saveEvent(user.id, eventId);
      setSaves(prev => [...prev, s]);
    }
  };

  const handleMarkerPress = (buildingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBuilding(buildingId);
    setShowBuildingSheet(true);
  };

  const mapMarkers = useMemo(() => {
    return buildings
      .filter(b => (buildingEventCounts[b.id] || 0) > 0)
      .map(b => ({
        id: b.id,
        latitude: b.latitude,
        longitude: b.longitude,
        count: buildingEventCounts[b.id] || 0,
        label: b.abbreviation,
      }));
  }, [buildings, buildingEventCounts]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: topInset }]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const renderMapContent = () => (
    <View style={[styles.mapContainer, layout.isDesktop && styles.mapContainerDesktop]}>
      <View style={[styles.mapFrame, layout.isDesktop && styles.mapFrameDesktop]}>
        <MapViewWrapper
          initialRegion={BYU_REGION}
          markers={mapMarkers}
          onMarkerPress={handleMarkerPress}
        />
      </View>

      {(showBuildingSheet || layout.isDesktop) && (
        <View style={[styles.bottomSheet, layout.isDesktop && styles.sidePanel]}>
          {!layout.isDesktop && <View style={styles.sheetHandle} />}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Ionicons name="location" size={18} color={Colors.light.tint} />
              <Text style={styles.sheetTitle}>
                {selectedBuilding ? getBuilding(selectedBuilding)?.name : "Select a building"}
              </Text>
            </View>
            {selectedBuilding && !layout.isDesktop && (
              <Pressable onPress={() => setShowBuildingSheet(false)} hitSlop={12}>
                <Ionicons name="close-circle" size={26} color={Colors.light.textTertiary} />
              </Pressable>
            )}
          </View>
          <Text style={styles.sheetSubtitle}>
            {selectedBuilding
              ? `${buildingEvents.length} upcoming event${buildingEvents.length !== 1 ? "s" : ""}`
              : "Tap a building pin to preview what is happening there"}
          </Text>
          <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
            {!selectedBuilding ? (
              <Text style={styles.sheetEmpty}>Choose a building marker to view events at that location.</Text>
            ) : buildingEvents.length === 0 ? (
              <Text style={styles.sheetEmpty}>No upcoming events at this location</Text>
            ) : (
              buildingEvents.map((evt) => {
                const club = getClub(evt.clubId);
                const label = getTimeLabel(evt.startTime, evt.endTime);
                const labelColor = getTimeLabelColor(label);
                return (
                  <Pressable
                    key={evt.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: "/(tabs)/(home)/event/[id]", params: { id: evt.id } });
                    }}
                    style={({ pressed }) => [styles.previewCard, { opacity: pressed ? 0.88 : 1 }]}
                  >
                    <View style={styles.previewTop}>
                      <View style={[styles.previewBadge, { backgroundColor: labelColor + "18" }]}>
                        <Text style={[styles.previewBadgeText, { color: labelColor }]}>{label}</Text>
                      </View>
                      {evt.hasFood && (
                        <MaterialIcons name="restaurant" size={14} color={Colors.light.warning} />
                      )}
                      <View style={styles.previewArrow}>
                        <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />
                      </View>
                    </View>
                    <Text style={styles.previewTitle} numberOfLines={2}>{evt.title}</Text>
                    <Text style={styles.previewDesc} numberOfLines={2}>{evt.description}</Text>
                    <View style={styles.previewMeta}>
                      <View style={styles.previewMetaItem}>
                        <Ionicons name="time-outline" size={13} color={Colors.light.textSecondary} />
                        <Text style={styles.previewMetaText}>
                          {formatEventTime(evt.startTime)} · {formatEventDate(evt.startTime)}
                        </Text>
                      </View>
                      <View style={styles.previewMetaItem}>
                        <Ionicons name="navigate-outline" size={13} color={Colors.light.textSecondary} />
                        <Text style={styles.previewMetaText}>
                          Room {evt.room}
                        </Text>
                      </View>
                    </View>
                    {club && (
                      <View style={styles.previewClub}>
                        <View style={[styles.previewClubDot, { backgroundColor: club.imageColor }]} />
                        <Text style={styles.previewClubName}>{club.name}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderListContent = () => (
    <>
      {sortedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={40} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>No upcoming events</Text>
          <Text style={styles.emptySubtitle}>Check back later for new events</Text>
        </View>
      ) : (
        sortedEvents.map((item) => (
          <EventCard
            key={item.id}
            event={item}
            club={getClub(item.clubId)}
            building={getBuilding(item.buildingId)}
            isSaved={savedIds.has(item.id)}
            onSave={() => handleSave(item.id)}
          />
        ))
      )}
    </>
  );

  return (
    <PageShell>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={[styles.header, layout.isDesktop && styles.headerDesktop]}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Campus life at a glance</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Discover clubs and events around BYU</Text>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/(home)/create-event"); }}
                style={styles.createBtn}
                hitSlop={8}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.headerSubtitle}>
              Browse what is happening now, save plans for later, and explore communities without losing the mobile-first flow.
            </Text>
          </View>
          <View style={[styles.headerStats, layout.isDesktop && styles.headerStatsDesktop]}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatNumber}>{sortedEvents.length}</Text>
              <Text style={styles.headerStatLabel}>Upcoming events</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatNumber}>{mapMarkers.length}</Text>
              <Text style={styles.headerStatLabel}>Active buildings</Text>
            </View>
          </View>
        </View>

        {layout.isDesktop ? (
          <ScrollView
            style={styles.desktopScroll}
            contentContainerStyle={{ paddingBottom: layout.tabBarHeight + 32 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topControls}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/(home)/search"); }}
                style={[styles.searchBtn, styles.searchBtnDesktop]}
              >
                <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
                <Text style={styles.searchPlaceholder}>Search events, clubs, locations...</Text>
              </Pressable>

              <View style={styles.toggleWrap}>
                <SegmentedControl
                  segments={["Map", "List"]}
                  selectedIndex={viewMode}
                  onChange={setViewMode}
                />
              </View>
            </View>

            {viewMode === 0 ? renderMapContent() : <View style={styles.desktopList}>{renderListContent()}</View>}
          </ScrollView>
        ) : viewMode === 0 ? (
          <ScrollView
            style={styles.mapScroll}
            contentContainerStyle={{ paddingBottom: layout.tabBarHeight + 32 }}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/(home)/search"); }}
              style={styles.searchBtn}
            >
              <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.searchPlaceholder}>Search events, clubs, locations...</Text>
            </Pressable>

            <SegmentedControl
              segments={["Map", "List"]}
              selectedIndex={viewMode}
              onChange={setViewMode}
            />

            {renderMapContent()}
          </ScrollView>
        ) : (
          <FlatList
            data={sortedEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                club={getClub(item.clubId)}
                building={getBuilding(item.buildingId)}
                isSaved={savedIds.has(item.id)}
                onSave={() => handleSave(item.id)}
              />
            )}
            contentContainerStyle={[styles.list, { paddingBottom: layout.tabBarHeight + 32 }]}
            contentInsetAdjustmentBehavior="automatic"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color={Colors.light.textTertiary} />
                <Text style={styles.emptyTitle}>No upcoming events</Text>
                <Text style={styles.emptySubtitle}>Check back later for new events</Text>
              </View>
            }
          />
        )}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 8,
    paddingBottom: 18,
    gap: 18,
  },
  headerDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    lineHeight: 40,
  },
  headerSubtitle: {
    maxWidth: 720,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 23,
  },
  createBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  headerStats: {
    flexDirection: "row",
    gap: 12,
  },
  headerStatsDesktop: {
    minWidth: 260,
  },
  headerStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerStatNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.tint,
  },
  headerStatLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  desktopScroll: {
    flex: 1,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  searchBtnDesktop: {
    marginBottom: 0,
    flex: 1,
  },
  toggleWrap: {
    width: 240,
  },
  mapScroll: {
    flex: 1,
  },
  mapContainer: { gap: 16 },
  mapContainerDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  mapFrame: {
    overflow: "hidden",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    flex: 1,
  },
  mapFrameDesktop: {
    minHeight: 560,
  },
  bottomSheet: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 24 : 49,
    left: 12,
    right: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    maxHeight: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  sidePanel: {
    position: "relative",
    bottom: undefined,
    left: undefined,
    right: undefined,
    width: 370,
    maxHeight: "100%",
    minHeight: 560,
    paddingTop: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  sheetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    flex: 1,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 2,
  },
  sheetList: { paddingBottom: 24, paddingHorizontal: 16 },
  sheetEmpty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  previewCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  previewBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  previewBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  previewArrow: {
    marginLeft: "auto" as const,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 21,
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  previewMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previewMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  previewClub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  previewClubDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  previewClubName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  list: {
    paddingTop: 4,
  },
  desktopList: {
    paddingTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
