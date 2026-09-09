import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Booking } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

const STATUS_LABEL: Record<Booking["status"], string> = {
  PENDING: "⏳ Pending approval",
  CONFIRMED: "✅ Confirmed",
  REJECTED: "❌ Rejected",
  CANCELLED: "🚫 Cancelled",
  COMPLETED: "🏁 Completed",
};

export default function MyBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.get("/bookings/mine").then(({ data }) => setBookings(data.bookings));
    }, [])
  );

  if (bookings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Abhi koi booking nahi hai.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={bookings}
      keyExtractor={(b) => b.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.route}>
            {item.ride?.fromLabel} → {item.ride?.toLabel}
          </Text>
          <Text style={styles.meta}>
            {item.ride && new Date(item.ride.departureAt).toLocaleString()}
          </Text>
          <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
          {item.status === "COMPLETED" && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("RateTrip", {
                  bookingId: item.id,
                  rateeName: item.ride?.driver?.name,
                })
              }
            >
              <Text style={styles.rateLink}>⭐ Driver ko rate karein</Text>
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
  route: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 2, marginBottom: 6 },
  status: { fontWeight: "600" },
  rateLink: { color: "#00857a", marginTop: 8, fontWeight: "600", fontSize: 12 },
});
