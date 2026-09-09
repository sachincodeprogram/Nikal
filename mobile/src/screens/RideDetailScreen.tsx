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
import { RootStackParamList } from "../navigation/RootNavigator";
import { Ride } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "RideDetail">;

export default function RideDetailScreen({ route }: Props) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<Ride | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/rides/${rideId}`).then(({ data }) => setRide(data.ride));
  }, [rideId]);

  async function book() {
    setBooking(true);
    try {
      const { data } = await api.post("/bookings", { rideId, seatsBooked: 1 });
      Alert.alert(
        data.booking.status === "CONFIRMED" ? "Booking confirmed!" : "Request bheji gayi",
        data.booking.status === "CONFIRMED"
          ? "Aapki seat confirm ho gayi hai."
          : "Driver approve karega to confirm hogi."
      );
    } catch (err: any) {
      Alert.alert("Booking failed", err?.response?.data?.error ?? err.message);
    } finally {
      setBooking(false);
    }
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.route}>
        {ride.fromLabel} → {ride.toLabel}
      </Text>
      <Text style={styles.meta}>{new Date(ride.departureAt).toLocaleString()}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver</Text>
        <Text>{ride.driver?.name}</Text>
        <Text style={styles.dim}>
          ⭐ {ride.driver?.ratingAvg.toFixed(1)} ({ride.driver?.ratingCount} reviews)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle</Text>
        <Text>
          {ride.vehicleType === "CAR" ? "🚗" : "🏍️"} {ride.vehicle?.make}{" "}
          {ride.vehicle?.model} · {ride.vehicle?.color}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price</Text>
        <Text style={styles.price}>₹{ride.pricePerSeat} / seat</Text>
        <Text style={styles.dim}>{ride.availableSeats} seats available</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={book} disabled={booking}>
        {booking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {ride.autoApprove ? "Book Now" : "Request to Book"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  route: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 13, color: "#999", marginBottom: 4 },
  dim: { color: "#888", fontSize: 12, marginTop: 2 },
  price: { fontSize: 18, fontWeight: "700", color: "#00857a" },
  button: {
    backgroundColor: "#00857a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
