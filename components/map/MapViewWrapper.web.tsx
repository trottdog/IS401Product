import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import Colors from "@/lib/theme/colors";
import { useResponsiveLayout } from "@/lib/ui/responsive";
import { getApiUrl } from "@/lib/api/query-client";

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  label: string;
}

interface MapViewWrapperProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers: MapMarker[];
  onMarkerPress: (id: string) => void;
  mapRef?: any;
}

function getBackendUrl(): string {
  return getApiUrl().replace(/\/$/, "");
}

export function MapViewWrapper({
  initialRegion,
  markers,
  onMarkerPress,
}: MapViewWrapperProps) {
  const [loaded, setLoaded] = useState(false);
  const layout = useResponsiveLayout();
  const screenHeight = Dimensions.get("window").height;
  const mapHeight = Math.max(layout.mapHeight, Math.max(screenHeight - 220, 400));

  const iframeSrc = useMemo(() => {
    const base = getBackendUrl();
    const markersEncoded = encodeURIComponent(JSON.stringify(markers));
    return `${base}/api/map?lat=${initialRegion.latitude}&lng=${initialRegion.longitude}&zoom=15.5&key=HalOFfShOFGRip19eGRc&mapId=019ac349-d5ee-795c-85cf-2cc023e13ad5&markers=${markersEncoded}`;
  }, [markers, initialRegion.latitude, initialRegion.longitude]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d && d.type === "markerPress" && d.id) {
          onMarkerPress(d.id);
        }
      } catch {}
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onMarkerPress]);

  return (
    <View style={[styles.wrap, { height: mapHeight }]}>
      {!loaded && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      )}
      <iframe
        src={iframeSrc}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        title="Campus Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 400,
    backgroundColor: "#dde3ed",
    overflow: "hidden",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
});
