import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { StarIcon } from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "RateTrip">;

export default function RateTripScreen({ route, navigation }: Props) {
  const { bookingId, rateeName } = route.params;
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await api.post("/ratings", { bookingId, stars: score, comment: comment || undefined });
      Alert.alert("Dhanyavaad!", "Rating submit ho gayi.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{rateeName ?? "Trip"} ko rate karein</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setScore(n)} hitSlop={8}>
              <StarIcon size={34} color={n <= score ? colors.amber : colors.ink200} />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Comment (optional)"
          placeholderTextColor={colors.ink300}
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Submit Rating</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xxl,
    ...shadow.card,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.ink900, marginBottom: spacing.xl, textAlign: "center" },
  stars: { flexDirection: "row", justifyContent: "center", marginBottom: spacing.xl, gap: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    minHeight: 84,
    textAlignVertical: "top",
    marginBottom: spacing.lg,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink900,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: "center",
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
