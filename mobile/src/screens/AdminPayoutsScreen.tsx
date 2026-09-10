import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import PaginationBar from "../components/PaginationBar";
import { colors, fonts, radii, spacing } from "../theme";
import { Paginated, Payout, User } from "../types";

export default function AdminPayoutsScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Payout> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/payouts", { params: { page, limit: 20 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page]);

  useFocusEffect(load);

  async function markPaid(id: string) {
    await api.patch(`/admin/payouts/${id}/mark-paid`);
    load();
  }

  if (loading && !data) return <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.listContent}
      data={data?.items ?? []}
      keyExtractor={(p) => p._id}
      ListEmptyComponent={<Text style={styles.emptyText}>Koi payout nahi hai</Text>}
      renderItem={({ item }) => {
        const driver = item.driverId as User | undefined;
        return (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{driver?.name ?? "—"}</Text>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: item.status === "pending" ? colors.amberTint : colors.accentTint },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: item.status === "pending" ? colors.amberDark : colors.accentDark },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {item.period} · ₹{item.amount} · {item.upiId}
            </Text>
            {item.status === "pending" && (
              <TouchableOpacity style={styles.payBtn} onPress={() => markPaid(item._id)}>
                <Text style={styles.payText}>Mark Paid</Text>
              </TouchableOpacity>
            )}
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
  name: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900 },
  pill: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: radii.pill },
  pillText: { fontFamily: fonts.extrabold, fontSize: 10, textTransform: "uppercase" },
  meta: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, marginTop: 6 },
  payBtn: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    backgroundColor: colors.accentTint,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  payText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accentDark },
});
