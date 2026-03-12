import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/lib/theme/colors";
import { Club, Category } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useResponsiveLayout } from "@/lib/ui/responsive";

interface ClubCardProps {
  club: Club;
  category?: Category;
  isMember?: boolean;
  role?: string;
  compact?: boolean;
}

export function ClubCard({ club, category, isMember, role, compact }: ClubCardProps) {
  const layout = useResponsiveLayout();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/(tabs)/(home)/club/[id]", params: { id: club.id } });
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.compactCard, { opacity: pressed ? 0.95 : 1 }]}
      >
        <View style={[styles.avatar, { backgroundColor: club.imageColor }]}>
          <Text style={styles.avatarText}>{club.name.charAt(0)}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{club.name}</Text>
          <Text style={styles.compactMeta}>{club.memberCount} members</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        layout.isDesktop && styles.cardDesktop,
        { transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.avatarLg, { backgroundColor: club.imageColor }]}>
          <Text style={styles.avatarLgText}>{club.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{club.name}</Text>
          {category && (
            <Text style={styles.cardCategory}>{category.name}</Text>
          )}
          <Text style={styles.cardMembers}>{club.memberCount} members</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{club.description}</Text>

      {isMember && (
        <View style={styles.memberBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
          <Text style={styles.memberBadgeText}>
            {role === "admin" || role === "president" ? "Admin" : "Member"}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardDesktop: {
    padding: 22,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLgText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  cardCategory: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.accent,
  },
  cardMembers: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.light.success + "12",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  memberBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.success,
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderLight,
  },
  compactContent: {
    flex: 1,
    gap: 2,
  },
  compactTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  compactMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
