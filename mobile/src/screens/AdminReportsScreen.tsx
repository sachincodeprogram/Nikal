import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import PaginationBar from "../components/PaginationBar";
import { colors, fonts, radii, spacing } from "../theme";
import { Paginated, Report, User } from "../types";

export default function AdminReportsScreen() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Report> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/reports", { params: { page, limit: 20 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [page]);

  useFocusEffect(load);

  async function resolve(id: string) {
    await api.patch(`/admin/reports/${id}/resolve`);
    load();
  }

  if (loading && !data) return <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.listContent}
      data={data?.items ?? []}
      keyExtractor={(r) => r._id}
      ListEmptyComponent={<Text style={styles.emptyText}>Koi report nahi hai</Text>}
      renderItem={({ item }) => {
        const reporter = item.reporterId as User | undefined;
        const reported = item.reportedId as User | undefined;
        return (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.names} numberOfLines={1}>
                {reporter?.name ?? "—"} → {reported?.name ?? "—"}
              </Text>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: item.status === "open" ? colors.amberTint : colors.ink100 },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: item.status === "open" ? colors.amberDark : colors.ink700 },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.reason}>{item.reason}</Text>
            {item.status === "open" && (
              <TouchableOpacity style={styles.resolveBtn} onPress={() => resolve(item._id)}>
                <Text style={styles.resolveText}>Mark Resolved</Text>
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
  names: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900, flexShrink: 1 },
  pill: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: radii.pill },
  pillText: { fontFamily: fonts.extrabold, fontSize: 10, textTransform: "uppercase" },
  reason: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink500, marginTop: 6 },
  resolveBtn: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    backgroundColor: colors.accentTint,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  resolveText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accentDark },
});
