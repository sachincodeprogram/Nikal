import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { colors, fonts, radii, spacing } from "../theme";
import { BlockIcon, ReportIcon } from "./icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName?: string;
  bookingId?: string;
}

export default function UserActionsSheet({ visible, onClose, targetUserId, targetName, bookingId }: Props) {
  const [mode, setMode] = useState<"menu" | "report">("menu");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setMode("menu");
    setReason("");
  }

  function close() {
    reset();
    onClose();
  }

  async function block() {
    Alert.alert(`${targetName ?? "User"} ko block karein?`, "Aap in dono ek dusre ki rides search mein nahi dikhenge.", [
      { text: "Nahi" },
      {
        text: "Haan, block karo",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/users/${targetUserId}/block`);
            Alert.alert("Block ho gaya");
            close();
          } catch (err: any) {
            Alert.alert("Failed", err?.response?.data?.message ?? err.message);
          }
        },
      },
    ]);
  }

  async function submitReport() {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/reports", { reportedId: targetUserId, bookingId, reason: reason.trim() });
      Alert.alert("Report submit ho gayi", "Hamari team review karegi.");
      close();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          {mode === "menu" ? (
            <>
              <Text style={styles.title}>{targetName ?? "User"}</Text>
              <TouchableOpacity style={styles.row} onPress={() => setMode("report")}>
                <ReportIcon size={17} />
                <Text style={styles.rowText}>Report user</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.row} onPress={block}>
                <BlockIcon size={17} />
                <Text style={styles.rowText}>Block user</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelRow} onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Report {targetName ?? "user"}</Text>
              <TextInput
                style={styles.input}
                placeholder="Kya hua? Reason likhein..."
                placeholderTextColor={colors.ink300}
                value={reason}
                onChangeText={setReason}
                multiline
                autoFocus
              />
              <TouchableOpacity style={styles.submitButton} onPress={submitReport} disabled={submitting || !reason.trim()}>
                {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Submit Report</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelRow} onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(21,34,32,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.ink900, marginBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rowText: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink900 },
  cancelRow: { marginTop: spacing.sm, alignItems: "center", paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink500 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 84,
    textAlignVertical: "top",
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink900,
    marginBottom: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14.5 },
});
