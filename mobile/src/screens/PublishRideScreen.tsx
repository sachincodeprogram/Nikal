import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { BikeIcon, CalendarIcon, CarIcon, ClockIcon, MegaphoneIcon, PinIcon } from "../components/icons";
import LocationAutocomplete, { Place } from "../components/LocationAutocomplete";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { Vehicle } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "PublishRide">;

type PriceSuggestion = { distanceKm: number; recommended: number; min: number; max: number };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DATE_CHOICE_COUNT = 21;
const PRICE_STEP = 10;
const MIN_PRICE = 20;

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dateChoices() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DATE_CHOICE_COUNT }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${DAY_LABELS[d.getDay()]} ${d.getDate()}`;
    return { key: toDateKey(d), label };
  });
}

export default function PublishRideScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | undefined>();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [seatsTotal, setSeatsTotal] = useState(2);
  const [pricePerSeat, setPricePerSeat] = useState(0);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/vehicles").then(({ data }) => {
      setVehicles(data);
      if (data[0]) setVehicleId(data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!from || !to) {
      setPriceSuggestion(null);
      return;
    }
    let cancelled = false;
    setSuggestionLoading(true);
    api
      .get("/rides/price-suggestion", {
        params: { fromLat: from.lat, fromLng: from.lng, toLat: to.lat, toLng: to.lng },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setPriceSuggestion(data);
        if (!priceTouched) setPricePerSeat(data.recommended);
      })
      .catch(() => {
        if (!cancelled) setPriceSuggestion(null);
      })
      .finally(() => {
        if (!cancelled) setSuggestionLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  function toggleDate(key: string) {
    setSelectedDates((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
  }

  function priceState(): "low" | "good" | "high" | null {
    if (!priceSuggestion) return null;
    if (pricePerSeat < priceSuggestion.min) return "low";
    if (pricePerSeat > priceSuggestion.max) return "high";
    return "good";
  }

  async function publish() {
    if (!vehicleId) {
      Alert.alert("Pehle ek vehicle add karo (Profile screen se)");
      return;
    }
    if (!from || !to) {
      Alert.alert("From/To address chunna zaroori hai");
      return;
    }
    if (selectedDates.length === 0) {
      Alert.alert("Kam se kam ek date chuno");
      return;
    }
    if (!pricePerSeat) {
      Alert.alert("Price per seat set karo");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let lastError = "";
    for (const dateKey of selectedDates) {
      try {
        await api.post("/rides", {
          vehicleId,
          from,
          to,
          departureAt: new Date(`${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`).toISOString(),
          seatsTotal,
          pricePerSeat,
          approval: autoConfirm ? "auto" : "manual",
        });
        successCount += 1;
      } catch (err: any) {
        lastError = err?.response?.data?.message ?? err.message;
      }
    }
    setSubmitting(false);

    if (successCount === selectedDates.length) {
      const msg = successCount > 1 ? `${successCount} rides published!` : "Ride published!";
      Alert.alert(msg, "", [{ text: "OK", onPress: () => navigation.navigate("Home") }]);
    } else if (successCount > 0) {
      Alert.alert(
        "Kuch rides publish nahi ho payi",
        `${successCount}/${selectedDates.length} publish hui. ${lastError}`,
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } else {
      Alert.alert("Publish failed", lastError);
    }
  }

  const state = priceState();
  const badgeStyle =
    state === "good"
      ? styles.badgeGood
      : state === "low"
      ? styles.badgeLow
      : state === "high"
      ? styles.badgeHigh
      : styles.badgeNeutral;
  const badgeTextStyle =
    state === "good"
      ? styles.badgeTextGood
      : state === "low"
      ? styles.badgeTextLow
      : state === "high"
      ? styles.badgeTextHigh
      : styles.badgeTextNeutral;

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
            <LocationAutocomplete placeholder="From (jagah ka naam)" onSelect={setFrom} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.routeRow}>
          <View style={[styles.pinBadge, { backgroundColor: colors.ink100 }]}>
            <PinIcon size={15} color={colors.ink700} />
          </View>
          <View style={{ flex: 1 }}>
            <LocationAutocomplete placeholder="To (jagah ka naam)" onSelect={setTo} />
          </View>
        </View>
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Date(s)</Text>
        {selectedDates.length > 0 && (
          <Text style={styles.labelHint}>{selectedDates.length} din select kiye</Text>
        )}
      </View>
      <Text style={styles.helperText}>Ek se zyada date chuno agar roz yehi ride chalate ho</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dateChoices().map(({ key, label }) => {
          const active = selectedDates.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.dateChip, active && styles.dateChipActive]}
              onPress={() => toggleDate(key)}
            >
              <CalendarIcon size={13} color={active ? colors.white : colors.amberDark} />
              <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[styles.label, { marginTop: spacing.xxl }]}>Pickup time</Text>
      <View style={styles.timeRow}>
        <ClockIcon size={16} color={colors.ink500} />
        <View style={styles.timeStepper}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => setHour((h) => (h + 23) % 24)}>
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.timeValue}>{String(hour).padStart(2, "0")}</Text>
          <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnAccent]} onPress={() => setHour((h) => (h + 1) % 24)}>
            <Text style={[styles.stepperBtnText, { color: colors.accentDark }]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timeColon}>:</Text>
        <View style={styles.timeStepper}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => setMinute((m) => (m + 45) % 60)}>
            <Text style={styles.stepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.timeValue}>{String(minute).padStart(2, "0")}</Text>
          <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnAccent]} onPress={() => setMinute((m) => (m + 15) % 60)}>
            <Text style={[styles.stepperBtnText, { color: colors.accentDark }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.label, { marginTop: spacing.xxl }]}>Seats</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperBtn} onPress={() => setSeatsTotal((n) => Math.max(1, n - 1))}>
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{seatsTotal}</Text>
        <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnAccent]} onPress={() => setSeatsTotal((n) => Math.min(8, n + 1))}>
          <Text style={[styles.stepperBtnText, { color: colors.accentDark }]}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: spacing.xxl }]}>Price / seat</Text>
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <TouchableOpacity
            style={styles.priceStepperBtn}
            onPress={() => {
              setPriceTouched(true);
              setPricePerSeat((p) => Math.max(MIN_PRICE, p - PRICE_STEP));
            }}
          >
            <Text style={styles.priceStepperBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.priceValue, state === "high" && styles.priceValueHigh]}>
            ₹{pricePerSeat || 0}
          </Text>
          <TouchableOpacity
            style={[styles.priceStepperBtn, styles.priceStepperBtnAccent]}
            onPress={() => {
              setPriceTouched(true);
              setPricePerSeat((p) => p + PRICE_STEP);
            }}
          >
            <Text style={[styles.priceStepperBtnText, { color: colors.accentDark }]}>+</Text>
          </TouchableOpacity>
        </View>

        {suggestionLoading && <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.accent} />}

        {priceSuggestion && !suggestionLoading && (
          <>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={[styles.badgeText, badgeTextStyle]}>
                Recommended price: ₹{priceSuggestion.min} - ₹{priceSuggestion.max}
              </Text>
            </View>
            <Text style={styles.priceHint}>
              {state === "good" && "Ye price theek hai — passengers jaldi milenge."}
              {state === "low" && "Ye price kaafi kam hai — chaho to badha sakte ho."}
              {state === "high" && "Ye price zyada hai — passengers doosri ride se compare kar sakte hain."}
            </Text>
            <Text style={styles.priceDistance}>Route distance: ~{priceSuggestion.distanceKm} km</Text>
          </>
        )}

        {!priceSuggestion && !suggestionLoading && (
          <Text style={styles.priceHint}>From aur To chuno taake price suggestion mil sake.</Text>
        )}
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
            <Text style={styles.buttonText}>
              {selectedDates.length > 1 ? `Publish ${selectedDates.length} Rides` : "Publish Ride"}
            </Text>
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
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xxl },
  labelHint: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.accentDark, marginBottom: spacing.sm },
  helperText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500, marginTop: -4, marginBottom: spacing.sm },
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
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 44 },
  dateRow: { gap: spacing.sm, paddingVertical: 2 },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateChipActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  dateChipText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink700 },
  dateChipTextActive: { color: colors.white },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timeStepper: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  timeValue: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.ink900, minWidth: 28, textAlign: "center" },
  timeColon: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.ink500 },
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
  priceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xxl },
  priceStepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  priceStepperBtnAccent: {},
  priceStepperBtnText: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.accent },
  priceValue: { fontFamily: fonts.extrabold, fontSize: 32, color: colors.accentDark, minWidth: 100, textAlign: "center" },
  priceValueHigh: { color: colors.danger },
  badge: { alignSelf: "center", marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radii.pill },
  badgeNeutral: { backgroundColor: colors.ink100 },
  badgeGood: { backgroundColor: colors.accentTint },
  badgeLow: { backgroundColor: colors.amberTint },
  badgeHigh: { backgroundColor: colors.dangerTint },
  badgeText: { fontFamily: fonts.bold, fontSize: 12.5 },
  badgeTextNeutral: { color: colors.ink700 },
  badgeTextGood: { color: colors.accentDark },
  badgeTextLow: { color: colors.amberDark },
  badgeTextHigh: { color: colors.dangerDark },
  priceHint: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink500, textAlign: "center", marginTop: spacing.sm },
  priceDistance: { fontFamily: fonts.semibold, fontSize: 11, color: colors.ink400, textAlign: "center", marginTop: 4 },
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
