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
import { RootStackParamList } from "../navigation/RootNavigator";
import { VehicleType } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

// NOTE: for the MVP, from/to are plain lat/lng entered manually. Swap this
// for a places-autocomplete input (Google Places API) once an API key is
// available — that's the "Level 3 — Smart" step from the roadmap.
export default function SearchScreen({ navigation }: Props) {
  const [fromLat, setFromLat] = useState("");
  const [fromLng, setFromLng] = useState("");
  const [toLat, setToLat] = useState("");
  const [toLng, setToLng] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vehicleType, setVehicleType] = useState<VehicleType | undefined>();
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!fromLat || !fromLng || !toLat || !toLng) {
      Alert.alert("From/To coordinates bharna zaroori hai");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/rides/search", {
        params: {
          fromLat,
          fromLng,
          toLat,
          toLng,
          date,
          vehicleType,
          seats: 1,
        },
      });
      navigation.navigate("RideResults", { rides: data.rides });
    } catch (err: any) {
      Alert.alert("Search failed", err?.response?.data?.error ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Search</Text>

      <Text style={styles.label}>From (lat, lng)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Lat"
          keyboardType="numeric"
          value={fromLat}
          onChangeText={setFromLat}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Lng"
          keyboardType="numeric"
          value={fromLng}
          onChangeText={setFromLng}
        />
      </View>

      <Text style={styles.label}>To (lat, lng)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Lat"
          keyboardType="numeric"
          value={toLat}
          onChangeText={setToLat}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Lng"
          keyboardType="numeric"
          value={toLng}
          onChangeText={setToLng}
        />
      </View>

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />

      <Text style={styles.label}>Vehicle</Text>
      <View style={styles.row}>
        {(["CAR", "BIKE"] as VehicleType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.chip,
              vehicleType === t && styles.chipActive,
            ]}
            onPress={() =>
              setVehicleType(vehicleType === t ? undefined : t)
            }
          >
            <Text
              style={
                vehicleType === t ? styles.chipTextActive : styles.chipText
              }
            >
              {t === "CAR" ? "🚗 Car" : "🏍️ Bike"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={search} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Search</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 13, color: "#666", marginBottom: 4, marginTop: 8 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  half: { flex: 1 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
