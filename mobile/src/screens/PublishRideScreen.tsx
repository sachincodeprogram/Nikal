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
import { api } from "../api/client";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Vehicle } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "PublishRide">;

export default function PublishRideScreen({ navigation }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState<string | undefined>();
  const [fromLabel, setFromLabel] = useState("");
  const [fromLat, setFromLat] = useState("");
  const [fromLng, setFromLng] = useState("");
  const [toLabel, setToLabel] = useState("");
  const [toLat, setToLat] = useState("");
  const [toLng, setToLng] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [totalSeats, setTotalSeats] = useState("2");
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/vehicles/mine").then(({ data }) => {
      setVehicles(data.vehicles);
      if (data.vehicles[0]) setVehicleId(data.vehicles[0].id);
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
        fromLabel,
        fromLat: Number(fromLat),
        fromLng: Number(fromLng),
        toLabel,
        toLat: Number(toLat),
        toLng: Number(toLng),
        departureAt: new Date(departureAt).toISOString(),
        totalSeats: Number(totalSeats),
        pricePerSeat: Number(pricePerSeat),
      });
      Alert.alert("Ride published!", "", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (err: any) {
      Alert.alert("Publish failed", err?.response?.data?.error ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ride Publish Karo</Text>

      {vehicles.length === 0 && (
        <Text style={styles.warn}>
          Aapke paas koi vehicle nahi hai. Pehle Profile screen se Car/Bike add
          karo.
        </Text>
      )}

      <View style={styles.row}>
        {vehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[styles.chip, vehicleId === v.id && styles.chipActive]}
            onPress={() => setVehicleId(v.id)}
          >
            <Text style={vehicleId === v.id ? styles.chipTextActive : styles.chipText}>
              {v.type === "CAR" ? "🚗" : "🏍️"} {v.make} {v.model}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="From (jagah ka naam)"
        value={fromLabel}
        onChangeText={setFromLabel}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="From Lat"
          keyboardType="numeric"
          value={fromLat}
          onChangeText={setFromLat}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="From Lng"
          keyboardType="numeric"
          value={fromLng}
          onChangeText={setFromLng}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="To (jagah ka naam)"
        value={toLabel}
        onChangeText={setToLabel}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="To Lat"
          keyboardType="numeric"
          value={toLat}
          onChangeText={setToLat}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="To Lng"
          keyboardType="numeric"
          value={toLng}
          onChangeText={setToLng}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Departure (YYYY-MM-DDTHH:mm)"
        value={departureAt}
        onChangeText={setDepartureAt}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Seats"
          keyboardType="number-pad"
          value={totalSeats}
          onChangeText={setTotalSeats}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Price/seat (₹)"
          keyboardType="numeric"
          value={pricePerSeat}
          onChangeText={setPricePerSeat}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={publish} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publish Ride</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  warn: { color: "#c0392b", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  half: { flex: 1 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#00857a", borderColor: "#00857a" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#00857a",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
