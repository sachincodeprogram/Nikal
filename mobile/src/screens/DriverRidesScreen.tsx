import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Booking, Ride } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "DriverRides">;

type RideWithBookings = Ride & { bookings: Booking[] };

export default function DriverRidesScreen({ navigation }: Props) {
  const [rides, setRides] = useState<RideWithBookings[]>([]);

  const load = useCallback(() => {
    api.get("/rides/mine/published").then(({ data }) => setRides(data.rides));
  }, []);

  useFocusEffect(load);

  async function decide(bookingId: string, decision: "CONFIRMED" | "REJECTED") {
    try {
      await api.post(`/bookings/${bookingId}/decision`, { decision });
      load();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.error ?? err.message);
    }
  }

  async function cancelRide(rideId: string) {
    Alert.alert("Ride cancel karein?", "Sabhi bookings bhi cancel ho jayengi.", [
      { text: "Nahi" },
      {
        text: "Haan, cancel karo",
        style: "destructive",
        onPress: async () => {
          await api.post(`/rides/${rideId}/cancel`);
          load();
        },
      },
    ]);
  }

  if (rides.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aapne abhi tak koi ride publish nahi ki.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={rides}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.route}>
              {item.fromLabel} → {item.toLabel}
            </Text>
            <Text>{item.vehicleType === "CAR" ? "🚗" : "🏍️"}</Text>
          </View>
          <Text style={styles.meta}>
            {new Date(item.departureAt).toLocaleString()} · {item.status}
          </Text>
          <Text style={styles.meta}>{item.availableSeats} seats khaali</Text>

          {item.bookings.filter((b) => b.status === "PENDING").length > 0 && (
            <View style={styles.requests}>
              <Text style={styles.requestsTitle}>Booking Requests</Text>
              {item.bookings
                .filter((b) => b.status === "PENDING")
                .map((b) => (
                  <View key={b.id} style={styles.requestRow}>
                    <Text style={styles.requestText}>
                      {b.seatsBooked} seat(s)
                    </Text>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.approve}
                        onPress={() => decide(b.id, "CONFIRMED")}
                      >
                        <Text style={styles.approveText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.reject}
                        onPress={() => decide(b.id, "REJECTED")}
                      >
                        <Text style={styles.rejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          )}

          {item.status === "ACTIVE" && (
            <TouchableOpacity onPress={() => cancelRide(item.id)}>
              <Text style={styles.cancelLink}>Ride Cancel Karein</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666" },
  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  route: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 2 },
  requests: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#e2e2e2", paddingTop: 10 },
  requestsTitle: { fontSize: 12, color: "#999", marginBottom: 6 },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  requestText: { fontSize: 14 },
  requestActions: { flexDirection: "row", gap: 8 },
  approve: { backgroundColor: "#00857a", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  approveText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  reject: { backgroundColor: "#eee", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  rejectText: { color: "#c0392b", fontWeight: "600", fontSize: 12 },
  cancelLink: { color: "#c0392b", marginTop: 10, fontSize: 12 },
});
