import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { KycStatus, Paginated, User } from "../types";

const DOC_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  driving_license: "Driving Licence",
  passport: "Passport",
  voter_id: "Voter ID",
};

const TABS: { key: KycStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "KYC Pending" },
  { key: "verified", label: "Verified" },
];

export default function AdminUsersScreen() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<KycStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/users", {
        params: { q: q || undefined, kycStatus: tab === "all" ? undefined : tab, page, limit: 20 },
      })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [q, tab, page]);

  useFocusEffect(load);

  async function verify(id: string) {
    await api.patch(`/admin/users/${id}/verify`);
    load();
  }

  function reject(id: string, name: string) {
    Alert.alert(`${name} ki KYC reject karein?`, "Reason chuno", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Documents unclear",
        onPress: async () => {
          await api.patch(`/admin/users/${id}/reject-kyc`, { reason: "Documents unclear" });
          load();
        },
      },
      {
        text: "Fake / invalid document",
        style: "destructive",
        onPress: async () => {
          await api.patch(`/admin/users/${id}/reject-kyc`, { reason: "Fake or invalid document" });
          load();
        },
      },
    ]);
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

      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => {
                setTab(t.key);
                setPage(1);
              }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && !data ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Koi user nahi mila</Text>}
          renderItem={({ item }) => {
            const kyc = item.kyc;
            return (
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.phone}>{item.phone ?? item.email}</Text>
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
                  {!item.isVerified && kyc?.status === "pending" && (
                    <View style={[styles.pill, { backgroundColor: colors.amberTint }]}>
                      <Text style={[styles.pillText, { color: colors.amberDark }]}>KYC Pending</Text>
                    </View>
                  )}
                </View>

                {kyc?.status && kyc.status !== "unsubmitted" && (
                  <View style={styles.kycRow}>
                    {kyc.docPhoto && <Image source={{ uri: kyc.docPhoto }} style={styles.docThumb} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.kycDocLine}>
                        {DOC_LABELS[kyc.docType ?? ""] ?? kyc.docType} · {kyc.docNumber}
                      </Text>
                      {kyc.status === "rejected" && (
                        <Text style={styles.kycRejectedLine}>Rejected: {kyc.rejectionReason}</Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.actions}>
                  {!item.isVerified && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => verify(item._id)}>
                      <Text style={styles.actionText}>Verify</Text>
                    </TouchableOpacity>
                  )}
                  {!item.isVerified && kyc?.status === "pending" && (
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => reject(item._id, item.name)}>
                      <Text style={[styles.actionText, styles.rejectText]}>Reject</Text>
                    </TouchableOpacity>
                  )}
                  {!item.banned && (
                    <TouchableOpacity style={[styles.actionBtn, styles.banBtn]} onPress={() => ban(item._id, item.name)}>
                      <Text style={[styles.actionText, styles.banText]}>Ban</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
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
  tabRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink700 },
  tabTextActive: { color: colors.white },
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
  kycRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.ink100 },
  kycDocLine: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink900 },
  kycRejectedLine: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.dangerDark, marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: colors.accentTint,
  },
  actionText: { fontFamily: fonts.bold, fontSize: 12, color: colors.accentDark },
  rejectBtn: { backgroundColor: colors.dangerTint },
  rejectText: { color: colors.dangerDark },
  banBtn: { backgroundColor: colors.dangerTint },
  banText: { color: colors.dangerDark },
});
