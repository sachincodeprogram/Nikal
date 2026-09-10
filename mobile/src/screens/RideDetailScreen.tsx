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
import { api } from "../api/client";
import { BikeIcon, CalendarIcon, CarIcon, PinIcon, SeatIcon, ShieldCheckIcon, StarIcon } from "../components/icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { placeLat, placeLng, Ride, User, Vehicle } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "RideDetail">;

export default function RideDetailScreen({ route }: Props) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<Ride | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/rides/${rideId}`).then(({ data }) => setRide(data));
  }, [rideId]);

  // NOTE: books the whole published route (pickup = ride.from, drop =
  // ride.to). A pickup/drop picker on the map is future work — see
  // mobile/README roadmap.
  async function book() {
    if (!ride) return;
    setBooking(true);
    try {
      const { data } = await api.post("/bookings", {
        rideId,
        seats: 1,
        pickup: { name: ride.from.name, lat: placeLat(ride.from), lng: placeLng(ride.from) },
        drop: { name: ride.to.name, lat: placeLat(ride.to), lng: placeLng(ride.to) },
      });
      Alert.alert(
        data.status === "confirmed" ? "Booking confirmed!" : "Request bheji gayi",
        data.status === "confirmed"
          ? "Aapki seat confirm ho gayi hai."
          : "Driver approve karega to confirm hogi."
      );
    } catch (err: any) {
      Alert.alert("Booking failed", err?.response?.data?.message ?? err.message);
    } finally {
      setBooking(false);
    }
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const driver = ride.driverId as User;
  const vehicle = ride.vehicleId as Vehicle;
  const isBike = vehicle?.type === "BIKE";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.connector} />
          <View style={styles.routeRow}>
            <View style={[styles.pinBadge, { backgroundColor: colors.accentTint }]}>
              <PinIcon size={14} color={colors.accentDark} />
            </View>
            <Text style={styles.placeName}>{ride.from.name}</Text>
          </View>
          <View style={{ height: 22 }} />
          <View style={styles.routeRow}>
            <View style={[styles.pinBadge, { backgroundColor: colors.ink100 }]}>
              <PinIcon size={14} color={colors.ink700} />
            </View>
            <Text style={styles.placeName}>{ride.to.name}</Text>
          </View>
          <View style={styles.hr} />
          <View style={styles.metaRow}>
            <CalendarIcon size={14} color={colors.ink400} />
            <Text style={styles.metaText}>
              {new Date(ride.departureAt).toLocaleDateString([], { day: "numeric", month: "short" })} ·{" "}
              {new Date(ride.departureAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Driver</Text>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{(driver?.name ?? "?").charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{driver?.name}</Text>
                <ShieldCheckIcon size={14} color={colors.accent} />
              </View>
              <View style={styles.ratingRow}>
                <StarIcon size={13} />
                <Text style={styles.ratingText}>
                  {driver?.avgRating?.toFixed(1) ?? "—"} · {driver?.ratingCount ?? 0} reviews
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Vehicle</Text>
          <View style={styles.vehicleRow}>
            <View style={[styles.vehicleBadge, { backgroundColor: isBike ? colors.amberTint : colors.accentTint }]}>
              {isBike ? <BikeIcon size={21} color={colors.amberDark} /> : <CarIcon size={21} color={colors.accentDark} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>
                {vehicle?.make} {vehicle?.model} · {vehicle?.color}
              </Text>
              <View style={styles.vehicleMetaRow}>
                <Text style={styles.plateChip}>{vehicle?.plateNo}</Text>
                <View style={styles.seatRow}>
                  <SeatIcon size={13} color={colors.ink400} />
                  <Text style={styles.seatText}>{vehicle?.seats} seats</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{ride.pricePerSeat}</Text>
            <Text style={styles.priceUnit}>/ seat</Text>
          </View>
          <Text style={styles.priceNote}>
            {ride.seatsLeft} of {ride.seatsTotal} seats available · fare may vary by pickup/drop
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.button} onPress={book} disabled={booking}>
          {booking ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {ride.approval === "auto" ? "Book Now" : "Request to Book"} · ₹{ride.pricePerSeat}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  container: { padding: spacing.xl, gap: spacing.md, paddingBottom: 130 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    position: "relative",
    ...shadow.card,
  },
  connector: {
    position: "absolute",
    left: 33,
    top: 38,
    bottom: 38,
    width: 0,
    borderLeftWidth: 2,
    borderLeftColor: colors.ink200,
    borderStyle: "dashed",
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  pinBadge: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  placeName: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900 },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.ink500 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  driverRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  driverAvatarText: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.white },
  driverNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  driverName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink900 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  ratingText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink500 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  vehicleBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  vehicleName: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900 },
  vehicleMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 },
  plateChip: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.ink700,
    backgroundColor: colors.ink100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  seatText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  price: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.accentDark },
  priceUnit: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink500 },
  priceNote: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500, marginTop: 6 },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 16,
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
