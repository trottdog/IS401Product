import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "@/lib/theme/colors";
import * as Haptics from "expo-haptics";
import { useResponsiveLayout } from "@/lib/ui/responsive";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  const layout = useResponsiveLayout();

  return (
    <View style={[styles.container, { marginHorizontal: 0, marginBottom: layout.sectionGap }]}>
      {segments.map((label, i) => {
        const isActive = i === selectedIndex;
        return (
          <Pressable
            key={label}
            onPress={() => {
              if (i !== selectedIndex) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(i);
              }
            }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: Colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  segmentTextActive: {
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
});
