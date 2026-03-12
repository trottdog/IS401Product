import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/lib/theme/colors";
import { Event, Club, Building, Category, getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useResponsiveLayout } from "@/lib/ui/responsive";

interface EventCardProps {
  event: Event;
  club?: Club;
  building?: Building;
  category?: Category;
  isSaved?: boolean;
  onSave?: () => void;
  compact?: boolean;
}

export function EventCard({ event, club, building, category, isSaved, onSave, compact }: EventCardProps) {
  const layout = useResponsiveLayout();
  const timeLabel = getTimeLabel(event.startTime, event.endTime);
  const timeLabelColor = getTimeLabelColor(timeLabel);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/(tabs)/(home)/event/[id]", params: { id: event.id } });
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave?.();
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.compactCard, { opacity: pressed ? 0.95 : 1 }]}
      >
        <View style={[styles.timeBadge, { backgroundColor: timeLabelColor + "18" }]}>
          <Text style={[styles.timeBadgeText, { color: timeLabelColor }]}>{timeLabel}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.compactMeta} numberOfLines={1}>
            {formatEventTime(event.startTime)} {building ? `· ${building.abbreviation}` : ""}
          </Text>
        </View>
        {event.hasFood && (
          <MaterialIcons name="restaurant" size={14} color={Colors.light.warning} />
        )}
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
      <View style={styles.cardHeader}>
        <View style={[styles.timeBadge, { backgroundColor: timeLabelColor + "18" }]}>
          <Text style={[styles.timeBadgeText, { color: timeLabelColor }]}>{timeLabel}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {event.hasFood && (
            <View style={styles.foodBadge}>
              <MaterialIcons name="restaurant" size={12} color={Colors.light.warning} />
              <Text style={styles.foodText}>Food</Text>
            </View>
          )}
          {onSave && (
            <Pressable onPress={handleSave} hitSlop={12}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isSaved ? Colors.light.tint : Colors.light.textTertiary}
              />
            </Pressable>
          )}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

      {club && (
        <View style={styles.clubRow}>
          <View style={[styles.clubDot, { backgroundColor: club.imageColor }]} />
          <Text style={styles.clubName}>{club.name}</Text>
          {category && <Text style={styles.clubCategory}>{category.name}</Text>}
        </View>
      )}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={styles.metaText}>{formatEventTime(event.startTime)} · {formatEventDate(event.startTime)}</Text>
        </View>
        {building && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{building.abbreviation} {event.room}</Text>
          </View>
        )}
      </View>

      {event.hasLimitedCapacity && event.maxCapacity && (
        <View style={styles.capacityRow}>
          <View style={styles.capacityBarBg}>
            <View
              style={[
                styles.capacityBarFill,
                {
                  width: `${(event.currentReservations / event.maxCapacity) * 100}%`,
                  backgroundColor: event.currentReservations >= event.maxCapacity ? Colors.light.error : Colors.light.accent,
                },
              ]}
            />
          </View>
          <Text style={styles.capacityText}>
            {event.maxCapacity - event.currentReservations} spots left
          </Text>
        </View>
      )}

      {event.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {event.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  foodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.light.warning + "15",
    borderRadius: 12,
  },
  foodText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.warning,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  clubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  clubDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clubName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  clubCategory: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.accent,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  capacityBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 2,
    overflow: "hidden",
  },
  capacityBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  capacityText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
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
