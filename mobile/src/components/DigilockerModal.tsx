import React from "react";
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors, fonts, spacing } from "../theme";
import { XIcon } from "./icons";

// Must match the redirectUrl the backend passes to Setu when creating the
// DigiLocker request (see backend/src/controllers/userController.js).
const CALLBACK_PREFIX = "nikal://digilocker-callback";

export type DigilockerResult = {
  success: boolean;
  id?: string;
  scope?: string;
  errMessage?: string;
};

export default function DigilockerModal({
  visible,
  url,
  onResult,
  onClose,
}: {
  visible: boolean;
  url: string | null;
  onResult: (result: DigilockerResult) => void;
  onClose: () => void;
}) {
  function handleShouldStartLoad(request: { url: string }) {
    if (!request.url.startsWith(CALLBACK_PREFIX)) return true;

    const query = request.url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    onResult({
      success: params.get("success") === "True",
      id: params.get("id") ?? undefined,
      scope: params.get("scope") ?? undefined,
      errMessage: params.get("errMessage") ?? undefined,
    });
    return false;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>DigiLocker se Verify Karo</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <XIcon size={14} color={colors.ink700} />
          </TouchableOpacity>
        </View>
        {url && (
          <WebView
            source={{ uri: url }}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            startInLoadingState
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink100,
    alignItems: "center",
    justifyContent: "center",
  },
});
