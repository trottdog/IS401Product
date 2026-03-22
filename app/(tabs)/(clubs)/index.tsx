import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  SectionList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Club, ClubMembership, Category } from "@/lib/types";
import * as store from "@/lib/api/store";
import { ClubCard } from "@/components/cards/ClubCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as Haptics from "expo-haptics";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

type ClubSection = { title: string; subtitle?: string; data: Club[] };

export default function MyClubsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  const loadData = useCallback(async () => {
    if (!user) return;
    const [m, c, cats] = await Promise.all([
      store.getMemberships(user.id),
      store.getClubs(),
      store.getCategories(),
    ]);
    setMemberships(m);
    setAllClubs(c);
    setCategories(cats);
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

  if (!isAuthenticated) {
    return (
      <PageShell>
        <View style={[styles.center, { paddingTop: topInset }]}>
          <Ionicons name="people-outline" size={48} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>Sign in to see your clubs</Text>
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

  const myClubIds = new Set(memberships.map(m => m.clubId));
  const discoverClubs = allClubs.filter(c => !myClubIds.has(c.id));

  const getMemberRole = (clubId: string) => {
    return memberships.find(m => m.clubId === clubId)?.role;
  };

  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  const isAdminRole = (role: ClubMembership["role"]) =>
    role === "admin" || role === "president";

  const clubsFromMemberships = (ms: ClubMembership[]): Club[] =>
    ms
      .map(m => allClubs.find(cl => cl.id === m.clubId))
      .filter((cl): cl is Club => cl !== undefined);

  const adminMemberships = memberships.filter(m => isAdminRole(m.role));
  const memberOnlyMemberships = memberships.filter(m => !isAdminRole(m.role));
  const adminClubs = clubsFromMemberships(adminMemberships);
  const memberClubs = clubsFromMemberships(memberOnlyMemberships);

  const myClubsSections: ClubSection[] = [];
  if (adminClubs.length > 0) {
    myClubsSections.push({
      title: "Clubs you manage",
      subtitle: "You are an admin for these clubs. Edit their profile from each club page.",
      data: adminClubs,
    });
  }
  if (memberClubs.length > 0) {
    myClubsSections.push({
      title: "My clubs",
      subtitle: "Clubs you have joined as a member.",
      data: memberClubs,
    });
  }

  return (
    <PageShell>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find your campus communities</Text>
          <Text style={styles.headerSubtitle}>
            Keep your club hub clean on mobile, while giving desktop enough room to browse and compare organizations.
          </Text>
        </View>

        <SegmentedControl
          segments={["My Clubs", "Discover"]}
          selectedIndex={tab}
          onChange={setTab}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
          </View>
        ) : tab === 0 ? (
          <SectionList
            sections={myClubsSections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClubCard
                club={item}
                category={getCategory(item.categoryId)}
                isMember
                role={getMemberRole(item.id)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.subtitle ? (
                  <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                ) : null}
              </View>
            )}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={[styles.list, { paddingBottom: layout.tabBarHeight + 28 }]}
            contentInsetAdjustmentBehavior="automatic"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={40} color={Colors.light.textTertiary} />
                <Text style={styles.emptyTitle}>No clubs yet</Text>
                <Text style={styles.emptySubtitle}>Explore clubs and join ones you like</Text>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(1); }} style={styles.exploreBtn}>
                  <Text style={styles.exploreBtnText}>Explore Clubs</Text>
                </Pressable>
              </View>
            }
          />
        ) : (
          <FlatList
            data={discoverClubs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClubCard club={item} category={getCategory(item.categoryId)} />
            )}
            contentContainerStyle={[styles.list, { paddingBottom: layout.tabBarHeight + 28 }]}
            contentInsetAdjustmentBehavior="automatic"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>You have joined all clubs!</Text>
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
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  headerSubtitle: {
    marginTop: 8,
    maxWidth: 720,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 23,
  },
  list: {
    paddingTop: 4,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
    maxWidth: 640,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
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
  exploreBtn: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  exploreBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
