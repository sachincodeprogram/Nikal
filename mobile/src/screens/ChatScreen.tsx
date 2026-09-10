import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Socket } from "socket.io-client";
import { api } from "../api/client";
import { connectSocket } from "../api/socket";
import { SendIcon } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, spacing } from "../theme";
import { Message } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    let active = true;

    api
      .get(`/messages/${bookingId}`)
      .then(({ data }) => active && setMessages(data))
      .finally(() => active && setLoading(false));

    connectSocket().then((socket) => {
      if (!active) {
        socket.disconnect();
        return;
      }
      socketRef.current = socket;
      socket.emit("booking:join", bookingId);
      socket.on("message:new", (message: Message) => {
        if (message.bookingId === bookingId) {
          setMessages((prev) => [...prev, message]);
        }
      });
    });

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    if (messages.length) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  function send() {
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current) return;
    socketRef.current.emit("message:send", { bookingId, text: trimmed });
    setText("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(m) => m._id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Abhi koi message nahi hai — "Namaste" bolke shuru karein!</Text> : null
        }
        renderItem={({ item }) => {
          const mine = item.from === user?._id;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.text}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message likhein..."
          placeholderTextColor={colors.ink300}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={send} disabled={!text.trim()}>
          <SendIcon size={17} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  emptyText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: fonts.semibold,
    color: colors.ink500,
    fontSize: 13,
    paddingHorizontal: spacing.xxl,
  },
  bubbleRow: { flexDirection: "row", justifyContent: "flex-start" },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubble: { maxWidth: "78%", paddingVertical: 10, paddingHorizontal: 14, borderRadius: radii.lg },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink900 },
  bubbleTextMine: { color: colors.white },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink900,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
