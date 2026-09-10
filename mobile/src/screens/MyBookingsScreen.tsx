import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import { ChatIcon, CheckIcon, ClockIcon, DotsIcon, FlagIcon, StarIcon, XIcon } from "../components/icons";
import UserActionsSheet from "../components/UserActionsSheet";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { Booking, BookingStatus, Ride, User } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

const STATUS_META: Record<BookingStatus, { label: string; bg: string; fg: string; icon: (c: string) => React.ReactNode }> = {
  pending: { label: "Pending", bg: colors.amberTint, fg: "#92610C", icon: (c) => <ClockIcon size={10} color={c} /> },
  confirmed: { label: "Confirmed", bg: colors.accentTint, fg: colors.accentDark, icon: (c) => <CheckIcon size={10} color={c} /> },
  rejected: { label: "Rejected", bg: colors.dangerTint, fg: colors.dangerDark, icon: (c) => <XIcon size={10} color={c} /> },
  cancelled: { label: "Cancelled", bg: colors.dangerTint, fg: colors.dangerDark, icon: (c) => <XIcon size={10} color={c} /> },
  completed: { label: "Completed", bg: colors.ink100, fg: colors.ink700, icon: (c) => <FlagIcon size={10} color={c} /> },
};

const CHATTABLE: BookingStatus[] = ["pending", "confirmed", "completed"];

export default function MyBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [actionsFor, setActionsFor] = useState<Booking | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.get("/bookings/mine").then(({ data }) => setBookings(data));
    }, [])
  );

  if (bookings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Abhi koi booking nahi hai.</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={bookings}
        keyExtractor={(b) => b._id}
        renderItem={({ item }) => {
          const ride = item.rideId as Ride | undefined;
          const driver = item.driverId as User | undefined;
          const meta = STATUS_META[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.route} numberOfLines={1}>
                  {ride?.from?.name} → {ride?.to?.name}
                </Text>
                <View style={[styles.pill, { backgroundColor: meta.bg }]}>
                  {meta.icon(meta.fg)}
                  <Text style={[styles.pillText, { color: meta.fg }]}>{meta.label}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {ride?.departureAt && new Date(ride.departureAt).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                {driver?.name ? ` · ${driver.name}` : ""}
              </Text>

              <View style={styles.hr} />
              <View style={styles.footerRow}>
                {item.status === "completed" ? (
                  <TouchableOpacity
                    style={styles.footerLink}
                    onPress={() => navigation.navigate("RateTrip", { bookingId: item._id, rateeName: driver?.name })}
                  >
                    <StarIcon size={13} />
                    <Text style={styles.rateText}>Rate your driver</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                <View style={styles.footerActions}>
                  {CHATTABLE.includes(item.status) && (
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => navigation.navigate("Chat", { bookingId: item._id, otherUserName: driver?.name })}
                    >
                      <ChatIcon size={16} color={colors.blue} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setActionsFor(item)} hitSlop={6}>
                    <DotsIcon size={16} color={colors.ink400} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <UserActionsSheet
        visible={!!actionsFor}
        onClose={() => setActionsFor(null)}
        targetUserId={((actionsFor?.driverId as User)?._id ?? (actionsFor?.driverId as string)) || ""}
        targetName={(actionsFor?.driverId as User)?.name}
        bookingId={actionsFor?._id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.bg },
  listContent: { padding: spacing.xl },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  emptyText: { fontFamily: fonts.semibold, color: colors.ink500 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  route: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink900, flexShrink: 1 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.pill },
  pillText: { fontFamily: fonts.extrabold, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.3 },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, marginTop: 6 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  rateText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.accentDark },
  footerActions: { flexDirection: "row", gap: spacing.md, marginLeft: "auto" },
  iconBtn: { padding: 2 },
});
