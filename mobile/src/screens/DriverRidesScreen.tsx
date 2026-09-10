import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { CheckIcon, ClockIcon, XIcon } from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { Booking, Ride, User } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "DriverRides">;

type RideWithBookings = Ride & { bookings: Booking[] };

const STATUS_PILL: Record<string, { label: string; bg: string; fg: string }> = {
  active: { label: "Active", bg: colors.accentTint, fg: colors.accentDark },
  full: { label: "Full", bg: colors.amberTint, fg: colors.amberDark },
  started: { label: "In progress", bg: colors.blueTint, fg: colors.blue },
  completed: { label: "Completed", bg: colors.ink100, fg: colors.ink700 },
  cancelled: { label: "Cancelled", bg: colors.dangerTint, fg: colors.dangerDark },
};

export default function DriverRidesScreen({ navigation }: Props) {
  const [rides, setRides] = useState<RideWithBookings[]>([]);

  const load = useCallback(() => {
    api.get("/rides/mine").then(({ data }) => setRides(data));
  }, []);

  useFocusEffect(load);

  async function decide(bookingId: string, status: "confirmed" | "rejected") {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      load();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err.message);
    }
  }

  async function cancelRide(rideId: string) {
    Alert.alert("Ride cancel karein?", "Sabhi confirmed bookings bhi cancel ho jayengi.", [
      { text: "Nahi" },
      {
        text: "Haan, cancel karo",
        style: "destructive",
        onPress: async () => {
          await api.patch(`/rides/${rideId}/status`, { status: "cancelled" });
          load();
        },
      },
    ]);
  }

  if (rides.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aapne abhi tak koi ride publish nahi ki.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={rides}
      keyExtractor={(r) => r._id}
      renderItem={({ item }) => {
        const pending = (item.bookings ?? []).filter((b) => b.status === "pending");
        const pill = STATUS_PILL[item.status] ?? STATUS_PILL.active;
        return (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.route} numberOfLines={1}>
                {item.from.name} → {item.to.name}
              </Text>
              <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                <Text style={[styles.pillText, { color: pill.fg }]}>{pill.label}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <ClockIcon size={13} color={colors.ink400} />
              <Text style={styles.metaText}>
                {new Date(item.departureAt).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                {"  ·  "}
                {item.seatsLeft} seats khaali
              </Text>
            </View>

            {pending.length > 0 && (
              <>
                <View style={styles.hr} />
                <Text style={styles.sectionLabel}>Booking Requests</Text>
                {pending.map((b) => {
                  const passenger = b.passengerId as User | undefined;
                  return (
                    <View key={b._id} style={styles.requestRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.requestName} numberOfLines={1}>
                          {passenger?.name ?? "Passenger"} · {b.seats} seat(s)
                        </Text>
                        <Text style={styles.requestAmount}>₹{b.amount}</Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity style={styles.approveBtn} onPress={() => decide(b._id, "confirmed")}>
                          <CheckIcon size={12} color={colors.white} />
                          <Text style={styles.approveText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectBtn} onPress={() => decide(b._id, "rejected")}>
                          <XIcon size={12} color={colors.ink700} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {item.status === "active" && (
              <>
                <View style={styles.hr} />
                <TouchableOpacity style={styles.cancelRow} onPress={() => cancelRide(item._id)}>
                  <XIcon size={13} color={colors.danger} />
                  <Text style={styles.cancelText}>Cancel Ride</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      }}
    />
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
  route: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, flexShrink: 1 },
  pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.pill },
  pillText: { fontFamily: fonts.extrabold, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  metaText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  requestRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  requestName: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink900 },
  requestAmount: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500, marginTop: 1 },
  requestActions: { flexDirection: "row", gap: 6 },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  approveText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11.5 },
  rejectBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.ink100,
  },
  cancelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cancelText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.danger },
});
