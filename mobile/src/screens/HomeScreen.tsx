import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const actions: { label: string; screen: keyof RootStackParamList }[] = [
    { label: "🔍 Ride Search Karo", screen: "Search" },
    { label: "📢 Ride Publish Karo (Driver)", screen: "PublishRide" },
    { label: "🚘 Mere Published Rides", screen: "DriverRides" },
    { label: "🎟️ Meri Bookings", screen: "MyBookings" },
    { label: "👤 Profile", screen: "Profile" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Namaste, {user?.name ?? "Rider"} 👋</Text>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.screen}
          style={styles.card}
          onPress={() => navigation.navigate(a.screen as any)}
        >
          <Text style={styles.cardText}>{a.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  greeting: { fontSize: 22, fontWeight: "700", marginBottom: 24 },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 18,
    marginBottom: 14,
  },
  cardText: { fontSize: 16, fontWeight: "500" },
  logout: { marginTop: 24, alignItems: "center" },
  logoutText: { color: "#c0392b", fontWeight: "600" },
});
