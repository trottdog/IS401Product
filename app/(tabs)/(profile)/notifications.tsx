import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Platform, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/lib/theme/colors";
import { useAuth } from "@/lib/auth/auth-context";
import { Notification } from "@/lib/types";
import * as store from "@/lib/api/store";
import { PageShell } from "@/components/layout/PageShell";
import { useResponsiveLayout } from "@/lib/ui/responsive";

function getNotifIcon(type: string): string {
  switch (type) {
    case "event_change": return "calendar-outline";
    case "reservation": return "ticket-outline";
    case "announcement": return "megaphone-outline";
    case "membership": return "people-outline";
    default: return "notifications-outline";
  }
}

function getNotifColor(type: string): string {
  switch (type) {
    case "event_change": return Colors.light.warning;
    case "reservation": return Colors.light.accent;
    case "announcement": return Colors.light.tint;
    case "membership": return Colors.light.success;
    default: return Colors.light.textSecondary;
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const layout = useResponsiveLayout();

  const topInset = Platform.OS === "web" ? layout.topInset : insets.top;

  const loadData = useCallback(async () => {
    if (!user) return;
    const n = await store.getNotifications(user.id);
    setNotifications(n);
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

  const handleRead = async (notifId: string) => {
    await store.markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  return (
    <PageShell>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 42 }} />
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const iconName = getNotifIcon(item.type) as any;
            const color = getNotifColor(item.type);
            return (
              <Pressable
                onPress={() => handleRead(item.id)}
                style={[styles.notifItem, !item.read && styles.notifUnread]}
              >
                <View style={[styles.notifIcon, { backgroundColor: color + "15" }]}>
                  <Ionicons name={iconName} size={18} color={color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </Pressable>
            );
          }}
          contentContainerStyle={[styles.list, { paddingBottom: layout.tabBarHeight + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.tint} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up</Text>
            </View>
          }
        />
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
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
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  list: {
    paddingBottom: 40,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    marginBottom: 12,
  },
  notifUnread: {
    backgroundColor: Colors.light.tintLight,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  notifBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginTop: 4,
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
