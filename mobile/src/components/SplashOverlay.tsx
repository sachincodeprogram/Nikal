import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Circle, Rect, Svg } from "react-native-svg";
import { RouteMarkIcon } from "./icons";
import { colors, fonts } from "../theme";

const DURATION_MS = 5000;
const { height: screenHeight } = Dimensions.get("window");

// Photo: "Four friends in a convertible at sunset" by olly, via Pexels
// (pexels.com/photo/3753039). Pexels License — free for commercial use,
// no attribution required.
const heroPhoto = require("../../assets/splash-friends.jpg");

function IndiaFlagBadge() {
  return (
    <Svg width={22} height={15} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={6.67} fill="#FF9933" />
      <Rect x={0} y={6.67} width={30} height={6.67} fill="#FFFFFF" />
      <Rect x={0} y={13.33} width={30} height={6.67} fill="#138808" />
      <Circle cx={15} cy={10} r={2.6} fill="none" stroke="#000088" strokeWidth={0.5} />
      <Circle cx={15} cy={10} r={0.5} fill="#000088" />
    </Svg>
  );
}

export default function SplashOverlay({ onFinish }: { onFinish: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(onFinish);
    }, DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      <LinearGradient colors={[colors.accent, colors.accentDark]} style={StyleSheet.absoluteFill} />

      <ImageBackground source={heroPhoto} resizeMode="cover" style={styles.hero}>
        {/* fade the photo's top edge into the teal above so the two halves read as one scene */}
        <LinearGradient
          colors={[colors.accentDark, "rgba(0,101,92,0.35)", "rgba(0,101,92,0)"]}
          locations={[0, 0.45, 1]}
          style={styles.heroFade}
        />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.45)"]} style={styles.heroBottomShade} />
      </ImageBackground>

      <View style={styles.top}>
        <View style={styles.logoMark}>
          <RouteMarkIcon size={34} color={colors.white} />
        </View>
        <Text style={styles.title}>Nikal</Text>
        <View style={styles.badge}>
          <IndiaFlagBadge />
          <Text style={styles.badgeText}>MADE IN INDIA</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { position: "absolute", left: 0, right: 0, bottom: 0, height: screenHeight * 0.56 },
  heroFade: { position: "absolute", left: 0, right: 0, top: 0, height: "38%" },
  heroBottomShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "30%" },
  top: { height: screenHeight * 0.5, alignItems: "center", justifyContent: "center" },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 36, color: colors.white, letterSpacing: -0.5 },
  badge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.white, letterSpacing: 0.8 },
});
