import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/lib/theme/colors";
import { useResponsiveLayout } from "@/lib/ui/responsive";

interface PageShellProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function PageShell({ children, style, contentStyle }: PageShellProps) {
  const layout = useResponsiveLayout();

  return (
    <View style={[styles.page, style]}>
      <LinearGradient
        colors={["#F7FAFD", "#EEF3F8", "#E6EEF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View
        style={[
          styles.content,
          {
            maxWidth: layout.contentMaxWidth,
            paddingHorizontal: layout.contentPadding,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    flex: 1,
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(0, 98, 184, 0.08)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -180,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(0, 46, 93, 0.08)",
  },
});
