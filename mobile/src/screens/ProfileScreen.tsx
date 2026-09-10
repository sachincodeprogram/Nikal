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
import { BikeIcon, CarIcon, PlusCircleIcon, StarIcon } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, radii, shadow, spacing } from "../theme";
import { Vehicle, VehicleType } from "../types";

export default function ProfileScreen() {
  const { user, refreshMe } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [type, setType] = useState<VehicleType>("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [seats, setSeats] = useState("4");

  function loadVehicles() {
    api.get("/vehicles").then(({ data }) => setVehicles(data));
  }

  useEffect(loadVehicles, []);

  async function addVehicle() {
    try {
      await api.post("/vehicles", { type, make, model, color, plateNo, seats: Number(seats) });
      setShowAdd(false);
      setMake("");
      setModel("");
      setColor("");
      setPlateNo("");
      loadVehicles();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message ?? err.message);
    }
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.container}
      data={vehicles}
      keyExtractor={(v) => v._id}
      ListHeaderComponent={
        <>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name ?? "?").charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
              <View style={styles.ratingRow}>
                <StarIcon size={14} />
                <Text style={styles.ratingText}>
                  {user?.avgRating?.toFixed(1) ?? "0.0"} · {user?.ratingCount ?? 0} reviews
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>My Vehicles</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.vehicleCard}>
          <View style={[styles.vehicleBadge, { backgroundColor: item.type === "BIKE" ? colors.amberTint : colors.accentTint }]}>
            {item.type === "BIKE" ? (
              <BikeIcon size={21} color={colors.amberDark} />
            ) : (
              <CarIcon size={21} color={colors.accentDark} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>
              {item.make} {item.model} {item.color ? `· ${item.color}` : ""}
            </Text>
            <View style={styles.vehicleMetaRow}>
              <Text style={styles.plateChip}>{item.plateNo}</Text>
              <Text style={styles.seatText}>{item.seats} seats</Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.dim}>Koi vehicle nahi</Text>}
      ListFooterComponent={
        showAdd ? (
          <View style={styles.form}>
            <View style={styles.chipRow}>
              {(["CAR", "BIKE"] as VehicleType[]).map((t) => {
                const active = type === t;
                return (
                  <TouchableOpacity key={t} style={[styles.chip, active && styles.chipActive]} onPress={() => setType(t)}>
                    {t === "CAR" ? (
                      <CarIcon size={16} color={active ? colors.white : colors.accent} />
                    ) : (
                      <BikeIcon size={16} color={active ? colors.white : colors.accent} />
                    )}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t === "CAR" ? "Car" : "Bike"}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.input} placeholder="Make (e.g. Maruti)" placeholderTextColor={colors.ink300} value={make} onChangeText={setMake} />
            <TextInput style={styles.input} placeholder="Model (e.g. Swift)" placeholderTextColor={colors.ink300} value={model} onChangeText={setModel} />
            <TextInput style={styles.input} placeholder="Color" placeholderTextColor={colors.ink300} value={color} onChangeText={setColor} />
            <TextInput style={styles.input} placeholder="Plate number" placeholderTextColor={colors.ink300} value={plateNo} onChangeText={setPlateNo} />
            <TextInput
              style={styles.input}
              placeholder="Seats (driver ke alawa)"
              placeholderTextColor={colors.ink300}
              keyboardType="number-pad"
              value={seats}
              onChangeText={setSeats}
            />
            <TouchableOpacity style={styles.button} onPress={addVehicle}>
              <Text style={styles.buttonText}>Save Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(true)}>
            <PlusCircleIcon size={18} color={colors.ink700} />
            <Text style={styles.addButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingTop: spacing.xxl },
  userRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.white },
  name: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.ink900 },
  phone: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink500, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ratingText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink900 },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink500,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  vehicleBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  vehicleName: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink900 },
  vehicleMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 },
  plateChip: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.3,
    color: colors.ink700,
    backgroundColor: colors.ink100,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  seatText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.ink500 },
  dim: { fontFamily: fonts.semibold, color: colors.ink500, fontSize: 13 },
  form: { marginTop: spacing.sm },
  chipRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink700 },
  chipTextActive: { color: colors.white },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    marginBottom: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink900,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: "center",
    ...shadow.button,
  },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radii.md,
    paddingVertical: 14,
  },
  addButtonText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.ink700 },
});
