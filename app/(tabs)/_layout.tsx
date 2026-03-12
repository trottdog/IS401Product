import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, router } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import React from "react";
import Colors from "@/lib/theme/colors";
import { useResponsiveLayout } from "@/lib/ui/responsive";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Icon sf={{ default: "map", selected: "map.fill" }} md="map" />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(clubs)">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} md="groups" />
        <Label>My Clubs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} md="person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const layout = useResponsiveLayout();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: isWeb ? "fixed" as const : "absolute" as const,
          backgroundColor: isIOS ? "transparent" : isDark ? "#000" : "#fff",
          borderTopWidth: 0,
          elevation: 0,
          height: layout.tabBarHeight,
          left: isWeb ? "50%" : 0,
          right: isWeb ? undefined : 0,
          bottom: isWeb ? 18 : 0,
          marginLeft: isWeb ? -(Math.min(layout.width - 24, 540) / 2) : 0,
          width: isWeb ? Math.min(layout.width - 24, 540) : undefined,
          borderRadius: isWeb ? 26 : 0,
          paddingTop: isWeb ? 10 : 0,
          paddingBottom: isWeb ? 10 : 0,
          shadowColor: "#0B1F33",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isWeb ? 0.12 : 0,
          shadowRadius: isWeb ? 28 : 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: "rgba(255,255,255,0.94)",
                  borderRadius: 26,
                  borderWidth: 1,
                  borderColor: Colors.light.border,
                },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(tabs)/(home)");
          },
        }}
      />
      <Tabs.Screen
        name="(clubs)"
        options={{
          title: "My Clubs",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
