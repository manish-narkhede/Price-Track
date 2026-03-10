import React, {useEffect, useMemo, useRef} from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {StatusBar} from "expo-status-bar";

export default function AppSplashScreen() {
  const {width, height} = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const sizes = useMemo(() => {
    const shorterSide = Math.min(width, height);
    const iconBox = Math.max(90, Math.min(132, shorterSide * 0.3));
    const logo = Math.max(52, Math.min(74, shorterSide * 0.18));
    const title = Math.max(32, Math.min(44, shorterSide * 0.1));
    const subtitle = Math.max(15, Math.min(20, shorterSide * 0.046));
    return {iconBox, logo, title, subtitle};
  }, [width, height]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "48%"],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.bgGradientTop} />
      <View style={styles.bgGradientBottom} />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.centerWrap}>
        <View
          style={[
            styles.iconCard,
            {width: sizes.iconBox, height: sizes.iconBox, borderRadius: sizes.iconBox * 0.2},
          ]}
        >
          <Text style={[styles.mainIcon, {fontSize: sizes.logo}]}>📈</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⬇</Text>
          </View>
        </View>

        <View style={styles.copyWrap}>
          <Text style={[styles.title, {fontSize: sizes.title}]}>PriceTrack</Text>
          <Text style={[styles.subtitle, {fontSize: sizes.subtitle}]}>Track prices. Buy smarter.</Text>
        </View>
      </View>

      <View style={styles.bottomWrap}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, {width: fillWidth}]} />
        </View>
        <Text style={styles.loadingText}>INITIALIZING SMART SYNC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bgGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#4f46e5",
  },
  bgGradientBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#7c3aed",
    opacity: 0.45,
  },
  glowTopLeft: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -120,
    left: -110,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  glowBottomRight: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -160,
    right: -140,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
  },
  iconCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  mainIcon: {
    color: "#ffffff",
    lineHeight: 84,
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5247e6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.32)",
  },
  badgeIcon: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 17,
  },
  copyWrap: {
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.86)",
    fontWeight: "600",
  },
  bottomWrap: {
    position: "absolute",
    bottom: 58,
    left: 24,
    right: 24,
    alignItems: "center",
    gap: 12,
  },
  track: {
    width: "100%",
    maxWidth: 320,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  loadingText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
  },
});
