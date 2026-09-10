import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { BikeIcon, CalendarIcon, CarIcon, MegaphoneIcon, PinIcon } from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { Vehicle } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "PublishRide">;

export default function PublishRideScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | undefined>();
  const [fromLabel, setFromLabel] = useState("");
  const [fromLat, setFromLat] = useState("");
  const [fromLng, setFromLng] = useState("");
  const [toLabel, setToLabel] = useState("");
  const [toLat, setToLat] = useState("");
  const [toLng, setToLng] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [seatsTotal, setSeatsTotal] = useState(2);
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/vehicles").then(({ data }) => {
      setVehicles(data);
      if (data[0]) setVehicleId(data[0]._id);
    });
  }, []);

  async function publish() {
    if (!vehicleId) {
      Alert.alert("Pehle ek vehicle add karo (Profile screen se)");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/rides", {
        vehicleId,
        from: { name: fromLabel, lat: Number(fromLat), lng: Number(fromLng) },
        to: { name: toLabel, lat: Number(toLat), lng: Number(toLng) },
        departureAt: new Date(departureAt).toISOString(),
        seatsTotal,
        pricePerSeat: Number(pricePerSeat),
        approval: autoConfirm ? "auto" : "manual",
      });
      Alert.alert("Ride published!", "", [{ text: "OK", onPress: () => navigation.navigate("Home") }]);
    } catch (err: any) {
      Alert.alert("Publish failed", err?.response?.data?.message ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.xxl) + spacing.xxxl }]}
    >
      <Text style={styles.label}>Vehicle</Text>
      {vehicles.length === 0 && (
        <Text style={styles.warn}>Aapke paas koi vehicle nahi hai. Pehle Profile screen se Car/Bike add karo.</Text>
      )}
      <View style={styles.chipRow}>
        {vehicles.map((v) => {
          const active = vehicleId === v._id;
          return (
            <TouchableOpacity
              key={v._id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setVehicleId(v._id)}
            >
              {v.type === "BIKE" ? (
                <BikeIcon size={16} color={active ? colors.white : colors.accent} />
              ) : (
                <CarIcon size={16} color={active ? colors.white : colors.accent} />
              )}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {v.make} {v.model}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { marginTop: spacing.xxl }]}>Route</Text>
      <View style={styles.routeCard}>
        <View style={styles.connector} />

        <View style={styles.routeRow}>
          <View style={[styles.pinBadge, { backgroundColor: colors.accentTint }]}>
            <PinIcon size={15} color={colors.accentDark} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.plainInput}
              placeholder="From (jagah ka naam)"
              placeholderTextColor={colors.ink300}
              value={fromLabel}
              onChangeText={setFromLabel}
            />
            <View style={styles.coordRow}>
              <TextInput
                style={styles.coordInput}
                placeholder="Lat"
                placeholderTextColor={colors.ink300}
                keyboardType="numeric"
                value={fromLat}
                onChangeText={setFromLat}
              />
              <TextInput
                style={styles.coordInput}
                placeholder="Lng"
                placeholderTextColor={colors.ink300}
                keyboardType="numeric"
                value={fromLng}
                onChangeText={setFromLng}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.routeRow}>
          <View style={[styles.pinBadge, { backgroundColor: colors.ink100 }]}>
            <PinIcon size={15} color={colors.ink700} />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.plainInput}
              placeholder="To (jagah ka naam)"
              placeholderTextColor={colors.ink300}
              value={toLabel}
              onChangeText={setToLabel}
            />
            <View style={styles.coordRow}>
              <TextInput
                style={styles.coordInput}
                placeholder="Lat"
                placeholderTextColor={colors.ink300}
                keyboardType="numeric"
                value={toLat}
                onChangeText={setToLat}
              />
              <TextInput
                style={styles.coordInput}
                placeholder="Lng"
                placeholderTextColor={colors.ink300}
                keyboardType="numeric"
                value={toLng}
                onChangeText={setToLng}
              />
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.label, { marginTop: spacing.xxl }]}>Departure</Text>
      <View style={styles.fieldRow}>
        <CalendarIcon size={17} color={colors.amberDark} />
        <TextInput
          style={styles.fieldInput}
          placeholder="YYYY-MM-DDTHH:mm"
          placeholderTextColor={colors.ink300}
          value={departureAt}
          onChangeText={setDepartureAt}
        />
      </View>

      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Seats</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setSeatsTotal((n) => Math.max(1, n - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{seatsTotal}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, styles.stepperBtnAccent]}
              onPress={() => setSeatsTotal((n) => Math.min(8, n + 1))}
            >
              <Text style={[styles.stepperBtnText, { color: colors.accentDark }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Price / seat</Text>
          <View style={styles.fieldRowFlat}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="250"
              placeholderTextColor={colors.ink300}
              keyboardType="numeric"
              value={pricePerSeat}
              onChangeText={setPricePerSeat}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.toggleRow} onPress={() => setAutoConfirm((v) => !v)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Auto-confirm bookings</Text>
          <Text style={styles.toggleSub}>
            {autoConfirm ? "Passengers seat turant confirm ho jayegi" : "Off — har request khud review karoge"}
          </Text>
        </View>
        <View style={[styles.switchTrack, autoConfirm && styles.switchTrackOn]}>
          <View style={[styles.switchThumb, autoConfirm && styles.switchThumbOn]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={publish} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <MegaphoneIcon size={18} color={colors.white} />
            <Text style={styles.buttonText}>Publish Ride</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  warn: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.danger, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink700 },
  chipTextActive: { color: colors.white },
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
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingVertical: spacing.md },
  pinBadge: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  plainInput: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, paddingVertical: 4 },
  coordRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  coordInput: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink900,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 44 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  fieldRowFlat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  rupee: { fontFamily: fonts.extrabold, color: colors.ink500, fontSize: 15 },
  fieldInput: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink900, paddingVertical: 12 },
  twoCol: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xxl },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  stepperBtn: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.ink100, alignItems: "center", justifyContent: "center" },
  stepperBtnAccent: { backgroundColor: colors.accentTint },
  stepperBtnText: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink700 },
  stepperValue: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink900 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  toggleTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.ink900 },
  toggleSub: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500, marginTop: 2 },
  switchTrack: { width: 42, height: 25, borderRadius: 999, backgroundColor: colors.ink200, padding: 2.5, justifyContent: "center" },
  switchTrackOn: { backgroundColor: colors.accent },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  switchThumbOn: { transform: [{ translateX: 17 }] },
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
