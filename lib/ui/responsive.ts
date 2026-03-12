import { Platform, useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const contentMaxWidth = isDesktop ? 1240 : isTablet ? 960 : 720;
  const contentPadding = width >= 1280 ? 32 : width >= 768 ? 24 : 16;
  const sectionGap = width >= 1100 ? 24 : 16;
  const tabBarHeight = isWeb ? 88 : 84;
  const topInset = isWeb ? 32 : 0;
  const mapHeight = Math.max(height - (isDesktop ? 250 : 220), isDesktop ? 560 : 400);

  return {
    width,
    height,
    isWeb,
    isTablet,
    isDesktop,
    contentMaxWidth,
    contentPadding,
    sectionGap,
    tabBarHeight,
    topInset,
    mapHeight,
  };
}
