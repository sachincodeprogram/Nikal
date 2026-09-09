import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "RideResults">;

export default function RideResultsScreen({ route, navigation }: Props) {
  const { rides } = route.params;

  if (rides.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Koi ride nahi mili is route/date par.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={rides}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("RideDetail", { rideId: item.id })}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.route}>
              {item.fromLabel} → {item.toLabel}
            </Text>
            <Text>{item.vehicleType === "CAR" ? "🚗" : "🏍️"}</Text>
          </View>
          <Text style={styles.meta}>
            {new Date(item.departureAt).toLocaleString()}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.driver}>{item.driver?.name}</Text>
            <Text style={styles.price}>₹{item.pricePerSeat} / seat</Text>
          </View>
          <Text style={styles.seats}>{item.availableSeats} seats left</Text>
        </TouchableOpacity>
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
  meta: { color: "#666", marginTop: 2, marginBottom: 6 },
  driver: { color: "#333" },
  price: { fontWeight: "700", color: "#00857a" },
  seats: { marginTop: 4, fontSize: 12, color: "#888" },
});
