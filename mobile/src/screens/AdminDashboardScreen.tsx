import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  CarIcon,
  ReportIcon,
  TicketIcon,
  UserIcon,
} from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AdminDashboard">;

const SECTIONS: {
  label: string;
  sub: string;
  screen: keyof RootStackParamList;
  icon: (c: string) => React.ReactNode;
  tint: string;
  iconColor: string;
}[] = [
  {
    label: "Users",
    sub: "Search, verify, ban",
    screen: "AdminUsers",
    icon: (c) => <UserIcon size={19} color={c} />,
    tint: colors.ink100,
    iconColor: colors.ink700,
  },
  {
    label: "Rides",
    sub: "All published rides",
    screen: "AdminRides",
    icon: (c) => <CarIcon size={19} color={c} />,
    tint: colors.accentTint,
    iconColor: colors.accentDark,
  },
  {
    label: "Bookings",
    sub: "All bookings",
    screen: "AdminBookings",
    icon: (c) => <TicketIcon size={19} color={c} />,
    tint: colors.blueTint,
    iconColor: colors.blue,
  },
  {
    label: "Reports",
    sub: "Review & resolve",
    screen: "AdminReports",
    icon: (c) => <ReportIcon size={19} color={c} />,
    tint: colors.dangerTint,
    iconColor: colors.dangerDark,
  },
  {
    label: "Payouts",
    sub: "Mark driver payouts paid",
    screen: "AdminPayouts",
    icon: (c) => <TicketIcon size={19} color={c} />,
    tint: colors.amberTint,
    iconColor: colors.amberDark,
  },
];

export default function AdminDashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {SECTIONS.map((s) => (
        <TouchableOpacity key={s.screen} style={styles.card} onPress={() => navigation.navigate(s.screen as any)}>
          <View style={[styles.icon, { backgroundColor: s.tint }]}>{s.icon(s.iconColor)}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{s.label}</Text>
            <Text style={styles.sub}>{s.sub}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink900 },
  sub: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500, marginTop: 2 },
});
