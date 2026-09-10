import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  CarIcon,
  DashboardIcon,
  LogOutIcon,
  MegaphoneIcon,
  SearchIcon,
  TicketIcon,
  UserIcon,
} from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const ACTIONS: {
  label: string;
  sub: string;
  screen: keyof RootStackParamList;
  icon: (color: string) => React.ReactNode;
  tint: string;
  iconColor: string;
}[] = [
  {
    label: "Publish a Ride",
    sub: "Driver ban kar seats share karo",
    screen: "PublishRide",
    icon: (c) => <MegaphoneIcon size={19} color={c} />,
    tint: colors.amberTint,
    iconColor: colors.amberDark,
  },
  {
    label: "My Published Rides",
    sub: "Requests approve karo",
    screen: "DriverRides",
    icon: (c) => <CarIcon size={19} color={c} />,
    tint: colors.accentTint,
    iconColor: colors.accentDark,
  },
  {
    label: "My Bookings",
    sub: "Apni saari trips dekho",
    screen: "MyBookings",
    icon: (c) => <TicketIcon size={19} color={c} />,
    tint: colors.blueTint,
    iconColor: colors.blue,
  },
  {
    label: "Profile",
    sub: "Vehicles aur rating manage karo",
    screen: "Profile",
    icon: (c) => <UserIcon size={19} color={c} />,
    tint: colors.ink100,
    iconColor: colors.ink700,
  },
];

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {user?.name ?? "Rider"}</Text>
          <Text style={styles.subGreeting}>Kahan jaana hai aaj?</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? "R").charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      <LinearGradient colors={["#00957F", "#00655C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroKicker}>Passenger</Text>
        <Text style={styles.heroTitle}>Search a ride</Text>
        <Text style={styles.heroSub}>Find drivers heading your way, right now</Text>
        <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate("Search")}>
          <SearchIcon size={17} color={colors.accentDark} />
          <Text style={styles.heroButtonText}>Find a ride</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.grid}>
        {ACTIONS.map((a) => (
          <TouchableOpacity key={a.screen} style={styles.card} onPress={() => navigation.navigate(a.screen as any)}>
            <View style={[styles.cardIcon, { backgroundColor: a.tint }]}>{a.icon(a.iconColor)}</View>
            <Text style={styles.cardTitle}>{a.label}</Text>
            <Text style={styles.cardSub}>{a.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {user?.isAdmin && (
        <TouchableOpacity style={styles.adminCard} onPress={() => navigation.navigate("AdminDashboard")}>
          <View style={[styles.cardIcon, { backgroundColor: colors.ink100 }]}>
            <DashboardIcon size={19} color={colors.ink700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Admin Panel</Text>
            <Text style={styles.cardSub}>Users, rides, reports, payouts</Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <LogOutIcon size={15} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 56 },
  header: {
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.ink900, letterSpacing: -0.3 },
  subGreeting: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink500, marginTop: 3 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.extrabold, color: colors.accentDark, fontSize: 16 },
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.xxl,
    borderRadius: radii.xxl,
    ...shadow.button,
    shadowColor: "#00655C",
  },
  heroKicker: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: "#BFEAE3",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.white, marginTop: 6 },
  heroSub: { fontFamily: fonts.semibold, fontSize: 13, color: "#D6F0EB", marginTop: 4, maxWidth: 230 },
  heroButton: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  heroButtonText: { fontFamily: fonts.bold, fontSize: 13, color: colors.accentDark },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  card: {
    width: "47%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: 10,
  },
  cardIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900, lineHeight: 18 },
  cardSub: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500 },
  logout: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  logoutText: { fontFamily: fonts.bold, fontSize: 13, color: colors.danger },
});
