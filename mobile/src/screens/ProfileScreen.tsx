import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Vehicle, VehicleType } from "../types";

export default function ProfileScreen() {
  const { user, refreshMe } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [type, setType] = useState<VehicleType>("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [seatCount, setSeatCount] = useState("4");

  function loadVehicles() {
    api.get("/vehicles/mine").then(({ data }) => setVehicles(data.vehicles));
  }

  useEffect(loadVehicles, []);

  async function addVehicle() {
    try {
      await api.post("/vehicles", {
        type,
        make,
        model,
        color,
        plateNumber,
        seatCount: Number(seatCount),
      });
      setShowAdd(false);
      setMake("");
      setModel("");
      setColor("");
      setPlateNumber("");
      loadVehicles();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.error ?? err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.phone}>{user?.phone}</Text>
      <Text style={styles.rating}>
        ⭐ {user?.ratingAvg.toFixed(1)} ({user?.ratingCount} reviews)
      </Text>

      <Text style={styles.sectionTitle}>Mere Vehicles</Text>
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <Text>
              {item.type === "CAR" ? "🚗" : "🏍️"} {item.make} {item.model} ·{" "}
              {item.color}
            </Text>
            <Text style={styles.dim}>
              {item.plateNumber} · {item.seatCount} seats
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.dim}>Koi vehicle nahi</Text>}
      />

      {showAdd ? (
        <View style={styles.form}>
          <View style={styles.row}>
            {(["CAR", "BIKE"] as VehicleType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={type === t ? styles.chipTextActive : styles.chipText}>
                  {t === "CAR" ? "🚗 Car" : "🏍️ Bike"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Make (e.g. Maruti)" value={make} onChangeText={setMake} />
          <TextInput style={styles.input} placeholder="Model (e.g. Swift)" value={model} onChangeText={setModel} />
          <TextInput style={styles.input} placeholder="Color" value={color} onChangeText={setColor} />
          <TextInput style={styles.input} placeholder="Plate number" value={plateNumber} onChangeText={setPlateNumber} />
          <TextInput
            style={styles.input}
            placeholder="Seats (driver ke alawa)"
            keyboardType="number-pad"
            value={seatCount}
            onChangeText={setSeatCount}
          />
          <TouchableOpacity style={styles.button} onPress={addVehicle}>
            <Text style={styles.buttonText}>Save Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => setShowAdd(true)}>
          <Text style={styles.buttonText}>+ Vehicle Add Karo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  name: { fontSize: 22, fontWeight: "700" },
  phone: { color: "#666" },
  rating: { marginTop: 4, marginBottom: 20 },
  sectionTitle: { fontSize: 14, color: "#999", marginBottom: 8 },
  vehicleCard: { backgroundColor: "#f7f7f7", borderRadius: 8, padding: 12, marginBottom: 8 },
  dim: { color: "#888", fontSize: 12 },
  form: { marginTop: 12 },
  row: { flexDirection: "row", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    marginTop: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
