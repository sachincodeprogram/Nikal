import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { CheckIcon, SearchIcon } from "../components/icons";
import PaginationBar from "../components/PaginationBar";
import { colors, fonts, radii, spacing } from "../theme";
import { Paginated, User } from "../types";

export default function AdminUsersScreen() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/users", { params: { q: q || undefined, page, limit: 20 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [q, page]);

  useFocusEffect(load);

  async function verify(id: string) {
    await api.patch(`/admin/users/${id}/verify`);
    load();
  }

  async function ban(id: string, name: string) {
    Alert.alert(`${name} ko ban karein?`, "", [
      { text: "Nahi" },
      {
        text: "Haan, ban karo",
        style: "destructive",
        onPress: async () => {
          await api.patch(`/admin/users/${id}/ban`);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <SearchIcon size={16} color={colors.ink500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Naam ya phone se search karein"
          placeholderTextColor={colors.ink300}
          value={q}
          onChangeText={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
      </View>

      {loading && !data ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Koi user nahi mila</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
                {item.banned && (
                  <View style={[styles.pill, { backgroundColor: colors.dangerTint }]}>
                    <Text style={[styles.pillText, { color: colors.dangerDark }]}>Banned</Text>
                  </View>
                )}
                {item.isVerified && !item.banned && (
                  <View style={[styles.pill, { backgroundColor: colors.accentTint }]}>
                    <CheckIcon size={10} color={colors.accentDark} />
                    <Text style={[styles.pillText, { color: colors.accentDark }]}>Verified</Text>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                {!item.isVerified && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => verify(item._id)}>
                    <Text style={styles.actionText}>Verify</Text>
                  </TouchableOpacity>
                )}
                {!item.banned && (
                  <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => ban(item._id, item.name)}>
                    <Text style={[styles.actionText, styles.banText]}>Ban</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={
            data ? <PaginationBar page={data.page} pages={data.pages} onChange={setPage} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: fonts.semibold, fontSize: 14, color: colors.ink900 },
  listContent: { paddingHorizontal: spacing.xl },
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
  phone: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, marginTop: 2 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 9, borderRadius: radii.pill },
  pillText: { fontFamily: fonts.extrabold, fontSize: 10, textTransform: "uppercase" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: colors.accentTint,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accentDark },
  banBtn: { backgroundColor: colors.dangerTint },
  banText: { color: colors.dangerDark },
});
