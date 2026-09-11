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
import { CalendarIcon, PinIcon, SearchIcon } from "../components/icons";
import LocationAutocomplete, { Place } from "../components/LocationAutocomplete";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export default function SearchScreen({ navigation }: Props) {
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!from || !to) {
      Alert.alert("From/To address chunna zaroori hai");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/rides/search", {
        params: { fromLat: from.lat, fromLng: from.lng, toLat: to.lat, toLng: to.lng, date },
      });
      navigation.navigate("RideResults", { rides: data });
    } catch (err: any) {
      Alert.alert("Search failed", err?.response?.data?.message ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.routeCard}>
        <View style={styles.connector} />

        <View style={styles.routeRow}>
          <View style={[styles.pinBadge, { backgroundColor: colors.accentTint }]}>
            <PinIcon size={15} color={colors.accentDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>From</Text>
            <LocationAutocomplete placeholder="Address search karo" onSelect={setFrom} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.routeRow}>
          <View style={[styles.pinBadge, { backgroundColor: colors.ink100 }]}>
            <PinIcon size={15} color={colors.ink700} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>To</Text>
            <LocationAutocomplete placeholder="Address search karo" onSelect={setTo} />
          </View>
        </View>
      </View>

      <View style={styles.dateCard}>
        <View style={[styles.pinBadge, { backgroundColor: colors.amberTint }]}>
          <CalendarIcon size={15} color={colors.amberDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholderTextColor={colors.ink300}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={search} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <SearchIcon size={18} color={colors.white} />
            <Text style={styles.buttonText}>Search Rides</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  routeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 34,
    top: 44,
    bottom: 44,
    width: 0,
    borderLeftWidth: 2,
    borderLeftColor: colors.ink200,
    borderStyle: "dashed",
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  pinBadge: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 42 },
  dateCard: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  dateInput: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, padding: 0 },
  button: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 16,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
