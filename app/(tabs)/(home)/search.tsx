import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/lib/theme/colors";
import { Event, Club, Building, Category } from "@/lib/types";
import { sortEventsByDateAndTime } from "@/lib/utils/events";
import * as store from "@/lib/api/store";
import { EventCard } from "@/components/cards/EventCard";
import { ClubCard } from "@/components/cards/ClubCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const inputRef = useRef<TextInput>(null);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  useEffect(() => {
    (async () => {
      const [e, c, b, cats] = await Promise.all([
        store.getEvents(),
        store.getClubs(),
        store.getBuildings(),
        store.getCategories(),
      ]);
      setEvents(e);
      setClubs(c);
      setBuildings(b);
      setCategories(cats);
    })();
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const q = query.toLowerCase().trim();

  const filteredEvents = useMemo(() => {
    if (!q) return [];
    const now = new Date();
    const filtered = events
      .filter(e => !e.isCancelled && new Date(e.endTime) > now)
      .filter(e => {
        const club = clubs.find(c => c.id === e.clubId);
        const building = buildings.find(b => b.id === e.buildingId);
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q)) ||
          club?.name.toLowerCase().includes(q) ||
          building?.name.toLowerCase().includes(q) ||
          building?.abbreviation.toLowerCase().includes(q)
        );
      });
    return sortEventsByDateAndTime(filtered).slice(0, 20);
  }, [q, events, clubs, buildings]);

  const filteredClubs = useMemo(() => {
    if (!q) return [];
    return clubs
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [q, clubs]);

  const filteredBuildings = useMemo(() => {
    if (!q) return [];
    return buildings.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.abbreviation.toLowerCase().includes(q)
    );
  }, [q, buildings]);

  const getClub = (id: string) => clubs.find(c => c.id === id);
  const getBuilding = (id: string) => buildings.find(b => b.id === id);

  const totalResults = filteredEvents.length + filteredClubs.length + filteredBuildings.length;

  return (
    <PageShell>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.searchHeader}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
          </Pressable>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color={Colors.light.textTertiary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search events, clubs, buildings..."
              placeholderTextColor={Colors.light.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={Colors.light.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>

        {q.length > 0 && (
          <SegmentedControl
            segments={[
              `All (${totalResults})`,
              `Events (${filteredEvents.length})`,
              `Clubs (${filteredClubs.length})`,
              `Buildings (${filteredBuildings.length})`,
            ]}
            selectedIndex={tab}
            onChange={setTab}
          />
        )}

        {q.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>Search BYUconnect</Text>
            <Text style={styles.emptySubtitle}>Find events, clubs, and buildings</Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          <FlatList
            data={
              tab === 0
                ? [
                    ...filteredEvents.map(e => ({ type: "event" as const, data: e })),
                    ...filteredClubs.map(c => ({ type: "club" as const, data: c })),
                    ...filteredBuildings.map(b => ({ type: "building" as const, data: b })),
                  ]
                : tab === 1
                ? filteredEvents.map(e => ({ type: "event" as const, data: e }))
                : tab === 2
                ? filteredClubs.map(c => ({ type: "club" as const, data: c }))
                : filteredBuildings.map(b => ({ type: "building" as const, data: b }))
            }
            keyExtractor={(item, i) => `${item.type}-${i}`}
            renderItem={({ item }) => {
              if (item.type === "event") {
                const ev = item.data as Event;
                return (
                  <EventCard
                    event={ev}
                    club={getClub(ev.clubId)}
                    building={getBuilding(ev.buildingId)}
                    compact
                  />
                );
              }
              if (item.type === "club") {
                return <ClubCard club={item.data as Club} category={categories.find(c => c.id === (item.data as Club).categoryId)} compact />;
              }
              if (item.type === "building") {
                const b = item.data as Building;
                const eventCount = events.filter(e => e.buildingId === b.id && !e.isCancelled).length;
                return (
                  <Pressable style={styles.buildingItem}>
                    <View style={styles.buildingIcon}>
                      <Ionicons name="business-outline" size={18} color={Colors.light.accent} />
                    </View>
                    <View style={styles.buildingInfo}>
                      <Text style={styles.buildingName}>{b.name}</Text>
                      <Text style={styles.buildingMeta}>{b.abbreviation} · {eventCount} events</Text>
                    </View>
                  </Pressable>
                );
              }
              return null;
            }}
            contentContainerStyle={[styles.resultsList, { paddingBottom: layout.tabBarHeight + 24 }]}
            contentInsetAdjustmentBehavior="automatic"
          />
        )}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  resultsList: {
    paddingTop: 12,
  },
  emptySearch: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  buildingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    marginBottom: 12,
  },
  buildingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.accentLight,
    justifyContent: "center",
    alignItems: "center",
  },
  buildingInfo: { flex: 1, gap: 2 },
  buildingName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  buildingMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
