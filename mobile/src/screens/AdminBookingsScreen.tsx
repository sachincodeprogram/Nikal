import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import PaginationBar from "../components/PaginationBar";
import { colors, fonts, radii, spacing } from "../theme";
import { Booking, Paginated, Ride, User } from "../types";

export default function AdminBookingsScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/bookings", { params: { page, limit: 20 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page]);

  useFocusEffect(load);

  if (loading && !data) return <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.listContent}
      data={data?.items ?? []}
      keyExtractor={(b) => b._id}
      ListEmptyComponent={<Text style={styles.emptyText}>Koi booking nahi hai</Text>}
      renderItem={({ item }) => {
        const ride = item.rideId as Ride | undefined;
        const passenger = item.passengerId as User | undefined;
        const driver = item.driverId as User | undefined;
        return (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.route} numberOfLines={1}>
                {ride?.from?.name} → {ride?.to?.name}
              </Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.meta}>
              {passenger?.name ?? "—"} → {driver?.name ?? "—"} · {item.seats} seat(s) · ₹{item.amount}
            </Text>
          </View>
        );
      }}
      ListFooterComponent={data ? <PaginationBar page={data.page} pages={data.pages} onChange={setPage} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: spacing.xl },
  emptyText: { fontFamily: fonts.semibold, color: colors.ink500, textAlign: "center", marginTop: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  route: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900, flexShrink: 1 },
  status: { fontFamily: fonts.extrabold, fontSize: 10.5, color: colors.ink500, textTransform: "uppercase" },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, marginTop: 6 },
});
