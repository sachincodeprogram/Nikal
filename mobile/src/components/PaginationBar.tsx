import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fonts, radii, spacing } from "../theme";

interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function PaginationBar({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, page <= 1 && styles.btnDisabled]}
        onPress={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <Text style={[styles.btnText, page <= 1 && styles.btnTextDisabled]}>Prev</Text>
      </TouchableOpacity>
      <Text style={styles.pageText}>
        Page {page} / {pages}
      </Text>
      <TouchableOpacity
        style={[styles.btn, page >= pages && styles.btnDisabled]}
        onPress={() => onChange(page + 1)}
        disabled={page >= pages}
      >
        <Text style={[styles.btnText, page >= pages && styles.btnTextDisabled]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  btn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink900 },
  btnTextDisabled: { color: colors.ink400 },
  pageText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink500 },
});
